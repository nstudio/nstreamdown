<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { parseMarkdown, parseInlineFormatting, openUrl, remend } from '@nstudio/nstreamdown';
import type { MarkdownToken } from '@nstudio/nstreamdown';
import CodeBlock from './CodeBlock.vue';
import MdMath from './MdMath.vue';
import MdMermaid from './MdMermaid.vue';
import MdTable from './MdTable.vue';

export interface StreamdownConfig {
  /** Mode: 'streaming' for real-time updates, 'static' for complete markdown */
  mode?: 'streaming' | 'static';
  /** Whether to show copy/download controls */
  controls?: boolean;
  /** Whether to animate the caret during streaming */
  showCaret?: boolean;
  /** Custom caret character */
  caret?: string;
}

interface Props {
  content: string;
  config?: StreamdownConfig;
  isStreaming?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  config: () => ({}),
  isStreaming: false
});

const emit = defineEmits<{
  linkTap: [url: string];
  parseComplete: [];
}>();

// Internal state
const markdown = ref('');
let throttleTimer: ReturnType<typeof setTimeout> | null = null;
let pendingContent = '';
let lastUpdateTime = 0;
const THROTTLE_MS = 32;

// Computed mode value
const mode = computed(() => props.config?.mode || 'streaming');
const showCaret = computed(() => props.config?.showCaret ?? true);
const caretChar = computed(() => props.config?.caret || '▋');

// Parsed tokens
const parsedResult = computed(() => {
  if (!markdown.value) return { tokens: [], isComplete: true };
  const isStreamingMode = mode.value === 'streaming';
  return parseMarkdown(markdown.value, isStreamingMode);
});

const tokens = computed(() => parsedResult.value.tokens);
const isComplete = computed(() => parsedResult.value.isComplete);
const isStreamingActive = computed(() => mode.value === 'streaming' && !isComplete.value);

// Watch content changes with throttling
watch(() => props.content, (newContent) => {
  const currentMode = mode.value;
  
  if (currentMode === 'streaming') {
    pendingContent = newContent;
    const now = Date.now();
    const elapsed = now - lastUpdateTime;
    
    if (elapsed >= THROTTLE_MS) {
      lastUpdateTime = now;
      markdown.value = newContent;
    } else if (!throttleTimer) {
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        lastUpdateTime = Date.now();
        markdown.value = pendingContent;
      }, THROTTLE_MS - elapsed);
    }
  } else {
    markdown.value = newContent;
  }
}, { immediate: true });

// Cleanup
onUnmounted(() => {
  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }
});

// Helper functions
function isHeading(token: MarkdownToken): boolean {
  return token.type.startsWith('heading');
}

function getHeadingLevel(token: MarkdownToken): number {
  return parseInt(token.type.replace('heading', ''), 10) || 1;
}

function getLanguage(token: MarkdownToken): string {
  return (token.metadata?.['language'] as string) || '';
}

function getIsIncomplete(token: MarkdownToken): boolean {
  return (token.metadata?.['isIncomplete'] as boolean) || false;
}

function getUrl(token: MarkdownToken): string {
  return (token.metadata?.['url'] as string) || '';
}

function getHeadingClass(level: number): string {
  const sizes: Record<number, string> = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-bold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-semibold',
    5: 'text-base font-medium',
    6: 'text-sm font-medium'
  };
  return sizes[level] || sizes[1];
}

// Get inline tokens for content that needs inline formatting
function getInlineTokens(content: string, children?: MarkdownToken[]): MarkdownToken[] {
  if (children && children.length > 0) {
    return children;
  }
  if (content) {
    return parseInlineFormatting(content);
  }
  return [];
}

// Handle link taps
function onLinkTap(token: MarkdownToken) {
  const url = token.metadata?.['url'] as string;
  if (url && url !== 'streamdown:incomplete-link') {
    emit('linkTap', url);
    openUrl(url);
  }
}
</script>

