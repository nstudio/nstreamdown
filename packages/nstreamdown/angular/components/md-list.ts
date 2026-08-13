/**
 * MdList Component
 * Renders ordered and unordered lists, including GFM task lists
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken } from '@nstudio/nstreamdown';
import { openUrl } from '@nstudio/nstreamdown';
import type { StyleColors, StyleSpacing } from './streamdown';
import { MdCheckbox } from './md-checkbox';
import { buildFormattedString } from './formatted-string';

@Component({
  selector: 'MdList',
  template: `
    <StackLayout [class]="styleSpacing().list || 'my-2 pl-2'">
      @for (item of items(); track $index; let i = $index) {
        <GridLayout [columns]="isTaskItem(item) ? 'auto, auto, *' : 'auto, *'" class="py-0.5">
          <!-- Bullet or number (not shown for task items). width is an attribute,
               not a utility class, so the gutter stays fixed even when the host
               app's compiled tailwind lacks the class. Top-aligned so the marker
               sits on the first line of multi-line items. -->
          @if (!isTaskItem(item)) {
            <Label col="0" width="24" verticalAlignment="top" [text]="getBullet(i, item)" class="text-sm leading-[3] text-slate-500 dark:text-slate-400" [color]="styleColors().text"></Label>
          }

          <!-- Checkbox for task items -->
          @if (isTaskItem(item)) {
            <MdCheckbox col="0" [checked]="isChecked(item)"></MdCheckbox>
          }

          <!-- Single Label so inline runs (bold lead-ins, links) flow and wrap
               as continuous text; separate Labels per run cannot flow mid-text. -->
          <Label col="1" [formattedText]="formattedItems()[i]" textWrap="true" [class]="'text-sm leading-[3] ' + (isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300')" [color]="styleColors().text" ignoreTouchAnimation="true" (tap)="onItemTap(i)"></Label>
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

  // item index → (span index → url), rebuilt alongside formattedItems
  private itemLinkUrls: Map<number, Map<number, string>> = new Map();

  formattedItems = computed(() => {
    const colors = this.styleColors();
    this.itemLinkUrls.clear();
    return this.items().map((item, i) => {
      const tokens: MarkdownToken[] = item.children?.length ? item.children : [{ type: 'text', raw: item.content, content: item.content }];
      const links = new Map<number, string>();
      const fs = buildFormattedString(tokens, colors, links);
      if (links.size > 0) {
        this.itemLinkUrls.set(i, links);
      }
      return fs;
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
      const num = item.metadata?.['number'] ?? index + 1;
      return `${num}.`;
    }
    return '•';
  }

  onItemTap(index: number) {
    // Single-link items open on tap anywhere in the item, matching MdParagraph;
    // per-span hit testing would be needed to disambiguate multiple links.
    const links = this.itemLinkUrls.get(index);
    if (links?.size === 1) {
      const url = links.values().next().value;
      if (url) {
        openUrl(url);
      }
    }
  }
}
