/**
 * EnMate Blog Content Processor & Paste Normalizer
 * Automatically converts raw markdown or sanitizes rich text pasted from
 * ChatGPT, Claude, Notion, Google Docs, or Word into semantic HTML.
 */

export function convertMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // 1. Normalize line endings
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Code blocks (```lang ... ```)
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code>${escaped.trim()}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 4. Headings
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>'); // Normalize H1 to H2 for article hierarchy

  // 5. Blockquotes (> quote)
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // 6. Highlights (==text== or ::text::)
  html = html.replace(/==([^=]+)==/g, '<mark class="blog-highlight">$1</mark>');
  html = html.replace(/::([^:]+)::/g, '<mark class="blog-highlight">$1</mark>');

  // 7. Bold & Italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 8. Horizontal Rules (--- or ***)
  html = html.replace(/^(\s*[-*_]\s*){3,}$/gim, '<hr />');

  // 9. Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 10. Process Lists & Paragraphs line by line
  const lines = html.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check Unordered List (- item or * item)
    const ulMatch = line.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push('<ul>');
        inUl = true;
      }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Check Ordered List (1. item)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push('<ol>');
        inOl = true;
      }
      result.push(`<li>${olMatch[2]}</li>`);
      continue;
    }

    // Close any open lists if non-list line
    if (inUl) {
      result.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      result.push('</ol>');
      inOl = false;
    }

    // Pass through empty lines or HTML block tags
    if (!line) {
      continue;
    }

    if (
      line.startsWith('<h2') ||
      line.startsWith('<h3') ||
      line.startsWith('<h4') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<pre') ||
      line.startsWith('<hr') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<table') ||
      line.startsWith('<div')
    ) {
      result.push(line);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('\n');
}

/**
 * Clean and sanitize pasted rich text from ChatGPT, Word, Google Docs, Notion
 */
export function sanitizePastedHTML(html: string): string {
  if (!html) return '';

  // 1. Remove MS Word conditional comments & meta tags
  let clean = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<xml[\s\S]*?<\/xml>/gi, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '');

  // 2. Strip intrusive inline styles & classes from external sources
  clean = clean.replace(/\s+style="[^"]*"/gi, '');
  clean = clean.replace(/\s+class="[^"]*"/gi, '');
  clean = clean.replace(/\s+id="[^"]*"/gi, '');
  clean = clean.replace(/\s+dir="[^"]*"/gi, '');
  clean = clean.replace(/\s+lang="[^"]*"/gi, '');

  // 3. Normalize tags
  clean = clean.replace(/<b(\s+[^>]*)?>/gi, '<strong>');
  clean = clean.replace(/<\/b>/gi, '</strong>');
  clean = clean.replace(/<i(\s+[^>]*)?>/gi, '<em>');
  clean = clean.replace(/<\/i>/gi, '</em>');
  clean = clean.replace(/<h1(\s+[^>]*)?>/gi, '<h2>');
  clean = clean.replace(/<\/h1>/gi, '</h2>');

  // 4. Remove empty tags (e.g. <p></p>, <span></span>, <div></div>)
  clean = clean.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');
  clean = clean.replace(/<p\s*>\s*(&nbsp;|\s)*<\/p>/gi, '');
  clean = clean.replace(/<div>([\s\S]*?)<\/div>/gi, '<p>$1</p>');

  return clean.trim();
}

/**
 * Master Paste Processor: Detects if input is Markdown or Rich HTML and outputs clean HTML
 */
export function processPastedContent(clipboardData: DataTransfer): string {
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');

  // Check if plain text looks like Markdown
  const isMarkdown =
    /^#{1,6}\s+/m.test(text) ||
    /^\s*[-*•]\s+/m.test(text) ||
    /^\s*\d+\.\s+/m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /```[\s\S]*?```/.test(text) ||
    /==[^=]+==/.test(text) ||
    /^\s*>\s+/m.test(text);

  if (isMarkdown || !html) {
    return convertMarkdownToHTML(text);
  }

  // If rich HTML is present, sanitize and normalize it
  return sanitizePastedHTML(html);
}