<template>
  <StackLayout class="streamdown-container">
    <template v-for="(token, index) in tokens" :key="`${index}-${token.type}-${token.content?.length || 0}`">
      <!-- Headings -->
      <FlexboxLayout 
        v-if="isHeading(token)"
        flexWrap="wrap"
        alignItems="center"
        :class="getHeadingClass(getHeadingLevel(token)) + ' text-slate-800 mb-2'"
      >
        <template v-for="(inlineToken, inlineIndex) in getInlineTokens(token.content, token.children)" :key="inlineIndex">
          <Label v-if="inlineToken.type === 'text'" :text="inlineToken.content" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'bold'" :text="inlineToken.content" class="font-bold" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'italic'" :text="inlineToken.content" class="italic" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'bold-italic'" :text="inlineToken.content" class="font-bold italic" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'code-inline'" :text="inlineToken.content" class="font-mono bg-slate-100 text-pink-600 rounded px-1" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'link'" :text="inlineToken.content" class="text-blue-600 underline" textWrap="true" @tap="onLinkTap(inlineToken)" />
          <Label v-else :text="inlineToken.content" textWrap="true" />
        </template>
      </FlexboxLayout>

      <!-- Paragraphs -->
      <FlexboxLayout
        v-else-if="token.type === 'paragraph'"
        flexWrap="wrap"
        alignItems="center"
        class="mb-3"
      >
        <template v-for="(inlineToken, inlineIndex) in getInlineTokens(token.content, token.children)" :key="inlineIndex">
          <Label v-if="inlineToken.type === 'text'" :text="inlineToken.content" class="text-sm text-slate-700 leading-6" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'bold'" :text="inlineToken.content" class="text-sm text-slate-800 font-bold leading-6" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'italic'" :text="inlineToken.content" class="text-sm text-slate-700 italic leading-6" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'bold-italic'" :text="inlineToken.content" class="text-sm text-slate-800 font-bold italic leading-6" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'strikethrough'" :text="inlineToken.content" class="text-sm text-slate-400 leading-6" textDecoration="line-through" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'code-inline'" :text="inlineToken.content" class="text-xs font-mono bg-slate-100 text-pink-600 rounded px-1" textWrap="true" />
          <Label v-else-if="inlineToken.type === 'link'" :text="inlineToken.content" class="text-sm text-blue-600 leading-6 underline" textWrap="true" @tap="onLinkTap(inlineToken)" />
          <MdMath v-else-if="inlineToken.type === 'math-inline'" :content="inlineToken.content" :block="false" />
          <Label v-else :text="inlineToken.content" class="text-sm text-slate-700 leading-6" textWrap="true" />
        </template>
      </FlexboxLayout>

      <!-- Code blocks -->
      <CodeBlock
        v-else-if="token.type === 'code-block'"
        :code="token.content"
        :language="getLanguage(token)"
        :isIncomplete="getIsIncomplete(token)"
      />

      <!-- Blockquotes -->
      <StackLayout
        v-else-if="token.type === 'blockquote'"
        class="border-l-4 border-slate-300 pl-4 mb-3"
      >
        <FlexboxLayout flexWrap="wrap" alignItems="center">
          <template v-for="(inlineToken, inlineIndex) in getInlineTokens(token.content, token.children)" :key="inlineIndex">
            <Label v-if="inlineToken.type === 'text'" :text="inlineToken.content" class="text-base text-slate-600 italic" textWrap="true" />
            <Label v-else-if="inlineToken.type === 'bold'" :text="inlineToken.content" class="text-base text-slate-700 font-bold italic" textWrap="true" />
            <Label v-else-if="inlineToken.type === 'link'" :text="inlineToken.content" class="text-base text-blue-600 italic underline" textWrap="true" @tap="onLinkTap(inlineToken)" />
            <Label v-else :text="inlineToken.content" class="text-base text-slate-600 italic" textWrap="true" />
          </template>
        </FlexboxLayout>
      </StackLayout>

      <!-- Ordered lists -->
      <StackLayout
        v-else-if="token.type === 'list-ordered'"
        class="mb-3"
      >
        <GridLayout
          v-for="(item, itemIndex) in token.children"
          :key="itemIndex"
          columns="auto, *"
          class="mb-1"
        >
          <Label col="0" :text="`${itemIndex + 1}.`" class="text-slate-500 mr-2" />
          <FlexboxLayout col="1" flexWrap="wrap" alignItems="center">
            <template v-for="(inlineToken, inlineIndex) in getInlineTokens(item.content, item.children)" :key="inlineIndex">
              <Label v-if="inlineToken.type === 'text'" :text="inlineToken.content" class="text-sm text-slate-700" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'bold'" :text="inlineToken.content" class="text-sm text-slate-800 font-bold" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'italic'" :text="inlineToken.content" class="text-sm text-slate-700 italic" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'strikethrough'" :text="inlineToken.content" class="text-sm text-slate-400" textDecoration="line-through" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'code-inline'" :text="inlineToken.content" class="text-xs font-mono bg-slate-100 text-pink-600 rounded px-1" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'link'" :text="inlineToken.content" class="text-sm text-blue-600 underline" textWrap="true" @tap="onLinkTap(inlineToken)" />
              <Label v-else :text="inlineToken.content" class="text-sm text-slate-700" textWrap="true" />
            </template>
          </FlexboxLayout>
        </GridLayout>
      </StackLayout>

      <!-- Unordered lists -->
      <StackLayout
        v-else-if="token.type === 'list-unordered'"
        class="mb-3"
      >
        <GridLayout
          v-for="(item, itemIndex) in token.children"
          :key="itemIndex"
          columns="auto, *"
          class="mb-1"
        >
          <Label col="0" text="•" class="text-slate-500 mr-2" />
          <FlexboxLayout col="1" flexWrap="wrap" alignItems="center">
            <template v-for="(inlineToken, inlineIndex) in getInlineTokens(item.content, item.children)" :key="inlineIndex">
              <Label v-if="inlineToken.type === 'text'" :text="inlineToken.content" class="text-sm text-slate-700" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'bold'" :text="inlineToken.content" class="text-sm text-slate-800 font-bold" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'italic'" :text="inlineToken.content" class="text-sm text-slate-700 italic" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'strikethrough'" :text="inlineToken.content" class="text-sm text-slate-400" textDecoration="line-through" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'code-inline'" :text="inlineToken.content" class="text-xs font-mono bg-slate-100 text-pink-600 rounded px-1" textWrap="true" />
              <Label v-else-if="inlineToken.type === 'link'" :text="inlineToken.content" class="text-sm text-blue-600 underline" textWrap="true" @tap="onLinkTap(inlineToken)" />
              <Label v-else :text="inlineToken.content" class="text-sm text-slate-700" textWrap="true" />
            </template>
          </FlexboxLayout>
        </GridLayout>
      </StackLayout>

      <!-- Tables -->
      <MdTable
        v-else-if="token.type === 'table'"
        :rows="token.children || []"
      />

      <!-- Images -->
      <Image
        v-else-if="token.type === 'image'"
        :src="getUrl(token)"
        class="rounded-lg mb-3"
        stretch="aspectFit"
      />

      <!-- Horizontal rules -->
      <StackLayout
        v-else-if="token.type === 'horizontal-rule'"
        class="h-px bg-slate-200 my-4"
      />

      <!-- Math blocks -->
      <MdMath
        v-else-if="token.type === 'math-block'"
        :content="token.content"
        :block="true"
      />

      <!-- Mermaid diagrams -->
      <MdMermaid
        v-else-if="token.type === 'mermaid-block'"
        :content="token.content"
        :darkMode="true"
        :isIncomplete="getIsIncomplete(token)"
      />
    </template>

    <!-- Streaming caret -->
    <Label
      v-if="showCaret && isStreamingActive"
      :text="caretChar"
      class="text-lg text-gray-400 animate-pulse"
    />
  </StackLayout>
</template>
