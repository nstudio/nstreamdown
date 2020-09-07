import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { isIOS } from "@nativescript/core";
import { Streamdown } from '@nstudio/nstreamdown/react';

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

const STREAMING_CHUNKS = DEMO_MARKDOWN.split(/(?<=\s)/);

interface StreamdownDemoProps {
    onBack: () => void;
}

export const StreamdownDemo = ({ onBack }: StreamdownDemoProps) => {
    const [currentContent, setCurrentContent] = useState('# Ready\n\nTap **Play** to begin the streaming demo...');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMode, setStreamingMode] = useState<'streaming' | 'static'>('streaming');
    const [charCount, setCharCount] = useState('0');
    const [tokenCount, setTokenCount] = useState('0');
    const [streamSpeed, setStreamSpeed] = useState('0');
    
    const streamIndexRef = useRef(0);
    const streamIntervalRef = useRef<any>(null);
    const startTimeRef = useRef(0);

    const config = useMemo(() => ({
        mode: streamingMode,
        controls: true,
        showCaret: true,
        caret: '▋',
    }), [streamingMode]);

    useEffect(() => {
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const updateStats = (content: string) => {
        setCharCount(content.length.toString());
        setTokenCount(Math.floor(content.length / 4).toString());
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed > 0) {
            setStreamSpeed(Math.floor(content.length / elapsed).toString());
        }
    };

    const startStreaming = () => {
        streamIndexRef.current = 0;
        setCurrentContent('');
        setIsStreaming(true);
        startTimeRef.current = Date.now();

        streamIntervalRef.current = setInterval(() => {
            if (streamIndexRef.current < STREAMING_CHUNKS.length) {
                const chunksToProcess = Math.min(3, STREAMING_CHUNKS.length - streamIndexRef.current);
                setCurrentContent(prev => {
                    let newContent = prev;
                    for (let j = 0; j < chunksToProcess; j++) {
                        newContent += STREAMING_CHUNKS[streamIndexRef.current + j];
                    }
                    updateStats(newContent);
                    return newContent;
                });
                streamIndexRef.current += chunksToProcess;
            } else {
                stopStreaming();
            }
        }, 50);
    };

    const stopStreaming = () => {
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
        }
        setIsStreaming(false);
    };

    const toggleStreaming = () => {
        if (isStreaming) {
            stopStreaming();
        } else {
            startStreaming();
        }
    };

    const setMode = (mode: 'streaming' | 'static') => {
        setStreamingMode(mode);
        if (mode === 'static') {
            stopStreaming();
            setCurrentContent(DEMO_MARKDOWN);
            updateStats(DEMO_MARKDOWN);
        }
    };

    return (
        <page>
            <actionBar flat={true} className="bg-slate-50" title="Streaming Demo">
                <navigationButton text="" android={{ systemIcon: "ic_menu_back" }} onTap={onBack} />
                <actionItem ios={{ position: "right" }} onTap={toggleStreaming}>
                    {isIOS && isStreaming && <image src="sys://stop.fill" className="w-5 h-5" />}
                    {isIOS && !isStreaming && <image src="sys://play.fill" className="w-5 h-5" />}
                    {!isIOS && <label text={isStreaming ? 'Stop' : 'Start'} className="text-blue-600 font-medium px-2" />}
                </actionItem>
            </actionBar>

            <gridLayout rows="auto, *, auto" className="bg-slate-50">
                {/* Mode selector */}
                <gridLayout row={0} columns="*, *" className="mx-4 mt-3 bg-slate-200 rounded-lg p-1">
                    <label
                        col={0}
                        text="Streaming"
                        className={`text-center py-2 rounded-md text-sm font-medium ${streamingMode === 'streaming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        onTap={() => setMode('streaming')}
                    />
                    <label
                        col={1}
                        text="Static"
                        className={`text-center py-2 rounded-md text-sm font-medium ${streamingMode === 'static' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        onTap={() => setMode('static')}
                    />
                </gridLayout>

                {/* Streamdown content */}
                <scrollView row={1} className="mt-3">
                    <stackLayout className="mx-4 mb-20 bg-white rounded-xl p-4 shadow-sm">
                        <Streamdown content={currentContent} config={config} />
                    </stackLayout>
                </scrollView>

                {/* Stats bar */}
                <gridLayout row={2} columns="*, *, *" className="mx-4 mb-2 bg-slate-100 rounded-lg px-3 py-2">
                    <gridLayout col={0} rows="auto, auto" className="text-center">
                        <label row={0} text={charCount} className="text-sm font-semibold text-slate-700" />
                        <label row={1} text="chars" className="text-xs text-slate-400" />
                    </gridLayout>
                    <gridLayout col={1} rows="auto, auto" className="text-center">
                        <label row={0} text={tokenCount} className="text-sm font-semibold text-slate-700" />
                        <label row={1} text="tokens" className="text-xs text-slate-400" />
                    </gridLayout>
                    <gridLayout col={2} rows="auto, auto" className="text-center">
                        <label row={0} text={streamSpeed} className="text-sm font-semibold text-slate-700" />
                        <label row={1} text="chars/s" className="text-xs text-slate-400" />
                    </gridLayout>
                </gridLayout>
            </gridLayout>
        </page>
    );
};
