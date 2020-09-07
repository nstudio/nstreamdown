/**
 * MdParagraph Component
 * Renders a paragraph of text with inline formatting using FormattedString
 * for proper text flow and wrapping
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input, signal, effect } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { FormattedString, Span, Label, Color } from '@nativescript/core';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import { openUrl } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdParagraph',
  template: `
    <StackLayout class="mb-3">
      <Label [formattedText]="formattedString()" textWrap="true" class="text-sm text-slate-700 dark:text-slate-300 leading-[3]" (tap)="onTap($event)"></Label>
    </StackLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdParagraph {
  content = input('');
  children = input<MarkdownToken[]>([]);

  // Store link metadata for tap handling
  private linkUrls: Map<number, string> = new Map();

  displayTokens = computed(() => {
    const kids = this.children();
    const txt = this.content();
    if (kids && kids.length > 0) {
      return kids;
    } else if (txt) {
      return parseInlineFormatting(txt);
    }
    return [];
  });

  formattedString = computed(() => {
    const tokens = this.displayTokens();
    const fs = new FormattedString();
    this.linkUrls.clear();

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
          span.color = new Color('#94a3b8'); // slate-400
          break;
        case 'code-inline':
          span.fontFamily = 'monospace';
          span.backgroundColor = new Color('#f1f5f9'); // slate-100
          span.color = new Color('#db2777'); // pink-600
          break;
        case 'link':
          span.color = new Color('#2563eb'); // blue-600
          span.textDecoration = 'underline';
          // Store the URL for this span index
          const url = token.metadata?.['url'] as string;
          if (url && url !== 'streamdown:incomplete-link') {
            this.linkUrls.set(index, url);
          }
          break;
        case 'math-inline':
          span.fontFamily = 'monospace';
          span.color = new Color('#7c3aed'); // purple-600
          break;
        default:
          // text - use default styling
          break;
      }

      fs.spans.push(span);
    });

    return fs;
  });

  onTap(args: any) {
    // Handle link taps by checking which span was tapped
    // For now, if there's only one link, open it
    if (this.linkUrls.size === 1) {
      const url = this.linkUrls.values().next().value;
      if (url) {
        openUrl(url);
      }
    }
    // TODO: For multiple links, we'd need to determine which span was tapped
    // This would require native touch handling to get the tapped character position
  }

  onLinkTap(token: MarkdownToken) {
    const url = token.metadata?.['url'] as string;
    if (url && url !== 'streamdown:incomplete-link') {
      openUrl(url);
    }
  }
}
