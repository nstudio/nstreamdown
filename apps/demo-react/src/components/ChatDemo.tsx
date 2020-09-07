import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { isIOS } from "@nativescript/core";
import { Streamdown } from '@nstudio/nstreamdown/react';

interface ChatMessage {
    id: number;
    content: string;
    isUser: boolean;
    isStreaming: boolean;
    streamedContent: string;
    startTime?: number;
}

const AI_RESPONSES = [
    `Here's a **TypeScript** example for you:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`

This demonstrates async/await with proper typing!`,

    `Great question! Here's how you can use **NativeScript** with Vue:

\`\`\`vue
<template>
  <Page>
    <ActionBar title="My App" />
    <StackLayout>
      <Label :text="message" />
      <Button text="Click me" @tap="onTap" />
    </StackLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return { message: 'Hello NativeScript!' };
  },
  methods: {
    onTap() {
      this.message = 'Button tapped!';
    }
  }
});
</script>
\`\`\``,

    `# Streamdown Features 🎯

Here's what makes Streamdown special:

| Feature | Description |
|---------|-------------|
| **Streaming** | Real-time token rendering |
| **Syntax Highlighting** | Beautiful code blocks |
| **Math Support** | LaTeX rendering: $E = mc^2$ |
| **Native Performance** | Built for iOS & Android |

> "Performance is not just a feature, it's the foundation."

## Why Choose Streamdown?

1. **Speed**: Optimized for real-time AI responses
2. **Flexibility**: Works with any LLM API
3. **Native**: True native rendering, not a web view`,

    `Let me explain **async/await** in JavaScript:

\`\`\`javascript
// Without async/await
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// With async/await
async function getData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

Much cleaner, right? ✨`,

    `Here's the **quadratic formula** explained:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Where:
- $a$ is the coefficient of $x^2$
- $b$ is the coefficient of $x$  
- $c$ is the constant term

### Example

For $2x^2 + 5x + 3 = 0$:

- $a = 2$, $b = 5$, $c = 3$
- $x = \\frac{-5 \\pm \\sqrt{25 - 24}}{4}$
- $x = \\frac{-5 \\pm 1}{4}$

So $x = -1$ or $x = -1.5$`
];

interface ChatDemoProps {
    onBack: () => void;
}

