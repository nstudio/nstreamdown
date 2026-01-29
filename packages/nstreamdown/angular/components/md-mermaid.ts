/**
 * MdMermaid Component
 * Renders Mermaid diagrams using WKWebView with mermaid.js on iOS
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, input, computed, effect, OnDestroy, inject } from '@angular/core';
import { NativeDialog, NativeScriptCommonModule } from '@nativescript/angular';
import { isIOS, View, WebView } from '@nativescript/core';
import { copyToClipboard, WKScriptMessageHandlerImpl, RoundedOutlineProvider } from '@nstudio/nstreamdown';
import { MdMermaidFullscreen, MermaidFullscreenData } from './md-mermaid-fullscreen';

// Mermaid CDN URL - using ESM build for modern browsers
const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

/**
 * Generate HTML content for rendering mermaid diagrams
 */
function generateMermaidHTML(diagram: string, darkMode: boolean): string {
  const theme = darkMode ? 'dark' : 'default';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1a1a1a';

  // Escape the diagram content for safe embedding in HTML
  const escapedDiagram = diagram.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background-color: ${bgColor};
      overflow: hidden;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    #container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 16px;
    }
    .mermaid {
      max-width: 100%;
      overflow: hidden;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
    /* Loading state */
    .loading {
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      text-align: center;
    }
    /* Error state */
    .error {
      color: #ef4444;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div id="container">
    <pre class="mermaid">${escapedDiagram}</pre>
  </div>
  <script type="module">
    import mermaid from '${MERMAID_CDN}';

    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme}',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 8,
        diagramMarginY: 8
      },
      gantt: {
        useMaxWidth: true
      },
      pie: {
        useMaxWidth: true
      }
    });

    // Handle render completion
    mermaid.run().then(() => {
      // Notify iOS that rendering is complete
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.renderComplete) {
        const svg = document.querySelector('.mermaid svg');
        if (svg) {
          const rect = svg.getBoundingClientRect();
          window.webkit.messageHandlers.renderComplete.postMessage({
            width: rect.width,
            height: rect.height
          });
        }
      }
    }).catch((error) => {
      console.error('Mermaid render error:', error);
      const container = document.getElementById('container');
      if (container) {
        container.innerHTML = '<div class="error">Failed to render diagram</div>';
      }
    });
  </script>
