/**
 * MdList Component
 * Renders ordered and unordered lists, including GFM task lists
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken } from '@nstudio/nstreamdown';
import type { StyleColors, StyleSpacing } from './streamdown';
import { MdCheckbox } from './md-checkbox';
import { buildFormattedString } from './formatted-string';

@Component({
  selector: 'MdList',
  template: `
    <StackLayout [class]="styleSpacing().list || 'my-2 pl-2'">
      @for (item of items(); track $index; let i = $index) {
        <GridLayout [columns]="isTaskItem(item) ? 'auto, auto, *' : 'auto, *'" class="py-0.5">
          <!-- Bullet or number (not shown for task items). Sizing is done with
               attributes, not utility classes, so the gutter holds even when the
               host app's compiled tailwind lacks the class; a minimum rather than
               a fixed width lets two-digit numbers fit. Top-aligned so the marker
               sits on the first line of multi-line items. -->
          @if (!isTaskItem(item)) {
            <Label col="0" minWidth="24" paddingRight="6" verticalAlignment="top" [text]="getBullet(i, item)" class="text-sm leading-[3] text-slate-500 dark:text-slate-400" [color]="styleColors().text"></Label>
          }

          <!-- Checkbox for task items -->
          @if (isTaskItem(item)) {
            <MdCheckbox col="0" [checked]="isChecked(item)"></MdCheckbox>
          }

          <!-- Single Label so inline runs (bold lead-ins, links) flow and wrap
               as continuous text; separate Labels per run cannot flow mid-text. -->
          <Label col="1" [formattedText]="formattedItems()[i]" textWrap="true" [class]="'text-sm leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')" [color]="styleColors().text" ignoreTouchAnimation="true"></Label>
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
  styleColors = input<StyleColors>({ text: null, link: null, codeInline: null, strikethrough: null, mathInline: null });
  styleSpacing = input<StyleSpacing>({ paragraph: null, heading: null, list: null, blockquote: null, codeBlock: null, image: null, horizontalRule: null, table: null, mathBlock: null });

  formattedItems = computed(() => {
    const colors = this.styleColors();
    return this.items().map((item) => {
      const tokens: MarkdownToken[] = item.children?.length ? item.children : [{ type: 'text', raw: item.content, content: item.content }];
      return buildFormattedString(tokens, colors);
    });
  });

  isTaskItem(item: MarkdownToken): boolean {
    return item.metadata?.['isTask'] === true;
  }

  isChecked(item: MarkdownToken): boolean {
    return item.metadata?.['isChecked'] === true;
  }

  getBullet(index: number, item: MarkdownToken): string {
    if (this.ordered()) {
      // CommonMark: the first item's number starts the list and the rest count
      // up from it, whatever they are written as ("1." on every line is common).
      const start = Number(this.items()[0]?.metadata?.['number'] ?? item.metadata?.['number'] ?? 1);
      return `${start + index}.`;
    }
    return '•';
  }
}
