/**
 * MdHeading Component
 * Renders H1-H6 headings with appropriate styling
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import type { StyleColors, StyleSpacing } from './streamdown';

@Component({
  selector: 'MdHeading',
  template: `
    <FlexboxLayout [class]="headingClass()" [color]="styleColors().text" flexWrap="wrap" alignItems="center">
      @for (token of displayTokens(); track $index) {
        @switch (token.type) {
          @case ('text') {
            <Label [text]="token.content" class="font-bold" textWrap="true"></Label>
          }
          @case ('bold') {
            <Label [text]="token.content" class="font-bold" textWrap="true"></Label>
          }
          @case ('italic') {
            <Label [text]="token.content" class="font-bold italic" textWrap="true"></Label>
          }
          @case ('code-inline') {
            <Label [text]="token.content" class="font-mono font-bold bg-gray-200 dark:bg-slate-700 text-pink-600 dark:text-pink-400 rounded px-1" [color]="styleColors().codeInline" textWrap="true"></Label>
          }
        }
      }
    </FlexboxLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdHeading {
  level = input<1 | 2 | 3 | 4 | 5 | 6>(1);
  content = input('');
  children = input<MarkdownToken[]>([]);
  styleColors = input<StyleColors>({ text: null, link: null, codeInline: null, strikethrough: null, mathInline: null });
  styleSpacing = input<StyleSpacing>({ paragraph: null, heading: null, list: null, blockquote: null, codeBlock: null, image: null, horizontalRule: null, table: null, mathBlock: null });

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

  headingClass = computed(() => {
    const colorClass = this.styleColors().text ? '' : 'text-slate-800 dark:text-slate-100';
    const spacingClass = this.styleSpacing().heading || 'mt-4 mb-2';
    const baseClass = `font-bold ${colorClass} ${spacingClass} leading-[3]`;
    const sizeClasses: Record<number, string> = {
      1: 'text-2xl',
      2: 'text-xl',
      3: 'text-lg',
      4: 'text-base',
      5: 'text-sm',
      6: 'text-xs',
    };
    return `${baseClass} ${sizeClasses[this.level()]}`;
  });
}