</body>
</html>
`;
}

@Component({
  selector: 'MdMermaid',
  template: `
    <GridLayout class="rounded-xl border border-purple-200 dark:border-purple-800 my-3 overflow-hidden" rows="auto, auto" (loaded)="onContainerLoaded($event)">
      <!-- Header with diagram type and controls -->
      <GridLayout row="0" columns="auto, *, auto, auto" class="bg-purple-50 dark:bg-purple-950 border-b border-purple-200 dark:border-purple-800 px-3 py-2">
        <Label col="0" text="◇ Mermaid" class="text-xs text-purple-600 dark:text-purple-400 font-medium"></Label>
        <Label col="1"></Label>
        @if (isIOS) {
          <Image [src]="fullscreen() ? 'sys://arrow.down.right.and.arrow.up.left' : 'sys://arrow.up.left.and.arrow.down.right'" col="2" class="w-4 h-4 text-purple-400 mr-2" (tap)="onToggleFullscreen()"></Image>
          <Image [src]="copied() ? 'sys://checkmark.circle' : 'sys://document.on.document'" col="3" class="w-4 h-4 text-purple-400" (tap)="onCopy()"></Image>
        } @else {
          <Label col="2" [text]="fullscreen() ? '⤢' : '⤡'" class="text-base text-purple-400 px-1 h-[18]" translateY="-6" (tap)="onToggleFullscreen()"></Label>
          <Label col="3" [text]="copied() ? '✓' : '📋'" class="text-base text-purple-400 px-1 h-[18]" (tap)="onCopy()"></Label>
        }
      </GridLayout>

      <!-- Mermaid diagram content -->
      <StackLayout row="1" class="bg-slate-50 dark:bg-slate-800" [height]="containerHeight()">
        <WebView #mermaidWebView class="w-full h-full" (loaded)="onWebViewLoaded($event)"></WebView>
      </StackLayout>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMermaid implements OnDestroy {
  nativeDialog = inject(NativeDialog);
  /** The mermaid diagram content */
  content = input('');

  /** Whether to use dark mode theme */
  darkMode = input(true);

  /** Whether diagram is incomplete (streaming) */
  isIncomplete = input(false);

  // Platform check
  isIOS = __APPLE__;

  // UI state
  copied = signal(false);
  fullscreen = signal(false);
  containerHeight = signal(250); // Default height, will be adjusted based on content

  // WebView reference
  private webView: any = null;
  private lastRenderedContent = '';
  private messageHandlerAdded = false;

  // Computed HTML content for the WebView
  htmlContent = computed(() => {
    const diagramContent = this.content();
    if (!diagramContent) {
      return '';
    }
    return generateMermaidHTML(diagramContent, this.darkMode());
  });

  constructor() {
    // Effect to update WebView when content changes
    effect(() => {
      const content = this.content();
      const html = this.htmlContent();

      // Only update if content has changed and we have a webview
      if (this.webView && content && content !== this.lastRenderedContent) {
        this.lastRenderedContent = content;
        this.updateWebView(html);
      }
    });
  }

  ngOnDestroy(): void {
    // Remove message handler on iOS to prevent "already exists" warning
    if (__APPLE__ && this.webView && this.messageHandlerAdded) {
      try {
        const wkWebView = (this.webView as WebView).ios;
        if (wkWebView?.configuration?.userContentController) {
          wkWebView.configuration.userContentController.removeScriptMessageHandlerForName('renderComplete');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      this.messageHandlerAdded = false;
    }
    this.webView = null;
  }

  onContainerLoaded(args: any): void {
    // Apply rounded corners
    const view = args.object as View;
    if (isIOS) {
      const nativeView = view.ios;
      if (nativeView) {
        nativeView.layer.cornerRadius = 12;
        nativeView.layer.masksToBounds = true;
      }
    } else {
      const nativeView = view.android as android.view.View;
      if (nativeView) {
        const density = android.content.res.Resources.getSystem().getDisplayMetrics().density;
        const radiusPx = 12 * density;
        // @ts-expect-error
        nativeView.setOutlineProvider(new RoundedOutlineProvider(radiusPx));
        nativeView.setClipToOutline(true);
      }
    }
  }

  onWebViewLoaded(args: any): void {
    const webView = args.object as WebView;
    this.webView = webView;

    if (__APPLE__ && webView) {
      const wkWebView = webView.ios as WKWebView; // WKWebView instance
      if (wkWebView) {
        // Configure WKWebView for optimal mermaid rendering
        wkWebView.scrollView.scrollEnabled = false;
        wkWebView.scrollView.bounces = false;
        wkWebView.opaque = false;
        wkWebView.backgroundColor = UIColor.clearColor;

        // Set up message handler for render completion
        this.setupMessageHandler(wkWebView);

        // Initial render - load HTML directly into WKWebView
        const content = this.content();
        if (content) {
          this.lastRenderedContent = content;
          const html = this.htmlContent();
          wkWebView.loadHTMLStringBaseURL(html, null);
        }
      }
    } else {
      const androidWebView = webView.android as android.webkit.WebView;
      if (androidWebView) {
        // Configure Android WebView for mermaid rendering (same as iOS)
        const settings = androidWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true); // Required for mermaid.js
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        androidWebView.setBackgroundColor(0x00000000); // Transparent background

        // Load the same mermaid HTML as iOS
        const content = this.content();
        if (content) {
          this.lastRenderedContent = content;
          const html = this.htmlContent();
          // Use loadDataWithBaseURL with a base URL to allow loading CDN resources
          androidWebView.loadDataWithBaseURL('https://cdn.jsdelivr.net', html, 'text/html', 'UTF-8', null);
        }
      }
    }
  }

  private setupMessageHandler(wkWebView: any): void {
    if (!wkWebView || !wkWebView.configuration?.userContentController) {
      return;
    }

    // Only add handler once
    if (this.messageHandlerAdded) {
      return;
    }

    // Add script message handler for render completion
    const handler = WKScriptMessageHandlerImpl.new() as WKScriptMessageHandlerImpl;
    handler.callback = (message: any) => {
      if (message && message.body) {
        const { height } = message.body;
        if (height && typeof height === 'number') {
          // Update container height based on rendered diagram size
          // Add some padding
          const newHeight = Math.max(150, Math.min(600, height + 40));
          this.containerHeight.set(newHeight);
        }
      }
    };

    try {
      wkWebView.configuration.userContentController.addScriptMessageHandlerName(handler, 'renderComplete');
      this.messageHandlerAdded = true;
    } catch (e) {
      // Handler may already exist, ignore
      console.log('[MdMermaid] Message handler setup:', e);
    }
  }

  private updateWebView(html: string): void {
    if (!this.webView || !html) {
      return;
    }

    if (__APPLE__) {
      const wkWebView = (this.webView as WebView).ios;
      if (wkWebView) {
        // Load HTML string directly into WKWebView
        wkWebView.loadHTMLStringBaseURL(html, null);
      }
    } else {
      const androidWebView = (this.webView as WebView).android as android.webkit.WebView;
      if (androidWebView) {
        // Load HTML string into Android WebView
        androidWebView.loadDataWithBaseURL('https://cdn.jsdelivr.net', html, 'text/html', 'UTF-8', null);
      }
    }
  }

  onCopy(): void {
    if (copyToClipboard(this.content())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  onToggleFullscreen(): void {
    this.fullscreen.set(true);
    const dialogRef = this.nativeDialog.open<MdMermaidFullscreen, MermaidFullscreenData>(MdMermaidFullscreen, {
      data: {
        content: this.content(),
        darkMode: this.darkMode(),
      },
      nativeOptions: {
        fullscreen: true,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.fullscreen.set(false);
    });
  }
}
