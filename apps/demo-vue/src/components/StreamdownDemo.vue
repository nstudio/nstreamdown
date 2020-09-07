<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Streamdown } from '@nstudio/nstreamdown/vue';

const emit = defineEmits<{
  back: [];
}>();

// Sample AI response that demonstrates all markdown features
const DEMO_MARKDOWN = `# NativeScript Streamdown 🚀

This is a **native iOS** implementation of [streamdown.ai](https://streamdown.ai), designed for real-time AI streaming content.

## Key Features

Streamdown handles streaming markdown with grace, including:

- **Bold text** and *italic text*
- ~~Strikethrough~~ formatting
- \`inline code\` snippets
- [Clickable links](https://nativescript.org)

### Code Blocks with Syntax Highlighting

Here's a TypeScript example:

\`\`\`typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  template: '<Streamdown [content]="markdown"></Streamdown>'
})
export class DemoComponent {
  markdown = '# Hello World!';
}
\`\`\`

And here's some Swift for iOS:

\`\`\`swift
import UIKit

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        print("Hello from NativeScript!")
    }
}
\`\`\`

## Tables

| Feature | Streamdown | React Markdown |
|---------|------------|----------------|
| Streaming | ✅ Yes | ❌ No |
| Incomplete Tokens | ✅ Handles | ❌ Breaks |
| Native iOS | ✅ Yes | ❌ Web Only |
| Performance | ⚡ Fast | 🐢 Slower |

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Mathematical Expressions

Here's the quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

And inline math like $E = mc^2$ works too!

## Lists

### Unordered List
- First item
- Second item
- Third item with **bold**

### Ordered List
1. Step one
2. Step two
3. Step three

---

## GitHub Flavored Markdown

Streamdown supports GFM features like:

- [x] Complete tasks
- [ ] Incomplete tasks
- Tables (as shown above)
- ~~Strikethrough~~

## CJK Language Support

日本語、中文、한국어 are fully supported with proper emphasis handling.

---

*Powered by NativeScript and rendered natively on iOS ✨*`;

// Simulated streaming chunks
const STREAMING_CHUNKS = DEMO_MARKDOWN.split(/(?<=\s)/);

// State
const currentContent = ref('');
const isStreaming = ref(false);
const streamingMode = ref<'streaming' | 'static'>('streaming');
const charCount = ref('0');
const tokenCount = ref('0');
const streamSpeed = ref('0');

// Streaming state
let streamIndex = 0;
let streamInterval: any = null;
let startTime = 0;

const config = computed(() => ({
  mode: streamingMode.value,
  controls: true,
  showCaret: true,
  caret: '▋',
}));

onMounted(() => {
  currentContent.value = `# Ready\n\nTap **Play** to begin the streaming demo...`;
});

onUnmounted(() => {
  stopStreaming();
});

function goBack() {
  emit('back');
}

function toggleStreaming() {
  if (isStreaming.value) {
    stopStreaming();
  } else {
    startStreaming();
  }
}

function startStreaming() {
  streamIndex = 0;
  currentContent.value = '';
  isStreaming.value = true;
  startTime = Date.now();

  streamInterval = setInterval(() => {
    if (streamIndex < STREAMING_CHUNKS.length) {
      const chunksToProcess = Math.min(3, STREAMING_CHUNKS.length - streamIndex);
      let newContent = currentContent.value;
      for (let j = 0; j < chunksToProcess; j++) {
        newContent += STREAMING_CHUNKS[streamIndex + j];
      }
      currentContent.value = newContent;
      streamIndex += chunksToProcess;
      updateStats();
    } else {
      stopStreaming();
    }
  }, 50);
}

function stopStreaming() {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }
  isStreaming.value = false;
}

function setMode(mode: 'streaming' | 'static') {
  streamingMode.value = mode;

  if (mode === 'static') {
    stopStreaming();
    currentContent.value = DEMO_MARKDOWN;
    updateStats();
  }
}

function updateStats() {
  const content = currentContent.value;
  charCount.value = content.length.toString();
  tokenCount.value = Math.floor(content.length / 4).toString();

  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed > 0) {
    streamSpeed.value = Math.floor(content.length / elapsed).toString();
  }
}
</script>

<template>
  <Page>
    <ActionBar flat="true" class="bg-slate-50" title="Streaming Demo">
      <NavigationButton text="Back" @tap="goBack" />
      <ActionItem ios.position="right" @tap="toggleStreaming" :text="isStreaming ? 'Stop' : 'Play'" />
    </ActionBar>

    <GridLayout rows="auto, *, auto" class="bg-slate-50">
      <!-- Mode selector -->
      <GridLayout row="0" columns="*, *" class="mx-4 mt-3 bg-slate-200 rounded-lg p-1">
        <Label
          col="0"
          text="Streaming"
          :class="'text-center py-2 rounded-md text-sm font-medium ' + (streamingMode === 'streaming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500')"
          @tap="setMode('streaming')"
        />
        <Label
          col="1"
          text="Static"
          :class="'text-center py-2 rounded-md text-sm font-medium ' + (streamingMode === 'static' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500')"
          @tap="setMode('static')"
        />
      </GridLayout>

      <!-- Streamdown content -->
      <ScrollView row="1" class="mt-3">
        <StackLayout class="mx-4 mb-20 bg-white rounded-xl p-4 shadow-sm">
          <Streamdown :content="currentContent" :config="config" />
        </StackLayout>
      </ScrollView>

      <!-- Stats bar -->
      <GridLayout row="2" columns="*, *, *" class="mx-4 mb-2 bg-slate-100 rounded-lg px-3 py-2">
        <GridLayout col="0" rows="auto, auto" class="text-center">
          <Label row="0" :text="charCount" class="text-sm font-semibold text-slate-700" />
          <Label row="1" text="chars" class="text-xs text-slate-400" />
        </GridLayout>
        <GridLayout col="1" rows="auto, auto" class="text-center">
          <Label row="0" :text="tokenCount" class="text-sm font-semibold text-slate-700" />
          <Label row="1" text="tokens" class="text-xs text-slate-400" />
        </GridLayout>
        <GridLayout col="2" rows="auto, auto" class="text-center">
          <Label row="0" :text="streamSpeed" class="text-sm font-semibold text-slate-700" />
          <Label row="1" text="chars/s" class="text-xs text-slate-400" />
        </GridLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>
