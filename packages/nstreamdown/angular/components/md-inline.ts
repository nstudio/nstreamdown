/**
 * MdInline Component
 * Renders inline formatted text spans (bold, italic, code, links)
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, input, output } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken } from '@nstudio/nstreamdown';
import { openUrl } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdInline',
  template: `
    @for (token of tokens(); track $index) {
      @switch (token.type) {
        @case ('text') {
          <Label [text]="token.content" class="text-sm text-slate-700 leading-[3]" textWrap="true"></Label>
        }
        @case ('bold') {
          <Label [text]="token.content" class="text-sm text-slate-800 font-bold leading-[3]" textWrap="true"></Label>
        }
        @case ('italic') {
          <Label [text]="token.content" class="text-sm text-slate-700 italic leading-[3]" textWrap="true"></Label>
        }
        @case ('bold-italic') {
          <Label [text]="token.content" class="text-sm text-slate-800 font-bold italic leading-[3]" textWrap="true"></Label>
        }
        @case ('strikethrough') {
          <Label [text]="token.content" class="text-sm text-slate-400 line-through leading-[3]" textWrap="true"></Label>
        }
        @case ('code-inline') {
          <Label [text]="token.content" class="text-xs font-mono bg-slate-100 rounded px-1 py-0.5 text-pink-600" textWrap="true"></Label>
        }
        @case ('link') {
          <Label [text]="token.content" class="text-sm text-blue-600 underline leading-[3]" (tap)="onLinkTap(token)" textWrap="true"></Label>
        }
        @case ('image') {
          <Image [src]="token.metadata?.['url']" class="w-full h-48" stretch="aspectFit"></Image>
        }
        @case ('math-inline') {
          <Label [text]="token.content" class="text-sm font-mono text-purple-700 bg-purple-50 rounded px-1" textWrap="true"></Label>
        }
      }
    }
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdInline {
  tokens = input<MarkdownToken[]>([]);
  linkTap = output<string>();

  onLinkTap(token: MarkdownToken) {
    const url = token.metadata?.['url'] as string;
    if (url && url !== 'streamdown:incomplete-link') {
      this.linkTap.emit(url);
      openUrl(url);
    }
  }
}
