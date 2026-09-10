'use client';

import React from 'react';

interface AIMessageRendererProps {
  content: string;
}

export default function AIMessageRenderer({ content }: AIMessageRendererProps) {
  if (!content) return null;

  // Split by double newline for paragraphs/blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-neutral-200">
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n');

        // Check if block is a list
        const isList = lines.every(l => l.trim().startsWith('•') || l.trim().startsWith('-') || /^\d+\./.test(l.trim()));

        if (isList) {
          return (
            <ul key={bIdx} className="space-y-1 my-1.5 pl-2">
              {lines.map((line, lIdx) => {
                const cleanedLine = line.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="text-[var(--accent-soft)] font-bold text-xs shrink-0 mt-0.5">•</span>
                    <span>{renderFormattedText(cleanedLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph with potential single line breaks
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderFormattedText(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Format markdown bold **text** and inline code `code`
 */
function renderFormattedText(text: string): React.ReactNode {
  // Regex to split by **bold** or `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-white">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-[var(--accent-soft)]">
          {inner}
        </code>
      );
    }
    return part;
  });
}
