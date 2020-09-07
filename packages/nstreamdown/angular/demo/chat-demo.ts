/**
 * Chat Demo Component
 * Interactive AI chat interface demonstrating real-time streaming
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, ViewChild, ElementRef } from '@angular/core';
import { NativeScriptCommonModule, RouterExtensions } from '@nativescript/angular';
import { ScrollView, View } from '@nativescript/core';
import { Streamdown, StreamdownConfig } from '../index';
import { showMenu, MenuConfig } from '@nstudio/nstreamdown';

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

Use the **⋯** menu to explore more demos!`,
};

@Component({
  selector: 'ChatDemo',
  template: `
    <GridLayout rows="auto, *, auto" class="bg-slate-100">
      <!-- Native ActionBar -->
      <ActionBar flat="true" class="bg-slate-50" title="AI Chat">
        <NavigationButton text="" android.systemIcon="ic_menu_back" (tap)="goBack()"></NavigationButton>
        <ActionItem ios.position="right" (tap)="clearChat()">
          <Image src="sys://trash" class="w-5 h-5 text-red-500"></Image>
        </ActionItem>
      </ActionBar>

      <!-- Messages -->
      <ScrollView row="1" #scrollView>
        <StackLayout class="p-4">
          @for (message of messages(); track $index) {
            <!-- User message -->
            @if (message.role === 'user') {
              <GridLayout columns="*, auto" class="mb-3">
                <StackLayout col="1" class="bg-blue-600 rounded-2xl rounded-br-sm py-2 px-3 max-w-[280]">
                  <Label [text]="message.content" class="text-white text-sm leading-[3]" textWrap="true"></Label>
                </StackLayout>
              </GridLayout>
            }

            <!-- Assistant message -->
            @if (message.role === 'assistant') {
              <GridLayout columns="32, *" class="mb-3">
                <!-- Avatar - using GridLayout for vertical centering -->
                <GridLayout col="0" rows="32" columns="32" class="bg-purple-600 rounded-full mr-2 h-[32] w-[32]">
                  <Label text="AI" class="text-white text-xs font-bold text-center"></Label>
                </GridLayout>

                <!-- Message bubble -->
                <StackLayout col="1" class="bg-white rounded-2xl rounded-tl-sm py-2 px-3 shadow-sm">
                  <Streamdown [content]="message.content" [config]="getMessageConfig(message)"></Streamdown>
                </StackLayout>
              </GridLayout>
            }
          }

          <!-- Typing indicator -->
          @if (isTyping()) {
            <GridLayout columns="32, auto" class="mb-3">
              <GridLayout col="0" rows="32" columns="32" class="bg-purple-600 rounded-full mr-2 h-[32] w-[32]">
                <Label text="AI" class="text-white text-xs font-bold text-center"></Label>
              </GridLayout>
              <StackLayout col="1" class="bg-white rounded-2xl py-2 px-3 shadow-sm">
                <Label text="•••" class="text-slate-400 text-base"></Label>
              </StackLayout>
            </GridLayout>
          }
        </StackLayout>
      </ScrollView>

      <!-- Bottom menu bar -->
      <GridLayout row="2" columns="*, auto" class="bg-white px-4 py-3 border-t border-slate-200">
        <Label col="0" text="Tap menu to explore demos" class="text-xs text-slate-400"></Label>
        <StackLayout col="1" #menuAnchor class="bg-slate-100 rounded-lg px-3 py-2" (tap)="showOptionsMenu($event)">
          <Label text="⋯ Options" class="text-sm text-slate-600 font-medium"></Label>
        </StackLayout>
      </GridLayout>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule, Streamdown],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatDemo {
  @ViewChild('scrollView') scrollViewRef!: ElementRef;
  @ViewChild('menuAnchor') menuAnchorRef!: ElementRef;

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: AI_RESPONSES.hello,
      isStreaming: false,
    },
  ]);

  isTyping = signal(false);

  constructor(private routerExtensions: RouterExtensions) {}

  getMessageConfig(message: ChatMessage): StreamdownConfig {
    return {
      mode: message.isStreaming ? 'streaming' : 'static',
      controls: true,
      showCaret: message.isStreaming,
    };
  }

  async showOptionsMenu(args: any) {
    const view = args.object as View;

    const config: MenuConfig = {
      title: 'Demo Options',
      items: [
        { id: 'code', title: 'Show Code Example', icon: 'doc.text' },
        { id: 'table', title: 'Show Table', icon: 'tablecells' },
        { id: 'math', title: 'Show Math', icon: 'function' },
        {
          id: 'default',
          title: 'What can you do?',
          icon: 'questionmark.circle',
        },
      ],
    };

    const result = await showMenu(view, config);
    if (result) {
      this.sendPrompt(result.itemId);
    }
  }

  sendPrompt(key: string) {
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

    this.messages.set([...this.messages(), userMessage]);
    this.isTyping.set(true);
    this.scrollToBottom();

    setTimeout(() => {
      // allow render update on next tick
      this.isTyping.set(false);
      setTimeout(() => {
        // now simulate streaming response
        this.streamResponse(key);
      });
    }, 500);
  }

  private streamResponse(key: string) {
    const fullResponse = AI_RESPONSES[key] || AI_RESPONSES.default;
    const chunks = fullResponse.split(/(?<=\s)/);

    const messageId = Date.now().toString();
    const streamingMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    this.messages.set([...this.messages(), streamingMessage]);

    let chunkIndex = 0;
    const interval = setInterval(() => {
      if (chunkIndex < chunks.length) {
        const currentMessages = this.messages();
        const messageIndex = currentMessages.findIndex((m) => m.id === messageId);

        if (messageIndex !== -1) {
          const updatedMessages = [...currentMessages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: updatedMessages[messageIndex].content + chunks[chunkIndex],
          };
          this.messages.set(updatedMessages);
          this.scrollToBottom();
        }

        chunkIndex++;
      } else {
        clearInterval(interval);

        const currentMessages = this.messages();
        const messageIndex = currentMessages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          const updatedMessages = [...currentMessages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            isStreaming: false,
          };
          this.messages.set(updatedMessages);
        }
      }
    }, 25);
  }

  private scrollToBottom() {
    if (this.scrollViewRef?.nativeElement) {
      const scrollView = this.scrollViewRef.nativeElement as ScrollView;
      setTimeout(() => {
        scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, false);
      }, 10);
    }
  }

  clearChat() {
    this.messages.set([
      {
        id: '1',
        role: 'assistant',
        content: AI_RESPONSES.hello,
        isStreaming: false,
      },
    ]);
  }

  goBack() {
    this.routerExtensions.back();
  }
}
