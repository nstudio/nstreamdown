/**
 * MdParagraph Component
 * Renders a paragraph of text with inline formatting using FormattedString
 * for proper text flow and wrapping
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import type { StyleColors, StyleSpacing } from './streamdown';
import { buildFormattedString } from './formatted-string';

@Component({
  selector: 'MdParagraph',
  template: `
    <StackLayout [class]="styleSpacing().paragraph || 'mb-3'">
      <Label [formattedText]="formattedString()" textWrap="true" class="text-sm text-slate-700 dark:text-slate-300 leading-[3]" [color]="styleColors().text" ignoreTouchAnimation="true"></Label>
    </StackLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdParagraph {
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

  formattedString = computed(() => buildFormattedString(this.displayTokens(), this.styleColors()));
}
