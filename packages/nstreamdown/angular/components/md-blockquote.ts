/**
 * MdBlockquote Component
 * Renders blockquotes with left border styling
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import { buildFormattedString } from './formatted-string';
import type { StyleColors, StyleSpacing } from './streamdown';

@Component({
  selector: 'MdBlockquote',
  template: `
    <GridLayout columns="4, *" [class]="styleSpacing().blockquote || 'my-3 pl-2'">
      <!-- Left border -->
      <StackLayout col="0" class="bg-slate-300 dark:bg-slate-600 rounded-full w-1"></StackLayout>

      <!-- Single Label so inline runs (links, code, bold) flow and wrap as
           continuous text; separate Labels per run cannot flow mid-text. -->
      <Label col="1" [formattedText]="quoteFormatted()" textWrap="true" class="pl-3 text-sm text-slate-500 dark:text-slate-400 leading-[3]" [color]="styleColors().text" ignoreTouchAnimation="true"></Label>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdBlockquote {
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

  quoteFormatted = computed(() => buildFormattedString(this.displayTokens(), this.styleColors(), { italic: true }));
}
