/**
 * MdMermaid Component for Solid
 * Renders Mermaid diagrams using WebView with mermaid.js
 */
import { createSignal, createEffect, onCleanup, Show, JSX } from 'solid-js';
import { isIOS, WebView } from '@nativescript/core';
import { 
  copyToClipboard, 
  generateMermaidHTML, 
  configureIOSWebViewForMermaid, 
  configureAndroidWebViewForMermaid,
  loadMermaidIntoIOSWebView,
  loadMermaidIntoAndroidWebView,
  WKScriptMessageHandlerImpl
} from '@nstudio/nstreamdown';

// Declare Android types
declare const android: any;
declare const org: any;

export interface MdMermaidProps {
  content: string;
  darkMode?: boolean;
  isIncomplete?: boolean;
}

export function MdMermaid(props: MdMermaidProps): JSX.Element {
  const [copied, setCopied] = createSignal(false);
  const [fullscreen, setFullscreen] = createSignal(false);
  const [containerHeight, setContainerHeight] = createSignal(250);

  let webView: WebView | null = null;
  let lastRenderedContent = '';
  let messageHandlerAdded = false;

  // Get current dark mode
  const darkMode = () => props.darkMode ?? true;

  // Compute HTML content
  const htmlContent = () => {
    if (!props.content) return '';
    return generateMermaidHTML(props.content, { darkMode: darkMode() });
  };

  // Watch for content changes
  createEffect(() => {
    const content = props.content;
    const html = htmlContent();
    
    if (webView && content && content !== lastRenderedContent) {
      lastRenderedContent = content;
      updateWebView(html);
    }
  });

  // Cleanup
  onCleanup(() => {
    if (isIOS && webView && messageHandlerAdded) {
      try {
        const wkWebView = (webView as any).ios;
        if (wkWebView?.configuration?.userContentController) {
          wkWebView.configuration.userContentController.removeScriptMessageHandlerForName('renderComplete');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      messageHandlerAdded = false;
    }
    webView = null;
  });

  function onContainerLoaded(args: any) {
    const view = args.object;
    if (isIOS) {
      const nativeView = view.ios;
      if (nativeView) {
        nativeView.layer.cornerRadius = 12;
        nativeView.layer.masksToBounds = true;
      }
    } else {
      const nativeView = view.android;
      if (nativeView) {
        const density = android.content.res.Resources.getSystem().getDisplayMetrics().density;
        const radiusPx = 12 * density;
        const provider = new org.nativescript.streamdown.RoundedOutlineProvider(radiusPx);
        nativeView.setOutlineProvider(provider);
        nativeView.setClipToOutline(true);
      }
    }
  }

  function onWebViewLoaded(args: any) {
    webView = args.object as WebView;

    if (isIOS && webView) {
      const wkWebView = (webView as any).ios;
      if (wkWebView) {
        configureIOSWebViewForMermaid(wkWebView, false);
        setupMessageHandler(wkWebView);

        // Initial render
        if (props.content) {
          lastRenderedContent = props.content;
          loadMermaidIntoIOSWebView(wkWebView, htmlContent());
        }
      }
    } else if (webView) {
      const androidWebView = (webView as any).android;
      if (androidWebView) {
        configureAndroidWebViewForMermaid(androidWebView, false);

        // Initial render
        if (props.content) {
          lastRenderedContent = props.content;
          loadMermaidIntoAndroidWebView(androidWebView, htmlContent());
        }
      }
    }
  }

  function setupMessageHandler(wkWebView: any) {
    if (!wkWebView?.configuration?.userContentController || messageHandlerAdded) {
      return;
    }

    const handler = WKScriptMessageHandlerImpl.new();
    (handler as any).callback = (message: any) => {
      if (message?.body) {
        const { height } = message.body;
        if (height && typeof height === 'number') {
          const newHeight = Math.max(150, Math.min(600, height + 40));
          setContainerHeight(newHeight);
        }
      }
    };

    try {
      wkWebView.configuration.userContentController.addScriptMessageHandlerName(handler, 'renderComplete');
      messageHandlerAdded = true;
    } catch (e) {
      console.log('[MdMermaid] Message handler setup:', e);
    }
  }

  function updateWebView(html: string) {
    if (!webView || !html) return;

    if (isIOS) {
      const wkWebView = (webView as any).ios;
      if (wkWebView) {
        loadMermaidIntoIOSWebView(wkWebView, html);
      }
    } else {
      const androidWebView = (webView as any).android;
      if (androidWebView) {
        loadMermaidIntoAndroidWebView(androidWebView, html);
      }
    }
  }

  function onCopy() {
    if (copyToClipboard(props.content)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function onToggleFullscreen() {
    setFullscreen(!fullscreen());
    // TODO: Implement fullscreen modal for Solid
  }

  return (
    <gridlayout 
      class="rounded-xl border border-purple-200 dark:border-purple-800 my-3 overflow-hidden" 
      rows="auto, auto" 
      on:loaded={onContainerLoaded}
    >
      {/* Header with diagram type and controls */}
      <gridlayout 
        row="0" 
        columns="auto, *, auto, auto" 
        class="bg-purple-50 dark:bg-purple-950 border-b border-purple-200 dark:border-purple-800 px-3 py-2"
      >
        <label col="0" text="◇ Mermaid" class="text-xs text-purple-600 dark:text-purple-400 font-medium" />
        <label col="1" />
        <Show when={isIOS} fallback={
          <>
            <label 
              col="2" 
              text={fullscreen() ? '⤢' : '⤡'} 
              class="text-base text-purple-400 px-1 h-[18]" 
              translateY={-6}
              on:tap={onToggleFullscreen} 
            />
            <label 
              col="3" 
              text={copied() ? '✓' : '📋'} 
              class="text-base text-purple-400 px-1 h-[18]" 
              on:tap={onCopy} 
            />
          </>
        }>
          <image 
            src={fullscreen() ? 'sys://arrow.down.right.and.arrow.up.left' : 'sys://arrow.up.left.and.arrow.down.right'} 
            col="2" 
            class="w-4 h-4 text-purple-400 mr-2" 
            on:tap={onToggleFullscreen} 
          />
          <image 
            src={copied() ? 'sys://checkmark.circle' : 'sys://document.on.document'} 
            col="3" 
            class="w-4 h-4 text-purple-400" 
            on:tap={onCopy} 
          />
        </Show>
      </gridlayout>

      {/* Mermaid diagram content */}
      <stacklayout row="1" class="bg-slate-50 dark:bg-slate-800" height={containerHeight()}>
        <webview
          class="w-full h-full"
          on:loaded={onWebViewLoaded}
        />
      </stacklayout>
    </gridlayout>
  );
}
