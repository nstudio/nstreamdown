import * as React from "react";
import { useState, useEffect } from "react";
import { Streamdown } from '@nstudio/nstreamdown/react';

const DEMO_MARKDOWN = `# NativeScript Streamdown 🚀

This is a **native iOS** implementation of streaming markdown, designed for real-time AI content.

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

## Tables

| Feature | Streamdown | React Markdown |
|---------|------------|----------------|
| Streaming | ✅ Yes | ❌ No |
| Native iOS | ✅ Yes | ❌ Web Only |

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

---

Built with ❤️ for NativeScript
`;

export const MainApp = () => {
    const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
    const [isStreaming, setIsStreaming] = useState(false);

    const startStreaming = async () => {
        setIsStreaming(true);
        setMarkdown('');
        
        // Simulate streaming by adding characters over time
        for (let i = 0; i < DEMO_MARKDOWN.length; i++) {
            setMarkdown(prev => prev + DEMO_MARKDOWN[i]);
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        setIsStreaming(false);
    };

    const reset = () => {
        setMarkdown('');
        setIsStreaming(false);
    };

    return (
        <>
            <actionBar title="Streamdown React Demo" />
            <gridLayout rows="auto, *, auto" className="bg-slate-50">
                {/* Header */}
                <stackLayout row={0} className="p-4 bg-white">
                    <label text="React + NativeScript Streamdown" className="text-xl font-bold text-slate-800" />
                    <label text="Real-time streaming markdown rendering" className="text-sm text-slate-500" />
                </stackLayout>
                
                {/* Content */}
                <scrollView row={1} className="p-4">
                    <stackLayout>
                        <Streamdown content={markdown} isStreaming={isStreaming} />
                    </stackLayout>
                </scrollView>
                
                {/* Controls */}
                <gridLayout row={2} columns="*, *" className="p-4 bg-white">
                    <button col={0} text="Stream Demo" onTap={startStreaming} className="bg-blue-500 text-white rounded-lg m-1" />
                    <button col={1} text="Reset" onTap={reset} className="bg-slate-200 text-slate-700 rounded-lg m-1" />
                </gridLayout>
            </gridLayout>
        </>
    );
};
