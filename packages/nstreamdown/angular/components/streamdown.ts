/**
 * Streamdown Component
 * Main component for rendering streaming markdown content natively on iOS
 *
 * Features:
 * - Real-time streaming markdown rendering
 * - Handles incomplete markdown tokens gracefully
 * - Supports GFM (GitHub Flavored Markdown)
 * - Code blocks with syntax highlighting
 * - Tables with copy/download functionality
 * - Images with loading states
 * - Math expressions
 * - Blockquotes, lists, and more
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, computed, OnDestroy, input, output, effect } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { parseMarkdown, MarkdownToken, remend } from '@nstudio/nstreamdown';

// Import all markdown components
import { MdHeading } from './md-heading';
import { MdParagraph } from './md-paragraph';
import { MdCodeBlock } from './md-code-block';
import { MdBlockquote } from './md-blockquote';
import { MdList } from './md-list';
import { MdTable } from './md-table';
import { MdImage } from './md-image';
import { MdHorizontalRule } from './md-horizontal-rule';
import { MdMath } from './md-math';
import { MdInline } from './md-inline';

export interface StreamdownConfig {
  /** Mode: 'streaming' for real-time updates, 'static' for complete markdown */
  mode?: 'streaming' | 'static';
  /** Whether to show copy/download controls */
  controls?: boolean;
  /** Whether to animate the caret during streaming */
  showCaret?: boolean;
  /** Custom caret character */
  caret?: string;
}

@Component({
  selector: 'Streamdown',
  template: `
    <StackLayout class="streamdown-container">
      @for (token of tokens(); track trackToken($index, token)) {
        <!-- Headings -->
        @if (isHeading(token)) {
          <MdHeading [level]="getHeadingLevel(token)" [content]="token.content" [children]="token.children || []"></MdHeading>
        }

        <!-- Paragraphs -->
        @if (token.type === 'paragraph') {
          <MdParagraph [content]="token.content" [children]="token.children || []"></MdParagraph>
        }

        <!-- Code blocks -->
        @if (token.type === 'code-block') {
          <MdCodeBlock [code]="token.content" [language]="getLanguage(token)" [isIncomplete]="getIsIncomplete(token)"></MdCodeBlock>
        }

        <!-- Blockquotes -->
        @if (token.type === 'blockquote') {
          <MdBlockquote [content]="token.content" [children]="token.children || []"></MdBlockquote>
        }

        <!-- Ordered lists -->
        @if (token.type === 'list-ordered') {
          <MdList [ordered]="true" [items]="token.children || []"></MdList>
        }

        <!-- Unordered lists -->
        @if (token.type === 'list-unordered') {
          <MdList [ordered]="false" [items]="token.children || []"></MdList>
        }

        <!-- Tables -->
        @if (token.type === 'table') {
          <MdTable [rows]="token.children || []"></MdTable>
        }

        <!-- Images -->
        @if (token.type === 'image') {
          <MdImage [src]="getUrl(token)" [alt]="token.content"></MdImage>
        }

        <!-- Horizontal rules -->
        @if (token.type === 'horizontal-rule') {
          <MdHorizontalRule></MdHorizontalRule>
        }

        <!-- Math blocks -->
        @if (token.type === 'math-block') {
          <MdMath [content]="token.content" [block]="true"></MdMath>
        }
      }

      <!-- Streaming caret -->
      @if (showCaret() && isStreaming()) {
        <Label [text]="caretChar()" class="text-lg text-gray-400 dark:text-gray-500 animate-pulse"></Label>
      }
    </StackLayout>
  `,
  imports: [NativeScriptCommonModule, MdHeading, MdParagraph, MdCodeBlock, MdBlockquote, MdList, MdTable, MdImage, MdHorizontalRule, MdMath, MdInline],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Streamdown implements OnDestroy {
  /** The markdown content to render */
  content = input('');

  /** Configuration options */
  config = input<StreamdownConfig>({});

  /** Emitted when a link is tapped */
  linkTap = output<string>();

  /** Emitted when parsing is complete */
  parseComplete = output<void>();

  // Internal state
  private _markdown = signal('');
  private _throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private _pendingContent: string = '';
  private _lastUpdateTime = 0;

  // Throttle interval in ms (16ms = ~60fps, 32ms = ~30fps)
  private readonly THROTTLE_MS = 32;

  // Computed parsed result (tokens + isComplete)
  private _parsedResult = computed(() => {
    const markdown = this._markdown();
    if (!markdown) return { tokens: [], isComplete: true };

    const isStreaming = this.mode() === 'streaming';
    return parseMarkdown(markdown, isStreaming);
  });

  // Computed tokens from parsed result
  tokens = computed(() => this._parsedResult().tokens);

  // Computed isComplete from parsed result
  private _isComplete = computed(() => this._parsedResult().isComplete);

  // Computed config values
  mode = computed(() => this.config().mode || 'streaming');
  showCaret = computed(() => this.config().showCaret ?? true);
  caretChar = computed(() => this.config().caret || '▋');

  isStreaming = computed(() => this.mode() === 'streaming' && !this._isComplete());

  constructor() {
    // Effect to handle content changes with throttling
    effect(() => {
      const newContent = this.content();
      const currentMode = this.mode();

      // Throttle updates during streaming to prevent overwhelming the render loop
      if (currentMode === 'streaming') {
        this._pendingContent = newContent;
        const now = Date.now();
        const elapsed = now - this._lastUpdateTime;

        if (elapsed >= this.THROTTLE_MS) {
          // Enough time has passed, update immediately
          this._lastUpdateTime = now;
          this._markdown.set(newContent);
        } else if (!this._throttleTimer) {
          // Schedule an update
          this._throttleTimer = setTimeout(() => {
            this._throttleTimer = null;
            this._lastUpdateTime = Date.now();
            this._markdown.set(this._pendingContent);
          }, this.THROTTLE_MS - elapsed);
        }
      } else {
        // Static mode - update immediately
        this._markdown.set(newContent);
      }
    });
  }

  // Track tokens by index + content length to force updates during streaming
  trackToken(index: number, token: MarkdownToken): string {
    return `${index}-${token.type}-${token.content?.length || 0}`;
  }

  ngOnDestroy() {
    if (this._throttleTimer) {
      clearTimeout(this._throttleTimer);
      this._throttleTimer = null;
    }
  }

  isHeading(token: MarkdownToken): boolean {
    return token.type.startsWith('heading');
  }

  getHeadingLevel(token: MarkdownToken): 1 | 2 | 3 | 4 | 5 | 6 {
    const level = parseInt(token.type.replace('heading', ''), 10);
    return (level >= 1 && level <= 6 ? level : 1) as 1 | 2 | 3 | 4 | 5 | 6;
  }

  // Helper methods for metadata access with proper typing
  getLanguage(token: MarkdownToken): string {
    return (token.metadata?.['language'] as string) || '';
  }

  getIsIncomplete(token: MarkdownToken): boolean {
    return (token.metadata?.['isIncomplete'] as boolean) || false;
  }

  getUrl(token: MarkdownToken): string {
    return (token.metadata?.['url'] as string) || '';
  }
}
