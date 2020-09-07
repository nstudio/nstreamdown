/**
 * MdHeading Component
 * Renders H1-H6 headings with appropriate styling
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdHeading',
  template: `
    <FlexboxLayout [class]="headingClass()" flexWrap="wrap" alignItems="center">
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
            <Label [text]="token.content" class="font-mono font-bold bg-gray-200 dark:bg-slate-700 text-pink-600 dark:text-pink-400 rounded px-1" textWrap="true"></Label>
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
    const baseClass = 'font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2 leading-[3]';
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
