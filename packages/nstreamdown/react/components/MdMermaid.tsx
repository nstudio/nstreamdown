/**
 * MdMermaid Component for React
 * Renders Mermaid diagrams using WebView with mermaid.js
 */
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
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

export function MdMermaid({
  content,
  darkMode = true,
  isIncomplete = false
}: MdMermaidProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [containerHeight, setContainerHeight] = useState(250);

  const webViewRef = useRef<WebView | null>(null);
  const lastRenderedContentRef = useRef('');
  const messageHandlerAddedRef = useRef(false);

  // Compute HTML content
  const htmlContent = content ? generateMermaidHTML(content, { darkMode }) : '';

  // Update WebView when content changes
  useEffect(() => {
    if (webViewRef.current && content && content !== lastRenderedContentRef.current) {
      lastRenderedContentRef.current = content;
      updateWebView(htmlContent);
    }
  }, [content, darkMode, htmlContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isIOS && webViewRef.current && messageHandlerAddedRef.current) {
        try {
          const wkWebView = (webViewRef.current as any).ios;
          if (wkWebView?.configuration?.userContentController) {
            wkWebView.configuration.userContentController.removeScriptMessageHandlerForName('renderComplete');
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        messageHandlerAddedRef.current = false;
      }
      webViewRef.current = null;
    };
  }, []);

  const onContainerLoaded = useCallback((args: any) => {
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
  }, []);

  const setupMessageHandler = useCallback((wkWebView: any) => {
    if (!wkWebView?.configuration?.userContentController || messageHandlerAddedRef.current) {
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
      messageHandlerAddedRef.current = true;
    } catch (e) {
      console.log('[MdMermaid] Message handler setup:', e);
    }
  }, []);

  const onWebViewLoaded = useCallback((args: any) => {
    const webView = args.object as WebView;
    webViewRef.current = webView;

    if (isIOS && webView) {
      const wkWebView = (webView as any).ios;
      if (wkWebView) {
        configureIOSWebViewForMermaid(wkWebView, false);
        setupMessageHandler(wkWebView);

        // Initial render
        if (content) {
          lastRenderedContentRef.current = content;
          loadMermaidIntoIOSWebView(wkWebView, htmlContent);
        }
      }
    } else if (webView) {
      const androidWebView = (webView as any).android;
      if (androidWebView) {
        configureAndroidWebViewForMermaid(androidWebView, false);

        // Initial render
        if (content) {
          lastRenderedContentRef.current = content;
          loadMermaidIntoAndroidWebView(androidWebView, htmlContent);
        }
      }
    }
  }, [content, htmlContent, setupMessageHandler]);

  const updateWebView = useCallback((html: string) => {
    if (!webViewRef.current || !html) return;

    if (isIOS) {
      const wkWebView = (webViewRef.current as any).ios;
      if (wkWebView) {
        loadMermaidIntoIOSWebView(wkWebView, html);
      }
    } else {
      const androidWebView = (webViewRef.current as any).android;
      if (androidWebView) {
        loadMermaidIntoAndroidWebView(androidWebView, html);
      }
    }
  }, []);

  const onCopy = useCallback(() => {
    if (copyToClipboard(content)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  const onToggleFullscreen = useCallback(() => {
    setFullscreen(!fullscreen);
    // TODO: Implement fullscreen modal for React
  }, [fullscreen]);

  return (
    <gridLayout 
      className="rounded-xl border border-purple-200 dark:border-purple-800 my-3 overflow-hidden" 
      rows="auto, auto" 
      onLoaded={onContainerLoaded}
    >
      {/* Header with diagram type and controls */}
      <gridLayout 
        row={0} 
        columns="auto, *, auto, auto" 
        className="bg-purple-50 dark:bg-purple-950 border-b border-purple-200 dark:border-purple-800 px-3 py-2"
      >
        <label col={0} text="◇ Mermaid" className="text-xs text-purple-600 dark:text-purple-400 font-medium" />
        <label col={1} />
        {isIOS ? (
          <>
            <image 
              src={fullscreen ? 'sys://arrow.down.right.and.arrow.up.left' : 'sys://arrow.up.left.and.arrow.down.right'} 
              col={2} 
              className="w-4 h-4 text-purple-400 mr-2" 
              onTap={onToggleFullscreen} 
            />
            <image 
              src={copied ? 'sys://checkmark.circle' : 'sys://document.on.document'} 
              col={3} 
              className="w-4 h-4 text-purple-400" 
              onTap={onCopy} 
            />
          </>
        ) : (
          <>
            <label 
              col={2} 
              text={fullscreen ? '⤢' : '⤡'} 
              className="text-base text-purple-400 px-1 h-[18]" 
              translateY={-6}
              onTap={onToggleFullscreen} 
            />
            <label 
              col={3} 
              text={copied ? '✓' : '📋'} 
              className="text-base text-purple-400 px-1 h-[18]" 
              onTap={onCopy} 
            />
          </>
        )}
      </gridLayout>

      {/* Mermaid diagram content */}
      <stackLayout row={1} className="bg-slate-50 dark:bg-slate-800" height={containerHeight}>
        <webView
          className="w-full h-full"
          onLoaded={onWebViewLoaded}
        />
      </stackLayout>
    </gridLayout>
  );
}
