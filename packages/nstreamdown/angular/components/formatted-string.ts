/**
 * Shared FormattedString construction for inline markdown token runs.
 * Inline runs must render as spans within a single Label — separate Labels
 * cannot flow mid-text, so mixed formatting (e.g. a bold lead-in) would
 * otherwise wrap onto its own line.
 */
import { FormattedString, Span, Color } from '@nativescript/core';
import { MarkdownToken, openUrl } from '@nstudio/nstreamdown';
import type { StyleColors } from './streamdown';

export interface FormattedStringOptions {
  /** Italicise every span (a blockquote); the markdown italic token still applies on top. */
  italic?: boolean;
}

/**
 * Builds a FormattedString from inline tokens. Link spans open their own URL:
 * `linkTap` is the event that makes a Span tappable, so a block may hold any
 * number of links and the Label itself needs no tap handler.
 */
export function buildFormattedString(tokens: MarkdownToken[], colors: StyleColors, options: FormattedStringOptions = {}): FormattedString {
  const fs = new FormattedString();

  for (const token of tokens) {
    const span = new Span();
    span.text = token.content;
    if (options.italic) {
      span.fontStyle = 'italic';
    }

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
        // a translucent slate reads as a chip on light and dark surfaces alike
        span.backgroundColor = new Color('rgba(148, 163, 184, 0.2)');
        span.color = new Color(colors.codeInline || '#db2777'); // pink-600
        break;
      case 'link': {
        span.color = new Color(colors.link || '#2563eb'); // blue-600
        span.textDecoration = 'underline';
        const url = token.metadata?.['url'] as string;
        if (url && url !== 'streamdown:incomplete-link') {
          span.on(Span.linkTapEvent, () => openUrl(url));
        }
        break;
      }
      case 'math-inline':
        span.fontFamily = 'monospace';
        span.color = new Color(colors.mathInline || '#7c3aed'); // purple-600
        break;
      default:
        // text - use default styling
        break;
    }

    fs.spans.push(span);
  }

  return fs;
}
