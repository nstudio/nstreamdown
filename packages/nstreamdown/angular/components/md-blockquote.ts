/**
 * MdBlockquote Component
 * Renders blockquotes with left border styling
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import { openUrl } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdBlockquote',
  template: `
    <GridLayout columns="4, *" class="my-3 pl-2">
      <!-- Left border -->
      <StackLayout col="0" class="bg-slate-300 dark:bg-slate-600 rounded-full w-1"></StackLayout>

      <!-- Content with inline formatting -->
      <FlexboxLayout col="1" class="pl-3" flexWrap="wrap" alignItems="center">
        @for (token of displayTokens(); track $index) {
          @switch (token.type) {
            @case ('text') {
              <Label [text]="token.content" class="text-sm text-slate-500 dark:text-slate-400 italic leading-[3]" textWrap="true"></Label>
            }
            @case ('bold') {
              <Label [text]="token.content" class="text-sm text-slate-600 dark:text-slate-300 font-bold italic leading-[3]" textWrap="true"></Label>
            }
            @case ('italic') {
              <Label [text]="token.content" class="text-sm text-slate-500 dark:text-slate-400 italic leading-[3]" textWrap="true"></Label>
            }
            @case ('code-inline') {
              <Label [text]="token.content" class="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-pink-600 dark:text-pink-400 rounded px-1" textWrap="true"></Label>
            }
            @case ('link') {
              <Label [text]="token.content" class="text-sm text-blue-600 dark:text-blue-400 italic leading-[3]" textDecoration="underline" (tap)="onLinkTap(token)" textWrap="true"></Label>
            }
          }
        }
      </FlexboxLayout>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdBlockquote {
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

  onLinkTap(token: MarkdownToken) {
    const url = token.metadata?.['url'] as string;
    if (url && url !== 'streamdown:incomplete-link') {
      openUrl(url);
    }
  }
}
