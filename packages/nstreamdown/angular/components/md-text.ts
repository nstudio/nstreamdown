/**
 * MdText Component
 * Renders inline formatted text with bold, italic, code, links, etc.
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdText',
  template: `
    <FormattedString>
      @for (token of displayTokens(); track $index) {
        <Span [text]="token.content" [class]="getTokenClass(token)" [fontWeight]="isBold(token) ? 'bold' : 'normal'" [fontStyle]="isItalic(token) ? 'italic' : 'normal'" [textDecoration]="isStrikethrough(token) ? 'line-through' : 'none'"></Span>
      }
    </FormattedString>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdText {
  text = input('');
  tokens = input<MarkdownToken[]>([]);

  displayTokens = computed(() => {
    const t = this.tokens();
    if (t.length > 0) return t;
    const txt = this.text();
    return txt ? parseInlineFormatting(txt) : [];
  });

  getTokenClass(token: MarkdownToken): string {
    const classes: string[] = [];
    switch (token.type) {
      case 'bold':
        classes.push('font-bold');
        break;
      case 'italic':
        classes.push('font-italic');
        break;
      case 'bold-italic':
        classes.push('font-bold', 'font-italic');
        break;
      case 'code-inline':
        classes.push('bg-gray-200', 'font-mono', 'text-sm', 'rounded', 'px-1');
        break;
      case 'link':
        classes.push('text-blue-600', 'underline');
        break;
      case 'strikethrough':
        classes.push('line-through');
        break;
    }
    return classes.join(' ');
  }

  isBold(token: MarkdownToken): boolean {
    return token.type === 'bold' || token.type === 'bold-italic';
  }

  isItalic(token: MarkdownToken): boolean {
    return token.type === 'italic' || token.type === 'bold-italic';
  }

  isStrikethrough(token: MarkdownToken): boolean {
    return token.type === 'strikethrough';
  }
}
