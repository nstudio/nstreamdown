import { createSignal, onCleanup } from 'solid-js';
import { isIOS } from '@nativescript/core';
import { Streamdown } from '@nstudio/nstreamdown/solid';

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

export const StreamdownDemo = (props) => {
  const [currentContent, setCurrentContent] = createSignal('# Ready\n\nTap **Play** to begin the streaming demo...');
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [streamingMode, setStreamingMode] = createSignal('streaming');
  const [charCount, setCharCount] = createSignal('0');
  const [tokenCount, setTokenCount] = createSignal('0');
  const [streamSpeed, setStreamSpeed] = createSignal('0');

  let streamIndex = 0;
  let streamInterval = null;
  let startTime = 0;

  const config = () => ({
    mode: streamingMode(),
    controls: true,
    showCaret: true,
    caret: '▋',
  });

  onCleanup(() => {
    if (streamInterval) {
      clearInterval(streamInterval);
    }
  });

  const updateStats = (content) => {
    setCharCount(content.length.toString());
    setTokenCount(Math.floor(content.length / 4).toString());
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > 0) {
      setStreamSpeed(Math.floor(content.length / elapsed).toString());
    }
  };

  const startStreaming = () => {
    streamIndex = 0;
    setCurrentContent('');
    setIsStreaming(true);
    startTime = Date.now();

    streamInterval = setInterval(() => {
      if (streamIndex < STREAMING_CHUNKS.length) {
        const chunksToProcess = Math.min(3, STREAMING_CHUNKS.length - streamIndex);
        let newContent = currentContent();
        for (let j = 0; j < chunksToProcess; j++) {
          newContent += STREAMING_CHUNKS[streamIndex + j];
        }
        setCurrentContent(newContent);
        updateStats(newContent);
        streamIndex += chunksToProcess;
      } else {
        stopStreaming();
      }
    }, 50);
  };

  const stopStreaming = () => {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
    setIsStreaming(false);
  };

  const toggleStreaming = () => {
    if (isStreaming()) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const setMode = (mode) => {
    setStreamingMode(mode);
    if (mode === 'static') {
      stopStreaming();
      setCurrentContent(DEMO_MARKDOWN);
      updateStats(DEMO_MARKDOWN);
    }
  };

  return (
    <page>
      <actionbar flat={true} class="bg-slate-50" title="Streaming Demo">
        <navigationbutton text="" android={{ systemIcon: 'ic_menu_back' }} on:tap={props.onBack} />
        <actionitem ios={{ position: 'right' }} on:tap={toggleStreaming}>
          {isIOS && isStreaming() && <image src="sys://stop.fill" class="w-5 h-5" />}
          {isIOS && !isStreaming() && <image src="sys://play.fill" class="w-5 h-5" />}
          {!isIOS && <label text={isStreaming() ? 'Stop' : 'Start'} class="text-blue-600 font-medium px-2" />}
        </actionitem>
      </actionbar>

      <gridlayout rows="auto, *, auto" class="bg-slate-50">
        {/* Mode selector */}
        <gridlayout row="0" columns="*, *" class="mx-4 mt-3 bg-slate-200 rounded-lg p-1">
          <label
            col="0"
            text="Streaming"
            class={`text-center py-2 rounded-md text-sm font-medium ${streamingMode() === 'streaming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            on:tap={() => setMode('streaming')}
          />
          <label
            col="1"
            text="Static"
            class={`text-center py-2 rounded-md text-sm font-medium ${streamingMode() === 'static' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            on:tap={() => setMode('static')}
          />
        </gridlayout>

        {/* Streamdown content */}
        <scrollview row="1" class="mt-3">
          <stacklayout class="mx-4 mb-20 bg-white rounded-xl p-4 shadow-sm">
            <Streamdown content={currentContent()} config={config()} />
          </stacklayout>
        </scrollview>

        {/* Stats bar */}
        <gridlayout row="2" columns="*, *, *" class="mx-4 mb-2 bg-slate-100 rounded-lg px-3 py-2">
          <gridlayout col="0" rows="auto, auto" class="text-center">
            <label row="0" text={charCount()} class="text-sm font-semibold text-slate-700" />
            <label row="1" text="chars" class="text-xs text-slate-400" />
          </gridlayout>
          <gridlayout col="1" rows="auto, auto" class="text-center">
            <label row="0" text={tokenCount()} class="text-sm font-semibold text-slate-700" />
            <label row="1" text="tokens" class="text-xs text-slate-400" />
          </gridlayout>
          <gridlayout col="2" rows="auto, auto" class="text-center">
            <label row="0" text={streamSpeed()} class="text-sm font-semibold text-slate-700" />
            <label row="1" text="chars/s" class="text-xs text-slate-400" />
          </gridlayout>
        </gridlayout>
      </gridlayout>
    </page>
  );
};
