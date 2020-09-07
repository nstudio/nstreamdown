/**
 * Streamdown Demo Component
 * Demonstrates real-time AI streaming markdown rendering on iOS
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { NativeScriptCommonModule, RouterExtensions } from '@nativescript/angular';
import { ScrollView, isIOS, isAndroid, Page } from '@nativescript/core';
import { Streamdown } from '@nstudio/nstreamdown/angular';
import type { StreamdownConfig } from '@nstudio/nstreamdown/angular';

// Platform-specific code example
const PLATFORM_CODE_EXAMPLE = isIOS
  ? `And here's some Swift for iOS:

\`\`\`swift
import UIKit

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        print("Hello from NativeScript!")
    }
}
\`\`\``
  : `And here's some Kotlin for Android:

\`\`\`kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        println("Hello from NativeScript!")
    }
}
\`\`\``;

// Sample AI response that demonstrates all markdown features
const DEMO_MARKDOWN = `# NativeScript Streamdown 🚀

This is a **native** implementation of [streamdown.ai](https://streamdown.ai), designed for real-time AI streaming content.

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

${PLATFORM_CODE_EXAMPLE}

## Tables

| Hobby | Jack | Jill |
|---------|------------|----------------|
| Running | ✅ Yes | ❌ No |
| Cooking | ❌ No | ✅ Yes |
| Driving | ✅ Yes | ✅ Yes |

## Images 

![This could be your backyard](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi-O9OCjpI-7q-D_7cRbQ1AYOO-SBSbNi3zw&s)

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

**日本語、中文、한국어** are fully supported with proper emphasis handling.

~~日本語、中文、한국어~~ or with strikethrough handling.

---

*Powered by NativeScript and rendered natively on iOS ✨*`;

// Simulated streaming chunks
const STREAMING_CHUNKS = DEMO_MARKDOWN.split(/(?<=\s)/);

@Component({
  selector: 'StreamdownDemo',
  templateUrl: './streamdown-demo.html',
  imports: [NativeScriptCommonModule, Streamdown],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamdownDemo implements OnInit, OnDestroy {
  @ViewChild('scrollView') scrollViewRef!: ElementRef;

  // State
  currentContent = signal('');
  isStreaming = signal(false);
  streamingMode = signal<'streaming' | 'static'>('streaming');
  charCount = signal('0');
  tokenCount = signal('0');
  streamSpeed = signal('0');
  isIOS = isIOS;

  // Streaming state
  private streamIndex = 0;
  private streamInterval: any = null;
  private startTime = 0;

  config = signal<StreamdownConfig>({
    mode: 'streaming',
    controls: true,
    showCaret: true,
    caret: '▋',
  });

  page = inject(Page);

  constructor(private routerExtensions: RouterExtensions) {
    this.page.statusBarStyle = 'dark';
  }

  ngOnInit() {
    this.currentContent.set(`# Ready\n\nTap **Play** to begin the streaming demo...`);
  }

  ngOnDestroy() {
    this.stopStreaming();
  }

  goBack() {
    this.routerExtensions.back();
  }

  toggleStreaming() {
    if (this.isStreaming()) {
      this.stopStreaming();
    } else {
      this.startStreaming();
    }
  }

  startStreaming() {
    this.streamIndex = 0;
    this.currentContent.set('');
    this.isStreaming.set(true);
    this.startTime = Date.now();

    this.streamInterval = setInterval(() => {
      if (this.streamIndex < STREAMING_CHUNKS.length) {
        // Process multiple chunks at once for better performance
        const chunksToProcess = Math.min(3, STREAMING_CHUNKS.length - this.streamIndex);
        let newContent = this.currentContent();
        for (let j = 0; j < chunksToProcess; j++) {
          newContent += STREAMING_CHUNKS[this.streamIndex + j];
        }
        this.currentContent.set(newContent);
        this.streamIndex += chunksToProcess;
        this.updateStats();
        this.scrollToBottom();
      } else {
        this.stopStreaming();
      }
    }, 50);
  }

  stopStreaming() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    this.isStreaming.set(false);
  }

  setMode(mode: 'streaming' | 'static') {
    this.streamingMode.set(mode);
    this.config.set({
      ...this.config(),
      mode,
      showCaret: mode === 'streaming',
    });

    if (mode === 'static') {
      this.stopStreaming();
      this.currentContent.set(DEMO_MARKDOWN);
      this.updateStats();
    }
  }

  private scrollToBottom() {
    if (this.scrollViewRef?.nativeElement) {
      const scrollView = this.scrollViewRef.nativeElement as ScrollView;
      setTimeout(() => {
        scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, false);
      }, 10);
    }
  }

  private updateStats() {
    const content = this.currentContent();
    this.charCount.set(content.length.toString());
    this.tokenCount.set(Math.floor(content.length / 4).toString());

    const elapsed = (Date.now() - this.startTime) / 1000;
    if (elapsed > 0) {
      this.streamSpeed.set(Math.floor(content.length / elapsed).toString());
    }
  }
}
