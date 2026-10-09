'use client';

import React from 'react';
import Link from 'next/link';

interface AIMessageRendererProps {
  content: string;
}

export default function AIMessageRenderer({ content }: AIMessageRendererProps) {
  if (!content) return null;

  const parsedBlocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-neutral-200">
      {parsedBlocks.map((block, bIdx) => {
        switch (block.type) {
          case 'table':
            return renderTable(block.headers, block.rows, bIdx);
          case 'heading':
            return renderHeading(block.level, block.text, bIdx);
          case 'hr':
            return (
              <hr
                key={bIdx}
                className="border-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3.5"
              />
            );
          case 'blockquote':
            return (
              <blockquote
                key={bIdx}
                className="border-l-2 border-[var(--accent)] pl-3.5 py-1.5 my-2.5 bg-white/[0.02] rounded-r-xl italic text-neutral-300 text-xs sm:text-sm"
              >
                {renderFormattedInline(block.text)}
              </blockquote>
            );
          case 'codeblock':
            return (
              <pre
                key={bIdx}
                className="p-3.5 rounded-2xl bg-black/70 border border-white/15 font-mono text-xs overflow-x-auto text-neutral-200 my-2.5"
              >
                <code>{block.text}</code>
              </pre>
            );
          case 'list':
            return (
              <ul key={bIdx} className="space-y-1.5 my-2 pl-1">
                {block.items.map((item, lIdx) => (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="text-[var(--accent-soft)] font-bold text-xs shrink-0 mt-0.5 select-none">
                      •
                    </span>
                    <div className="flex-1 leading-relaxed">
                      {renderFormattedInline(item)}
                    </div>
                  </li>
                ))}
              </ul>
            );
          case 'ordered-list':
            return (
              <ol key={bIdx} className="space-y-1.5 my-2 pl-1">
                {block.items.map((item, lIdx) => (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="px-1.5 py-0.2 rounded-md bg-white/[0.08] text-[var(--accent-soft)] font-mono text-[10px] font-bold shrink-0 mt-0.5 select-none">
                      {lIdx + 1}
                    </span>
                    <div className="flex-1 leading-relaxed">
                      {renderFormattedInline(item)}
                    </div>
                  </li>
                ))}
              </ol>
            );
          case 'paragraph':
          default:
            return (
              <p key={bIdx} className="leading-relaxed">
                {renderFormattedInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Block Parsing Engine
// ─────────────────────────────────────────────────────────────

type MarkdownBlock =
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'heading'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'blockquote'; text: string }
  | { type: 'codeblock'; language?: string; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseMarkdownBlocks(rawText: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Code Block (``` ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'codeblock', language: lang, text: codeLines.join('\n') });
      continue;
    }

    // 3. Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 4. Headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      i++;
      continue;
    }

    // 5. Blockquote (> text)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    // 6. Markdown Table (| header | header |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
        // Check if second line is separator (|---|---|)
        const isSep = /^\|(\s*:?-+:?\s*\|)+$/.test(tableLines[1]);
        const dataLines = isSep ? tableLines.slice(2) : tableLines.slice(1);
        const rows = dataLines.map(rowLine =>
          rowLine.split('|').slice(1, -1).map(c => c.trim())
        );

        blocks.push({
          type: 'table',
          headers: rawHeaders,
          rows
        });
        continue;
      }
    }

    // 7. Unordered List (•, -, *)
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[•\-\*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[•\-\*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // 8. Ordered List (1., 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    // 9. Regular Paragraph (gather lines until blank line or new block indicator)
    const pLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const nextTrim = lines[i].trim();
      if (
        !nextTrim ||
        nextTrim.startsWith('```') ||
        /^(\-{3,}|\*{3,}|_{3,})$/.test(nextTrim) ||
        /^#{1,4}\s+/.test(nextTrim) ||
        nextTrim.startsWith('>') ||
        (nextTrim.startsWith('|') && nextTrim.endsWith('|')) ||
        /^[•\-\*]\s+/.test(nextTrim) ||
        /^\d+\.\s+/.test(nextTrim)
      ) {
        break;
      }
      pLines.push(lines[i]);
      i++;
    }

    blocks.push({ type: 'paragraph', text: pLines.join('\n') });
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────
// HTML & Inline Markdown Formatting
// ─────────────────────────────────────────────────────────────

function renderTable(headers: string[], rows: string[][], key: number) {
  return (
    <div
      key={key}
      className="overflow-x-auto my-3 rounded-2xl border border-white/15 bg-white/[0.03] shadow-lg"
    >
      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">
        {headers && headers.length > 0 && (
          <thead className="bg-white/[0.08] border-b border-white/10 text-white font-bold font-mono">
            <tr>
              {headers.map((h, hIdx) => (
                <th
                  key={hIdx}
                  className="py-2.5 px-3.5 whitespace-nowrap text-[var(--accent-soft)] tracking-wider text-[11px] uppercase"
                >
                  {renderFormattedInline(h)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-white/[0.04] transition-colors odd:bg-transparent even:bg-white/[0.01]"
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="py-2.5 px-3.5 text-neutral-200 align-top leading-relaxed text-xs sm:text-sm"
                >
                  {renderFormattedInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderHeading(level: number, text: string, key: number) {
  switch (level) {
    case 1:
      return (
        <h2
          key={key}
          className="text-base sm:text-lg font-black text-white mt-3.5 mb-1.5 flex items-center gap-2"
        >
          {renderFormattedInline(text)}
        </h2>
      );
    case 2:
      return (
        <h3
          key={key}
          className="text-sm sm:text-base font-bold text-white mt-3 mb-1 flex items-center gap-2"
        >
          {renderFormattedInline(text)}
        </h3>
      );
    case 3:
      return (
        <h4
          key={key}
          className="text-xs sm:text-sm font-bold text-[var(--accent-soft)] mt-2.5 mb-1 font-mono uppercase tracking-wider flex items-center gap-1.5"
        >
          {renderFormattedInline(text)}
        </h4>
      );
    case 4:
    default:
      return (
        <h5
          key={key}
          className="text-xs font-semibold text-neutral-200 mt-2 mb-0.5"
        >
          {renderFormattedInline(text)}
        </h5>
      );
  }
}

/**
 * Format inline elements:
 * - <br>, <br/>, <br /> tags
 * - Links: [Text](URL)
 * - Bold: **text**
 * - Italic: *text* or _text_
 * - Code: `code`
 * - Regular text with newlines
 */
function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return null;

  // 1. Normalize linebreaks: split by <br>, <br/>, <br />, or \n
  const lineParts = text.split(/(<br\s*\/?>|\n)/gi);

  return lineParts.map((linePart, lIdx) => {
    if (/^<br\s*\/?>$/i.test(linePart) || linePart === '\n') {
      return <br key={`br-${lIdx}`} />;
    }

    return (
      <React.Fragment key={`lp-${lIdx}`}>
        {renderInlineSpans(linePart)}
      </React.Fragment>
    );
  });
}

function renderInlineSpans(text: string): React.ReactNode {
  // Tokenize markdown links [text](url), bold **bold**, code `code`, italic *italic*
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    // 1. Link: [Text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2].trim();
      const isInternal = linkUrl.startsWith('/');

      if (isInternal) {
        return (
          <Link
            key={idx}
            href={linkUrl}
            className="text-[var(--accent-soft)] underline underline-offset-2 hover:text-white font-semibold transition-colors inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
            <i className="fas fa-arrow-up-right-from-square text-[8px] opacity-70" />
          </Link>
        );
      }

      return (
        <a
          key={idx}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-soft)] underline underline-offset-2 hover:text-white font-semibold transition-colors inline-flex items-center gap-0.5"
        >
          <span>{linkText}</span>
          <i className="fas fa-arrow-up-right-from-square text-[8px] opacity-70" />
        </a>
      );
    }

    // 2. Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-white">
          {inner}
        </strong>
      );
    }

    // 3. Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-xs text-[var(--accent-soft)]"
        >
          {inner}
        </code>
      );
    }

    // 4. Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-neutral-200">
          {inner}
        </em>
      );
    }

    return part;
  });
}
