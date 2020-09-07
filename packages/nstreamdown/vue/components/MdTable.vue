<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { copyToClipboard, openUrl } from '@nstudio/nstreamdown';
import type { MarkdownToken } from '@nstudio/nstreamdown';

interface Props {
  rows: MarkdownToken[];
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => []
});

const copied = ref(false);
const columnsDefinition = ref('*');

const headerRow = computed(() => {
  return props.rows.find((row) => row.metadata?.['isHeader']) || null;
});

const bodyRows = computed(() => {
  return props.rows.filter((row) => !row.metadata?.['isHeader']);
});

// Calculate column widths when rows change
watch(() => props.rows, (newRows) => {
  if (newRows.length > 0) {
    calculateColumnWidths();
  }
}, { immediate: true });

function calculateColumnWidths() {
  const allRows = props.rows.filter((row) => !row.metadata?.['isSeparator']);
  if (allRows.length === 0) {
    columnsDefinition.value = '*';
    return;
  }

  const columnCount = allRows[0]?.children?.length || 1;
  const widths: number[] = new Array(columnCount).fill(0);

  // Calculate max content length for each column
  for (const row of allRows) {
    if (!row.children) continue;
    for (let i = 0; i < row.children.length && i < columnCount; i++) {
      const cell = row.children[i];
      const contentLength = getCellTextLength(cell);
      widths[i] = Math.max(widths[i], contentLength);
    }
  }

  // Convert character lengths to approximate pixel widths (8px per char for small text)
  // Add padding (24px = 12px each side)
  const pixelWidths = widths.map((charCount) => {
    const minWidth = 60;
    const calculatedWidth = Math.max(minWidth, charCount * 8 + 24);
    return Math.min(calculatedWidth, 200); // Max 200px per column
  });

  columnsDefinition.value = pixelWidths.map((w) => `${w}`).join(', ');
}

function getCellTextLength(cell: MarkdownToken): number {
  if (cell.children && cell.children.length > 0) {
    return cell.children.reduce((sum, token) => sum + (token.content?.length || 0), 0);
  }
  return cell.content?.length || 0;
}

function toTableText(): string {
  const lines: string[] = [];
  for (const row of props.rows) {
    const cells = row.children?.map((cell) => cell.content) || [];
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}

function getCellTokens(cell: MarkdownToken): MarkdownToken[] {
  if (cell.children && cell.children.length > 0) {
    return cell.children;
  }
  return [{ type: 'text', content: cell.content, raw: cell.content }] as MarkdownToken[];
}

function onCopy() {
  if (copyToClipboard(toTableText())) {
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  }
}

function onLinkTap(token: MarkdownToken) {
  const url = token.metadata?.['url'] as string;
  if (url) {
    openUrl(url);
  }
}
</script>

<template>
  <GridLayout class="rounded-xl border border-slate-200 my-3 overflow-hidden" rows="auto, *">
    <!-- Controls -->
    <GridLayout row="0" columns="*, auto" class="bg-slate-50 border-b border-slate-200 px-3 py-2">
      <Label col="0" text="Table" class="text-xs text-slate-400" />
      <Label
        col="1"
        :text="copied ? '✓ Copied' : 'Copy'"
        class="text-xs text-blue-600 font-medium"
        @tap="onCopy"
      />
    </GridLayout>

    <!-- Table content -->
    <ScrollView row="1" orientation="horizontal">
      <StackLayout>
        <!-- Header row -->
        <GridLayout
          v-if="headerRow"
          :columns="columnsDefinition"
          class="bg-slate-100"
        >
          <StackLayout
            v-for="(cell, cellIndex) in headerRow.children"
            :key="cellIndex"
            :col="cellIndex"
            class="border-b border-slate-200 px-3 py-2"
          >
            <FlexboxLayout flexWrap="wrap" alignItems="center">
              <template v-for="(token, tokenIndex) in getCellTokens(cell)" :key="tokenIndex">
                <Label
                  v-if="token.type === 'text'"
                  :text="token.content"
                  class="text-xs font-semibold text-slate-700"
                />
                <Label
                  v-else-if="token.type === 'bold'"
                  :text="token.content"
                  class="text-xs font-bold text-slate-700"
                />
                <Label
                  v-else
                  :text="token.content"
                  class="text-xs font-semibold text-slate-700"
                />
              </template>
            </FlexboxLayout>
          </StackLayout>
        </GridLayout>

        <!-- Body rows -->
        <GridLayout
          v-for="(row, rowIndex) in bodyRows"
          :key="rowIndex"
          :columns="columnsDefinition"
          :class="Number(rowIndex) % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
        >
          <StackLayout
            v-for="(cell, cellIndex) in row.children"
            :key="cellIndex"
            :col="cellIndex"
            class="border-b border-slate-100 px-3 py-2"
          >
            <FlexboxLayout flexWrap="wrap" alignItems="center">
              <template v-for="(token, tokenIndex) in getCellTokens(cell)" :key="tokenIndex">
                <Label
                  v-if="token.type === 'text'"
                  :text="token.content"
                  class="text-xs text-slate-700"
                />
                <Label
                  v-else-if="token.type === 'bold'"
                  :text="token.content"
                  class="text-xs font-bold text-slate-700"
                />
                <Label
                  v-else-if="token.type === 'link'"
                  :text="token.content"
                  class="text-xs text-blue-600"
                  textDecoration="underline"
                  @tap="onLinkTap(token)"
                />
                <Label
                  v-else-if="token.type === 'code-inline'"
                  :text="token.content"
                  class="text-[10] font-mono bg-slate-100 text-pink-600 rounded px-1"
                />
                <Label
                  v-else
                  :text="token.content"
                  class="text-xs text-slate-700"
                />
              </template>
            </FlexboxLayout>
          </StackLayout>
        </GridLayout>
      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>
