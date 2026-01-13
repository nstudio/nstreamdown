<page>
    <actionBar flat={true} class="bg-slate-50" title="Streaming Demo">
        <navigationButton text="" android={{ systemIcon: 'ic_menu_back' }} on:tap={() => dispatch('back')} />
        <actionItem ios={{ position: 'right' }} on:tap={toggleStreaming}>
            {#if isApple && isStreaming}
                <image src="sys://stop.fill" class="w-5 h-5" />
            {:else if isApple && !isStreaming}
                <image src="sys://play.fill" class="w-5 h-5" />
            {:else}
                <label text={isStreaming ? 'Stop' : 'Start'} class="text-blue-600 font-medium px-2" />
            {/if}
        </actionItem>
    </actionBar>

    <gridLayout rows="auto, *, auto" class="bg-slate-50">
        <!-- Mode selector -->
        <gridLayout row="0" columns="*, *" class="mx-4 mt-3 bg-slate-200 rounded-lg p-1">
            <label
                col="0"
                text="Streaming"
                class={`text-center py-2 rounded-md text-sm font-medium ${streamingMode === 'streaming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                on:tap={() => setMode('streaming')}
            />
            <label
                col="1"
                text="Static"
                class={`text-center py-2 rounded-md text-sm font-medium ${streamingMode === 'static' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                on:tap={() => setMode('static')}
            />
        </gridLayout>

        <!-- Streamdown content -->
        <scrollView row="1" class="mt-3">
            <stackLayout class="mx-4 mb-20 bg-white rounded-xl p-4 shadow-sm">
                <Streamdown content={currentContent} config={config} />
            </stackLayout>
        </scrollView>

        <!-- Stats bar -->
        <gridLayout row="2" columns="*, *, *" class="mx-4 mb-2 bg-slate-100 rounded-lg px-3 py-2">
            <gridLayout col="0" rows="auto, auto" class="text-center">
                <label row="0" text={charCount} class="text-sm font-semibold text-slate-700" />
                <label row="1" text="chars" class="text-xs text-slate-400" />
            </gridLayout>
            <gridLayout col="1" rows="auto, auto" class="text-center">
                <label row="0" text={tokenCount} class="text-sm font-semibold text-slate-700" />
                <label row="1" text="tokens" class="text-xs text-slate-400" />
            </gridLayout>
            <gridLayout col="2" rows="auto, auto" class="text-center">
                <label row="0" text={streamSpeed} class="text-sm font-semibold text-slate-700" />
                <label row="1" text="chars/s" class="text-xs text-slate-400" />
            </gridLayout>
        </gridLayout>
    </gridLayout>
</page>

<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { Streamdown } from '@nstudio/nstreamdown/svelte';
    import { writable } from 'svelte/store';

    const dispatch = createEventDispatcher();

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

    const STREAMING_CHUNKS = DEMO_MARKDOWN.split(/(?<=\s)/);

    let currentContent = '# Ready\n\nTap **Play** to begin the streaming demo...';
    let isStreaming = false;
    let streamingMode: 'streaming' | 'static' = 'streaming';
    let charCount = '0';
    let tokenCount = '0';
    let streamSpeed = '0';

    let streamIndex = 0;
    let streamInterval: any = null;
    let startTime = 0;

    // Store for isIOS to use in template
    const isApple = __APPLE__;

    $: config = {
        mode: streamingMode,
        controls: true,
        showCaret: true,
        caret: '▋',
    };

    onDestroy(() => {
        if (streamInterval) {
            clearInterval(streamInterval);
        }
    });

    function updateStats(content: string) {
        charCount = content.length.toString();
        tokenCount = Math.floor(content.length / 4).toString();
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0) {
            streamSpeed = Math.floor(content.length / elapsed).toString();
        }
    }

    function startStreaming() {
        streamIndex = 0;
        currentContent = '';
        isStreaming = true;
        startTime = Date.now();

        streamInterval = setInterval(() => {
            if (streamIndex < STREAMING_CHUNKS.length) {
                const chunksToProcess = Math.min(3, STREAMING_CHUNKS.length - streamIndex);
                for (let j = 0; j < chunksToProcess; j++) {
                    currentContent += STREAMING_CHUNKS[streamIndex + j];
                }
                updateStats(currentContent);
                streamIndex += chunksToProcess;
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
        isStreaming = false;
    }

    function toggleStreaming() {
        if (isStreaming) {
            stopStreaming();
        } else {
            startStreaming();
        }
    }

    function setMode(mode: 'streaming' | 'static') {
        streamingMode = mode;
        if (mode === 'static') {
            stopStreaming();
            currentContent = DEMO_MARKDOWN;
            updateStats(DEMO_MARKDOWN);
        }
    }
</script>
