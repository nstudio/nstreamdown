/**
 * MdList Component
 * Renders ordered and unordered lists, including GFM task lists
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken } from '@nstudio/nstreamdown';
import { openUrl } from '@nstudio/nstreamdown';
import { MdCheckbox } from './md-checkbox';

@Component({
  selector: 'MdList',
  template: `
    <StackLayout class="my-2 pl-2">
      @for (item of items(); track $index; let i = $index) {
        <GridLayout [columns]="isTaskItem(item) ? 'auto, auto, *' : 'auto, *'" class="py-0.5">
          <!-- Bullet or number (not shown for task items) -->
          @if (!isTaskItem(item)) {
            <Label col="0" [text]="getBullet(i, item)" class="text-sm text-slate-500 dark:text-slate-400 pr-2 w-6"></Label>
          }

          <!-- Checkbox for task items -->
          @if (isTaskItem(item)) {
            <MdCheckbox col="0" [checked]="isChecked(item)"></MdCheckbox>
          }

          <!-- Content with inline formatting -->
          <FlexboxLayout [col]="isTaskItem(item) ? 1 : 1" flexWrap="wrap" alignItems="center">
            @for (token of item.children || []; track $index) {
              @switch (token.type) {
                @case ('text') {
                  <Label [text]="token.content" [class]="'text-sm leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')" textWrap="true"></Label>
                }
                @case ('bold') {
                  <Label [text]="token.content" [class]="'text-sm font-bold leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')" textWrap="true"></Label>
                }
                @case ('italic') {
                  <Label [text]="token.content" [class]="'text-sm italic leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')" textWrap="true"></Label>
                }
                @case ('bold-italic') {
                  <Label [text]="token.content" [class]="'text-sm font-bold italic leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')" textWrap="true"></Label>
                }
                @case ('strikethrough') {
                  <Label [text]="token.content" class="text-sm text-slate-400 dark:text-slate-500 leading-[3]" textDecoration="line-through" textWrap="true"></Label>
                }
                @case ('code-inline') {
                  <Label [text]="token.content" class="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-pink-600 dark:text-pink-400 rounded px-1" textWrap="true"></Label>
                }
                @case ('link') {
                  <Label [text]="token.content" class="text-sm text-blue-600 dark:text-blue-400 leading-[3]" textDecoration="underline" (tap)="onLinkTap(token)" textWrap="true"></Label>
                }
              }
            }
            <!-- Fallback if no children -->
            @if (!item.children || item.children.length === 0) {
              <Label [text]="item.content" [class]="'text-sm leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')" textWrap="true"></Label>
            }
          </FlexboxLayout>
        </GridLayout>
      }
    </StackLayout>
  `,
  imports: [NativeScriptCommonModule, MdCheckbox],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdList {
  ordered = input(false);
  items = input<MarkdownToken[]>([]);

  isTaskItem(item: MarkdownToken): boolean {
    return item.metadata?.['isTask'] === true;
  }

  isChecked(item: MarkdownToken): boolean {
    return item.metadata?.['isChecked'] === true;
  }

  getBullet(index: number, item: MarkdownToken): string {
    if (this.ordered()) {
      const num = item.metadata?.['number'] ?? index + 1;
      return `${num}.`;
    }
    return '•';
  }

  onLinkTap(token: MarkdownToken) {
    const url = token.metadata?.['url'] as string;
    if (url && url !== 'streamdown:incomplete-link') {
      openUrl(url);
    }
  }
}
