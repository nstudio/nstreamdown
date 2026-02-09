<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { isIOS, WebView } from '@nativescript/core';
import { 
  copyToClipboard, 
  generateMermaidHTML, 
  RoundedOutlineProvider,
  configureIOSWebViewForMermaid, 
  configureAndroidWebViewForMermaid,
  loadMermaidIntoIOSWebView,
  loadMermaidIntoAndroidWebView,
  WKScriptMessageHandlerImpl
} from '@nstudio/nstreamdown';

interface Props {
  content: string;
  darkMode?: boolean;
  isIncomplete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  darkMode: true,
  isIncomplete: false
});

// UI State
const copied = ref(false);
const fullscreen = ref(false);
const containerHeight = ref(250);

// WebView reference
let webView: WebView | null = null;
let lastRenderedContent = '';
let messageHandlerAdded = false;

// Computed HTML content
const htmlContent = computed(() => {
  if (!props.content) return '';
  return generateMermaidHTML(props.content, { darkMode: props.darkMode });
});

// Watch for content changes
watch(() => props.content, (newContent) => {
  if (webView && newContent && newContent !== lastRenderedContent) {
    lastRenderedContent = newContent;
    updateWebView(htmlContent.value);
  }
});

// Watch for dark mode changes
watch(() => props.darkMode, () => {
  if (webView && props.content) {
    lastRenderedContent = ''; // Force re-render
    updateWebView(htmlContent.value);
  }
});

// Cleanup
onUnmounted(() => {
  // Remove message handler on iOS
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
      // @ts-ignore
      const provider = new RoundedOutlineProvider(radiusPx);
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
        loadMermaidIntoIOSWebView(wkWebView, htmlContent.value);
      }
    }
  } else if (webView) {
    const androidWebView = (webView as any).android;
    if (androidWebView) {
      configureAndroidWebViewForMermaid(androidWebView, false);

      // Initial render
      if (props.content) {
        lastRenderedContent = props.content;
        loadMermaidIntoAndroidWebView(androidWebView, htmlContent.value);
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
        containerHeight.value = newHeight;
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
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

function onToggleFullscreen() {
  fullscreen.value = !fullscreen.value;
  // TODO: Implement fullscreen modal for Vue
}
</script>

<template>
  <GridLayout 
    class="rounded-xl border border-purple-200 dark:border-purple-800 my-3 overflow-hidden" 
    rows="auto, auto" 
    @loaded="onContainerLoaded"
  >
    <!-- Header with diagram type and controls -->
    <GridLayout 
      row="0" 
      columns="auto, *, auto, auto" 
      class="bg-purple-50 dark:bg-purple-950 border-b border-purple-200 dark:border-purple-800 px-3 py-2"
    >
      <Label col="0" text="◇ Mermaid" class="text-xs text-purple-600 dark:text-purple-400 font-medium" />
      <Label col="1" />
      <Image 
        v-if="isIOS"
        :src="fullscreen ? 'sys://arrow.down.right.and.arrow.up.left' : 'sys://arrow.up.left.and.arrow.down.right'" 
        col="2" 
        class="w-4 h-4 text-purple-400 mr-2" 
        @tap="onToggleFullscreen" 
      />
      <Label 
        v-else 
        col="2" 
        :text="fullscreen ? '⤢' : '⤡'" 
        class="text-base text-purple-400 px-1 h-[18]" 
        translateY="-6" 
        @tap="onToggleFullscreen" 
      />
      <Image 
        v-if="isIOS"
        :src="copied ? 'sys://checkmark.circle' : 'sys://document.on.document'" 
        col="3" 
        class="w-4 h-4 text-purple-400" 
        @tap="onCopy" 
      />
      <Label 
        v-else 
        col="3" 
        :text="copied ? '✓' : '📋'" 
        class="text-base text-purple-400 px-1 h-[18]" 
        @tap="onCopy" 
      />
    </GridLayout>

    <!-- Mermaid diagram content -->
    <StackLayout row="1" class="bg-slate-50 dark:bg-slate-800" :height="containerHeight">
      <WebView
        class="w-full h-full"
        @loaded="onWebViewLoaded"
      />
    </StackLayout>
  </GridLayout>
</template>
