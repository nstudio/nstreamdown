<page>
    <actionBar flat={true} class="bg-slate-50" title="Chat Demo">
        <navigationButton text="" android={{ systemIcon: 'ic_menu_back' }} on:tap={() => dispatch('back')} />
    </actionBar>

    <gridLayout rows="*, auto" class="bg-slate-100">
        <!-- Messages list -->
        <scrollView row="0" bind:this={scrollViewRef}>
            <stackLayout class="p-4">
                {#if messages.length === 0}
                    <stackLayout class="items-center my-8">
                        <label text="💬" class="text-4xl mb-4" />
                        <label text="Start a conversation" class="text-lg font-semibold text-slate-700" />
                        <label text="Try the suggestions below" class="text-sm text-slate-500 mt-1" />

                        <!-- Quick action buttons -->
                        <stackLayout class="mt-6 w-full px-4">
                            <label
                                text="Show me a TypeScript example"
                                class="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                on:tap={() => onQuickAction('Show me a TypeScript example')}
                            />
                            <label
                                text="Explain the quadratic formula"
                                class="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                on:tap={() => onQuickAction('Explain the quadratic formula')}
                            />
                            <label
                                text="What makes Streamdown special?"
                                class="bg-white rounded-lg p-3 mb-2 text-slate-700 shadow-sm"
                                on:tap={() => onQuickAction('What makes Streamdown special?')}
                            />
                        </stackLayout>
                    </stackLayout>
                {/if}

                {#each messages as message (message.id)}
                    <gridLayout
                        columns={message.isUser ? '*, auto' : 'auto, *'}
                        class="mb-3"
                    >
                        {#if message.isUser}
                            <stackLayout col="1" class="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                                <label text={message.content} class="text-white" textWrap={true} />
                            </stackLayout>
                        {:else}
                            <stackLayout col="0" class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
                                <Streamdown content={message.streamedContent} {config} />
                                {#if message.isStreaming}
                                    <label text="..." class="text-slate-400 text-xs mt-1" />
                                {/if}
                            </stackLayout>
                        {/if}
                    </gridLayout>
                {/each}
            </stackLayout>
        </scrollView>

        <!-- Input area -->
        <gridLayout row="1" columns="*, auto" class="bg-white border-t-[1] border-slate-200 px-4 py-3">
            <textView
                col="0"
                text={inputText}
                on:textChange={(e) => (inputText = e.value)}
                hint="Ask something..."
                class="bg-slate-100 rounded-full px-4 py-2 text-base"
                returnKeyType="send"
            />
            <label
                col="1"
                text="↑"
                class={`ml-2 w-10 h-10 rounded-full text-center text-white text-lg font-bold leading-10 ${
                    inputText.trim() && !isProcessing ? 'bg-blue-500' : 'bg-slate-300'
                }`}
                on:tap={sendMessage}
            />
        </gridLayout>
    </gridLayout>
</page>

<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { Streamdown } from '@nstudio/nstreamdown/svelte';

    const dispatch = createEventDispatcher();

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

    let messages: ChatMessage[] = [];
    let inputText = '';
    let isProcessing = false;
    let responseIndex = 0;

    let scrollViewRef: any = null;
    let messageId = 0;
    let streamInterval: any = null;

    const config = {
        mode: 'streaming' as const,
        controls: true,
        showCaret: true,
        caret: '▋',
    };

    onDestroy(() => {
        if (streamInterval) {
            clearInterval(streamInterval);
        }
    });

    function scrollToBottom() {
        setTimeout(() => {
            if (scrollViewRef) {
                scrollViewRef.scrollToVerticalOffset(
                    scrollViewRef.scrollableHeight || 0,
                    true
                );
            }
        }, 100);
    }

    function sendMessage() {
        if (!inputText.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            id: ++messageId,
            content: inputText,
            isUser: true,
            isStreaming: false,
            streamedContent: inputText,
        };

        messages = [...messages, userMessage];
        inputText = '';
        isProcessing = true;
        scrollToBottom();

        // Simulate AI response delay
        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: ++messageId,
                content: AI_RESPONSES[responseIndex % AI_RESPONSES.length],
                isUser: false,
                isStreaming: true,
                streamedContent: '',
                startTime: Date.now(),
            };

            messages = [...messages, aiMessage];
            responseIndex++;
            startStreamingMessage(aiMessage);
            scrollToBottom();
        }, 500);
    }

    function startStreamingMessage(message: ChatMessage) {
        const chunks = message.content.split(/(?<=\s)/);
        let chunkIndex = 0;

        streamInterval = setInterval(() => {
            if (chunkIndex < chunks.length) {
                const chunksToProcess = Math.min(2, chunks.length - chunkIndex);
                let newContent = '';
                for (let j = 0; j < chunksToProcess; j++) {
                    newContent += chunks[chunkIndex + j];
                }
                chunkIndex += chunksToProcess;

                messages = messages.map((m) =>
                    m.id === message.id
                        ? { ...m, streamedContent: m.streamedContent + newContent }
                        : m
                );
                scrollToBottom();
            } else {
                clearInterval(streamInterval);
                streamInterval = null;
                messages = messages.map((m) =>
                    m.id === message.id ? { ...m, isStreaming: false } : m
                );
                isProcessing = false;
            }
        }, 30);
    }

    function onQuickAction(question: string) {
        if (isProcessing) return;

        const userMessage: ChatMessage = {
            id: ++messageId,
            content: question,
            isUser: true,
            isStreaming: false,
            streamedContent: question,
        };

        messages = [...messages, userMessage];
        isProcessing = true;
        scrollToBottom();

        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: ++messageId,
                content: AI_RESPONSES[responseIndex % AI_RESPONSES.length],
                isUser: false,
                isStreaming: true,
                streamedContent: '',
                startTime: Date.now(),
            };

            messages = [...messages, aiMessage];
            responseIndex++;
            startStreamingMessage(aiMessage);
            scrollToBottom();
        }, 500);
    }
</script>
