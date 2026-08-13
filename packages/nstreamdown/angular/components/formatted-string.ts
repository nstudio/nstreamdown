/**
 * Shared FormattedString construction for inline markdown token runs.
 * Inline runs must render as spans within a single Label — separate Labels
 * cannot flow mid-text, so mixed formatting (e.g. a bold lead-in) would
 * otherwise wrap onto its own line.
 */
import { FormattedString, Span, Color } from '@nativescript/core';
import { MarkdownToken } from '@nstudio/nstreamdown';
import type { StyleColors } from './streamdown';

/**
 * Builds a FormattedString from inline tokens. When `linkUrls` is provided it
 * is cleared and repopulated with span index → url for tap handling.
 */
export function buildFormattedString(tokens: MarkdownToken[], colors: StyleColors, linkUrls?: Map<number, string>): FormattedString {
  const fs = new FormattedString();
  linkUrls?.clear();

  tokens.forEach((token, index) => {
    const span = new Span();
    span.text = token.content;

    switch (token.type) {
      case 'bold':
        span.fontWeight = 'bold';
        break;
      case 'italic':
        span.fontStyle = 'italic';
        break;
      case 'bold-italic':
        span.fontWeight = 'bold';
        span.fontStyle = 'italic';
        break;
      case 'strikethrough':
        span.textDecoration = 'line-through';
        span.color = new Color(colors.strikethrough || '#94a3b8'); // slate-400
        break;
      case 'code-inline':
        span.fontFamily = 'monospace';
        span.backgroundColor = new Color('#f1f5f9'); // slate-100
        span.color = new Color(colors.codeInline || '#db2777'); // pink-600
        break;
      case 'link':
        span.color = new Color(colors.link || '#2563eb'); // blue-600
        span.textDecoration = 'underline';
        const url = token.metadata?.['url'] as string;
        if (url && url !== 'streamdown:incomplete-link') {
          linkUrls?.set(index, url);
        }
        break;
      case 'math-inline':
        span.fontFamily = 'monospace';
        span.color = new Color(colors.mathInline || '#7c3aed'); // purple-600
        break;
      default:
        // text - use default styling
        break;
    }

    fs.spans.push(span);
  });

  return fs;
}
