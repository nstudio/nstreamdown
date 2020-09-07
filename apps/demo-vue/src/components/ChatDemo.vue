<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Streamdown } from '@nstudio/nstreamdown/vue';

const emit = defineEmits<{
  back: [];
}>();

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming: boolean;
}

// Sample AI responses for different prompts
const AI_RESPONSES: Record<string, string> = {
  default: `I'd be happy to help! I'm a demo of **NativeScript Streamdown**, showcasing real-time AI streaming on iOS.

Here's what I can demonstrate:

1. **Streaming text** that appears word by word
2. \`Code snippets\` with syntax highlighting
3. Mathematical expressions like $E = mc^2$
4. Tables, lists, and more!

What would you like to see?`,

  code: `Here's a **TypeScript** example showing how to use Streamdown:

\`\`\`typescript
import { StreamdownComponent } from './streamdown';

@Component({
  selector: 'app-chat',
  template: \`
    <Streamdown
      [content]="aiResponse"
      [config]="{ mode: 'streaming' }"
    ></Streamdown>
  \`
})
export class ChatComponent {
  aiResponse = '';

  async streamResponse(prompt: string) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      this.aiResponse += new TextDecoder().decode(value);
    }
  }
}
\`\`\`

This creates a smooth streaming experience! ✨`,

  table: `Here's a comparison **table**:

| Staying In | Going Out | Outdoors | Habits |
|-----------|----------|-------------|----------------|
| Energy level | Low | Medium | Medium |
| Main feature | Comfort | Variety | Medium |
| Snacks | Popcorn | Spontaneous | Higher |

### Key Takeaways:
- **NativeScript** provides true native UI
- Direct access to native platform APIs
- Use Angular, Vue, Solid, React, or Svelte!`,

  math: `Let me show you some **mathematical expressions**:

### Quadratic Formula
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### Euler's Identity
The most beautiful equation in mathematics:
$$e^{i\\pi} + 1 = 0$$

### Inline Math
You can also use inline math like $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$ within text.

### Calculus
$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

Pretty cool, right? 🧮`,

  hello: `# Hello! 👋

Nice to meet you! I'm running **natively** through NativeScript.

## What makes this special?

> Every element you see is a *real* native platform view.

### Benefits:
- ⚡ Native performance
- 🎨 Platform-specific styling
- 📱 Smooth scrolling
- 🔧 Direct API access

Tap the options below to explore more demos!`,
};

const messages = ref<ChatMessage[]>([
  {
    id: '1',
    role: 'assistant',
    content: AI_RESPONSES.hello,
    isStreaming: false,
  },
]);

const isTyping = ref(false);

function goBack() {
  emit('back');
}

function getMessageConfig(message: ChatMessage) {
  return {
    mode: message.isStreaming ? 'streaming' : 'static',
    controls: true,
    showCaret: message.isStreaming,
  };
}

function sendPrompt(key: string) {
  const promptLabels: Record<string, string> = {
    code: 'Show me a code example',
    table: 'Show me a table',
    math: 'Show me math equations',
    default: 'What can you do?',
  };

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: promptLabels[key] || key,
    isStreaming: false,
  };

  messages.value = [...messages.value, userMessage];
  isTyping.value = true;

  setTimeout(() => {
    isTyping.value = false;
    setTimeout(() => {
      streamResponse(key);
    });
  }, 500);
}

function streamResponse(key: string) {
  const fullResponse = AI_RESPONSES[key] || AI_RESPONSES.default;
  const chunks = fullResponse.split(/(?<=\s)/);

  const messageId = Date.now().toString();
  const streamingMessage: ChatMessage = {
    id: messageId,
    role: 'assistant',
    content: '',
    isStreaming: true,
  };

  messages.value = [...messages.value, streamingMessage];

  let chunkIndex = 0;
  const interval = setInterval(() => {
    if (chunkIndex < chunks.length) {
      const messageIndex = messages.value.findIndex((m) => m.id === messageId);

      if (messageIndex !== -1) {
        const updatedMessages = [...messages.value];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: updatedMessages[messageIndex].content + chunks[chunkIndex],
        };
        messages.value = updatedMessages;
      }

      chunkIndex++;
    } else {
      clearInterval(interval);

      const messageIndex = messages.value.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        const updatedMessages = [...messages.value];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          isStreaming: false,
        };
        messages.value = updatedMessages;
      }
    }
  }, 25);
}

function clearChat() {
  messages.value = [
    {
      id: '1',
      role: 'assistant',
      content: AI_RESPONSES.hello,
      isStreaming: false,
    },
  ];
}
</script>

<template>
  <Page>
    <ActionBar flat="true" class="bg-slate-50" title="AI Chat">
      <NavigationButton text="Back" @tap="goBack" />
      <ActionItem ios.position="right" @tap="clearChat" text="Clear" />
    </ActionBar>

    <GridLayout rows="*, auto" class="bg-slate-100">
      <!-- Messages -->
      <ScrollView row="0">
        <StackLayout class="p-4">
          <template v-for="message in messages" :key="message.id">
            <!-- User message -->
            <GridLayout v-if="message.role === 'user'" columns="*, auto" class="mb-3">
              <StackLayout col="1" class="bg-blue-600 rounded-2xl rounded-br-sm py-2 px-3 max-w-[280]">
                <Label :text="message.content" class="text-white text-sm" textWrap="true" />
              </StackLayout>
            </GridLayout>

            <!-- Assistant message -->
            <GridLayout v-if="message.role === 'assistant'" columns="32, *" class="mb-3">
              <GridLayout col="0" rows="32" columns="32" class="bg-purple-600 rounded-full mr-2 h-[32] w-[32]">
                <Label text="AI" class="text-white text-xs font-bold text-center" />
              </GridLayout>
              <StackLayout col="1" class="bg-white rounded-2xl rounded-tl-sm py-2 px-3 shadow-sm">
                <Streamdown :content="message.content" :config="getMessageConfig(message)" />
              </StackLayout>
            </GridLayout>
          </template>

          <!-- Typing indicator -->
          <GridLayout v-if="isTyping" columns="32, auto" class="mb-3">
            <GridLayout col="0" rows="32" columns="32" class="bg-purple-600 rounded-full mr-2 h-[32] w-[32]">
              <Label text="AI" class="text-white text-xs font-bold text-center" />
            </GridLayout>
            <StackLayout col="1" class="bg-white rounded-2xl py-2 px-3 shadow-sm">
              <Label text="•••" class="text-slate-400 text-base" />
            </StackLayout>
          </GridLayout>
        </StackLayout>
      </ScrollView>

      <!-- Quick action buttons -->
      <GridLayout row="1" columns="*, *, *, *" class="bg-white px-2 py-3 border-t border-slate-200">
        <Button col="0" text="💻 Code" class="text-xs bg-slate-100 rounded-lg m-1" @tap="sendPrompt('code')" />
        <Button col="1" text="📊 Table" class="text-xs bg-slate-100 rounded-lg m-1" @tap="sendPrompt('table')" />
        <Button col="2" text="🧮 Math" class="text-xs bg-slate-100 rounded-lg m-1" @tap="sendPrompt('math')" />
        <Button col="3" text="❓ Help" class="text-xs bg-slate-100 rounded-lg m-1" @tap="sendPrompt('default')" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>
