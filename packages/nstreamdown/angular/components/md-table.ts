/**
 * MdTable Component
 * Renders markdown tables with header and body rows
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, computed, input, effect } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { MarkdownToken } from '@nstudio/nstreamdown';
import { copyToClipboard, openUrl } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdTable',
  template: `
    <GridLayout class="rounded-xl border border-slate-200 dark:border-slate-700 my-3 overflow-hidden" rows="auto, *">
      <!-- Controls -->
      <GridLayout row="0" columns="*, auto" class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2">
        <Label col="0" text="Table" class="text-xs text-slate-400 dark:text-slate-500"></Label>
        <Label col="1" [text]="copied() ? '✓ Copied' : 'Copy'" class="text-xs text-blue-600 dark:text-blue-400 font-medium" (tap)="onCopy()"></Label>
      </GridLayout>

      <!-- Table content -->
      <ScrollView row="1" orientation="horizontal">
        <StackLayout>
          <!-- Header row -->
          @if (headerRow(); as header) {
            <GridLayout [columns]="columnsDefinition()" class="bg-slate-100 dark:bg-slate-800">
              @for (cell of header.children; track $index; let i = $index) {
                <StackLayout [col]="i" class="border-b border-slate-200 dark:border-slate-700 px-3 py-2">
                  <FlexboxLayout flexWrap="wrap" alignItems="center">
                    @for (token of cell.children || [{ type: 'text', content: cell.content }]; track $index) {
                      @if (token.type === 'text') {
                        <Label [text]="token.content" class="text-xs font-semibold text-slate-700 dark:text-slate-200"></Label>
                      }
                      @if (token.type === 'bold') {
                        <Label [text]="token.content" class="text-xs font-bold text-slate-700 dark:text-slate-200"></Label>
                      }
                    }
                  </FlexboxLayout>
                </StackLayout>
              }
            </GridLayout>
          }

          <!-- Body rows -->
          @for (row of bodyRows(); track $index; let rowIndex = $index) {
            <GridLayout [columns]="columnsDefinition()" [class]="rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'">
              @for (cell of row.children; track $index; let i = $index) {
                <StackLayout [col]="i" class="border-b border-slate-100 dark:border-slate-700 px-3 py-2">
                  <FlexboxLayout flexWrap="wrap" alignItems="center">
                    @for (token of cell.children || [{ type: 'text', content: cell.content }]; track $index) {
                      @switch (token.type) {
                        @case ('text') {
                          <Label [text]="token.content" class="text-xs text-slate-700 dark:text-slate-300"></Label>
                        }
                        @case ('bold') {
                          <Label [text]="token.content" class="text-xs font-bold text-slate-700 dark:text-slate-300"></Label>
                        }
                        @case ('link') {
                          <Label [text]="token.content" class="text-xs text-blue-600 dark:text-blue-400" textDecoration="underline" (tap)="onLinkTap(token)"></Label>
                        }
                        @case ('code-inline') {
                          <Label [text]="token.content" class="text-[10] font-mono bg-slate-100 dark:bg-slate-700 text-pink-600 dark:text-pink-400 rounded px-1"></Label>
                        }
                      }
                    }
                  </FlexboxLayout>
                </StackLayout>
              }
            </GridLayout>
          }
        </StackLayout>
      </ScrollView>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdTable {
  rows = input<MarkdownToken[]>([]);

  copied = signal(false);
  columnsDefinition = signal<string>('*');
  private columnWidths: number[] = [];

  headerRow = computed(() => {
    return this.rows().find((row) => row.metadata?.['isHeader']) || null;
  });

  bodyRows = computed(() => {
    return this.rows().filter((row) => !row.metadata?.['isHeader']);
  });

  constructor() {
    effect(() => {
      const r = this.rows();
      if (r.length > 0) {
        this.calculateColumnWidths();
      }
    });
  }

  private calculateColumnWidths() {
    const allRows = this.rows().filter((row) => !row.metadata?.['isSeparator']);
    if (allRows.length === 0) {
      this.columnsDefinition.set('*');
      return;
    }

    const columnCount = allRows[0]?.children?.length || 1;
    const widths: number[] = new Array(columnCount).fill(0);

    // Calculate max content length for each column
    for (const row of allRows) {
      if (!row.children) continue;
      for (let i = 0; i < row.children.length && i < columnCount; i++) {
        const cell = row.children[i];
        const contentLength = this.getCellTextLength(cell);
        widths[i] = Math.max(widths[i], contentLength);
      }
    }

    // Convert character lengths to approximate pixel widths (8px per char for small text)
    // Add padding (24px = 12px each side)
    const pixelWidths = widths.map((charCount) => {
      const minWidth = 60;
      const calculatedWidth = Math.max(minWidth, charCount * 8 + 32);
      return Math.min(calculatedWidth, 200); // Max 200px per column
    });

    this.columnWidths = pixelWidths;
    this.columnsDefinition.set(pixelWidths.map((w) => `${w}`).join(', '));
  }

  private getCellTextLength(cell: MarkdownToken): number {
    if (cell.children && cell.children.length > 0) {
      return cell.children.reduce((sum, token) => sum + (token.content?.length || 0), 0);
    }
    return cell.content?.length || 0;
  }

  toTableText(): string {
    const lines: string[] = [];
    for (const row of this.rows()) {
      const cells = row.children?.map((cell) => cell.content) || [];
      lines.push(cells.join('\t'));
    }
    return lines.join('\n');
  }

  toCsv(): string {
    const lines: string[] = [];
    for (const row of this.rows()) {
      const cells =
        row.children?.map((cell) => {
          const content = cell.content.replace(/"/g, '""');
          return content.includes(',') ? `"${content}"` : content;
        }) || [];
      lines.push(cells.join(','));
    }
    return lines.join('\n');
  }

  onCopy() {
    if (copyToClipboard(this.toTableText())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  onLinkTap(token: MarkdownToken) {
    const url = token.metadata?.['url'] as string;
    if (url) {
      openUrl(url);
    }
  }
}
