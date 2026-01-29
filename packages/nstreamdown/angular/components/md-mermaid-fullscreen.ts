/**
 * MdMermaidFullscreen Component
 * Fullscreen modal view for Mermaid diagrams
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, inject, OnDestroy } from '@angular/core';
import { NativeDialogModule, NativeDialogRef, NATIVE_DIALOG_DATA, NativeScriptCommonModule } from '@nativescript/angular';
import { WebView } from '@nativescript/core';
import { WKScriptMessageHandlerImpl } from '@nstudio/nstreamdown';

// Mermaid CDN URL - using ESM build for modern browsers
const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

export interface MermaidFullscreenData {
  content: string;
  darkMode: boolean;
}

/**
 * Generate HTML content for rendering mermaid diagrams in fullscreen
 */
function generateMermaidHTML(diagram: string, darkMode: boolean): string {
  const theme = darkMode ? 'dark' : 'default';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  // Escape the diagram content for safe embedding in HTML
  const escapedDiagram = diagram.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
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
      overflow: auto;
    }
    #container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100%;
      padding: 20px;
    }
    .mermaid {
      max-width: 100%;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
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
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: false,
        diagramMarginX: 8,
        diagramMarginY: 8
      },
      gantt: {
        useMaxWidth: false
      },
      pie: {
        useMaxWidth: false
      }
    });

    mermaid.run().catch((error) => {
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
  selector: 'MdMermaidFullscreen',
  template: `
    <GridLayout rows="auto, *" class="bg-slate-900" statusBarStyle="dark">
      <!-- Header with close button -->
      <GridLayout row="0" columns="auto, *, auto" class="bg-slate-800 px-4 py-3 safe-area-top">
        <Label col="0" text="◇ Mermaid Diagram" class="text-base text-purple-400 font-medium"></Label>
        <Label col="1"></Label>
        @if (isIOS) {
          <Image src="sys://xmark.circle.fill" col="2" class="w-6 h-6 text-slate-400" (tap)="onClose()"></Image>
        } @else {
          <Label col="2" text="✕" class="text-xl text-slate-400 px-2" (tap)="onClose()"></Label>
        }
      </GridLayout>

      <!-- Fullscreen WebView -->
      <WebView row="1" class="w-full h-full" (loaded)="onWebViewLoaded($event)"></WebView>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule, NativeDialogModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMermaidFullscreen implements OnDestroy {
  private dialogRef = inject(NativeDialogRef<MdMermaidFullscreen>, { optional: true });
  private data = inject<MermaidFullscreenData>(NATIVE_DIALOG_DATA, { optional: true });

  isIOS = __APPLE__;
  private webView: WebView | null = null;

  ngOnDestroy(): void {
    this.webView = null;
  }

  onWebViewLoaded(args: any): void {
    const webView = args.object as WebView;
    this.webView = webView;

    if (__APPLE__ && webView && this.data) {
      const wkWebView = webView.ios as WKWebView;
      if (wkWebView) {
        // Configure WKWebView for fullscreen mermaid rendering
        wkWebView.scrollView.scrollEnabled = true;
        wkWebView.scrollView.bounces = true;
        wkWebView.scrollView.minimumZoomScale = 1.0;
        wkWebView.scrollView.maximumZoomScale = 3.0;
        wkWebView.opaque = false;
        wkWebView.backgroundColor = UIColor.clearColor;

        // Load the mermaid diagram
        const html = generateMermaidHTML(this.data.content, this.data.darkMode);
        wkWebView.loadHTMLStringBaseURL(html, null);
      }
    } else if (webView && this.data) {
      const androidWebView = webView.android as android.webkit.WebView;
      if (androidWebView) {
        // Configure Android WebView for fullscreen mermaid rendering
        const settings = androidWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true); // Required for mermaid.js
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);

        androidWebView.setBackgroundColor(0x00000000); // Transparent background

        // Load the mermaid diagram
        const html = generateMermaidHTML(this.data.content, this.data.darkMode);
        androidWebView.loadDataWithBaseURL('https://cdn.jsdelivr.net', html, 'text/html', 'UTF-8', null);
      }
    }
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}