export const ChatDemo = ({ onBack }: ChatDemoProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [responseIndex, setResponseIndex] = useState(0);

    const scrollViewRef = useRef<any>(null);
    const messageIdRef = useRef(0);
    const streamIntervalRef = useRef<any>(null);

    const config = useMemo(() => ({
        mode: 'streaming' as const,
        controls: true,
        showCaret: true,
        caret: '▋',
    }), []);

    useEffect(() => {
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToVerticalOffset(
                    scrollViewRef.current.nativeView?.scrollableHeight || 0,
                    true
                );
            }
        }, 100);
    };

    const sendMessage = () => {
        if (!inputText.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            id: ++messageIdRef.current,
            content: inputText,
            isUser: true,
            isStreaming: false,
            streamedContent: inputText
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsProcessing(true);
        scrollToBottom();

        // Simulate AI response delay
        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: ++messageIdRef.current,
                content: AI_RESPONSES[responseIndex % AI_RESPONSES.length],
                isUser: false,
                isStreaming: true,
                streamedContent: '',
                startTime: Date.now()
            };

            setMessages(prev => [...prev, aiMessage]);
            setResponseIndex(prev => prev + 1);
            startStreamingMessage(aiMessage);
            scrollToBottom();
        }, 500);
    };

    const startStreamingMessage = (message: ChatMessage) => {
        const chunks = message.content.split(/(?<=\s)/);
        let chunkIndex = 0;

        streamIntervalRef.current = setInterval(() => {
            if (chunkIndex < chunks.length) {
                const chunksToProcess = Math.min(2, chunks.length - chunkIndex);
                let newContent = '';
                for (let j = 0; j < chunksToProcess; j++) {
                    newContent += chunks[chunkIndex + j];
                }
                chunkIndex += chunksToProcess;

                setMessages(prev => prev.map(m => 
                    m.id === message.id
                        ? { ...m, streamedContent: m.streamedContent + newContent }
                        : m
                ));
                scrollToBottom();
            } else {
                clearInterval(streamIntervalRef.current);
                streamIntervalRef.current = null;
                setMessages(prev => prev.map(m =>
                    m.id === message.id
                        ? { ...m, isStreaming: false }
                        : m
                ));
                setIsProcessing(false);
            }
        }, 30);
    };

    const sendQuickMessage = (question: string) => {
        if (isProcessing) return;
        setInputText(question);
        // Delay to allow state update
        setTimeout(() => {
            sendMessage();
        }, 100);
    };

    const onQuickAction = (question: string) => {
        setInputText(question);
        setTimeout(() => {
            const userMessage: ChatMessage = {
                id: ++messageIdRef.current,
                content: question,
                isUser: true,
                isStreaming: false,
                streamedContent: question
            };

            setMessages(prev => [...prev, userMessage]);
            setInputText('');
            setIsProcessing(true);
            scrollToBottom();

            setTimeout(() => {
                const aiMessage: ChatMessage = {
                    id: ++messageIdRef.current,
                    content: AI_RESPONSES[responseIndex % AI_RESPONSES.length],
                    isUser: false,
                    isStreaming: true,
                    streamedContent: '',
                    startTime: Date.now()
                };

                setMessages(prev => [...prev, aiMessage]);
                setResponseIndex(prev => prev + 1);
                startStreamingMessage(aiMessage);
                scrollToBottom();
            }, 500);
        }, 50);
    };

    return (
        <page>
            <actionBar flat={true} className="bg-slate-50" title="Chat Demo">
                <navigationButton text="" android={{ systemIcon: "ic_menu_back" }} onTap={onBack} />
            </actionBar>

            <gridLayout rows="*, auto" className="bg-slate-100">
                {/* Messages list */}
                <scrollView row={0} ref={scrollViewRef}>
                    <stackLayout className="p-4">
                        {messages.length === 0 && (
                            <stackLayout className="items-center my-8">
                                <label text="💬" className="text-4xl mb-4" />
                                <label text="Start a conversation" className="text-lg font-semibold text-slate-700" />
                                <label text="Try the suggestions below" className="text-sm text-slate-500 mt-1" />

                                {/* Quick action buttons */}
                                <stackLayout className="mt-6 w-full px-4">
                                    <label
                                        text="Show me a TypeScript example"
                                        className="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                        onTap={() => onQuickAction('Show me a TypeScript example')}
                                    />
                                    <label
                                        text="Explain the quadratic formula"
                                        className="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                        onTap={() => onQuickAction('Explain the quadratic formula')}
                                    />
                                    <label
                                        text="What makes Streamdown special?"
                                        className="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                        onTap={() => onQuickAction('What makes Streamdown special?')}
                                    />
                                </stackLayout>
                            </stackLayout>
                        )}

                        {messages.map(message => (
                            <gridLayout
                                key={message.id}
                                columns={message.isUser ? "*, auto" : "auto, *"}
                                className="mb-3"
                            >
                                {message.isUser ? (
                                    <>
                                        <stackLayout col={1} className="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                                            <label text={message.content} className="text-white" textWrap={true} />
                                        </stackLayout>
                                    </>
                                ) : (
                                    <>
                                        <stackLayout col={0} className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
                                            <Streamdown
                                                content={message.streamedContent}
                                                config={config}
                                            />
                                            {message.isStreaming && (
                                                <label text="..." className="text-slate-400 text-xs mt-1" />
                                            )}
                                        </stackLayout>
                                    </>
                                )}
                            </gridLayout>
                        ))}
                    </stackLayout>
                </scrollView>

                {/* Input area */}
                <gridLayout row={1} columns="*, auto" className="bg-white border-t-[1] border-slate-200 px-4 py-3">
                    <textView
                        col={0}
                        text={inputText}
                        onTextChange={(e: any) => setInputText(e.value)}
                        hint="Ask something..."
                        className="bg-slate-100 rounded-full px-4 py-2 text-base"
                        returnKeyType="send"
                    />
                    <label
                        col={1}
                        text="↑"
                        className={`ml-2 w-10 h-10 rounded-full text-center text-white text-lg font-bold leading-10 ${inputText.trim() && !isProcessing ? 'bg-blue-500' : 'bg-slate-300'}`}
                        onTap={sendMessage}
                    />
                </gridLayout>
            </gridLayout>
        </page>
    );
};
