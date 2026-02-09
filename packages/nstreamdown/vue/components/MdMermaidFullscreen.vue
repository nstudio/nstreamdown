<script lang="ts" setup>
import { onUnmounted, getCurrentInstance } from 'vue';
import { isIOS, WebView } from '@nativescript/core';
import {
  generateMermaidHTML,
  configureIOSWebViewForMermaid,
  configureAndroidWebViewForMermaid,
  loadMermaidIntoIOSWebView,
  loadMermaidIntoAndroidWebView
} from '@nstudio/nstreamdown';

interface Props {
  content: string;
  darkMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  darkMode: true
});

let webView: WebView | null = null;
const instance = getCurrentInstance();

function getFullscreenHTML(): string {
  if (!props.content) return '';
  return generateMermaidHTML(props.content, { darkMode: props.darkMode, allowZoom: true });
}

function onWebViewLoaded(args: any) {
  webView = args.object as WebView;
  const html = getFullscreenHTML();
  if (!html) return;

  if (isIOS && webView) {
    const wkWebView = (webView as any).ios;
    if (wkWebView) {
      configureIOSWebViewForMermaid(wkWebView, true);
      loadMermaidIntoIOSWebView(wkWebView, html);
    }
  } else if (webView) {
    const androidWebView = (webView as any).android;
    if (androidWebView) {
      configureAndroidWebViewForMermaid(androidWebView, true);
      loadMermaidIntoAndroidWebView(androidWebView, html);
    }
  }
}

function onClose() {
  const closeModal = instance?.proxy?.$modal?.close;
  if (closeModal) {
    closeModal(undefined);
  }
}

onUnmounted(() => {
  webView = null;
});
</script>

<template>
  <GridLayout rows="auto, *" class="bg-slate-900">
    <!-- Header with close button -->
    <GridLayout row="0" columns="auto, *, auto" class="bg-slate-800 px-4 py-3">
      <Label col="0" text="◇ Mermaid Diagram" class="text-base text-purple-400 font-medium" />
      <Label col="1" />
      <Image
        v-if="isIOS"
        src="sys://xmark.circle.fill"
        col="2"
        class="w-6 h-6 text-slate-400"
        @tap="onClose"
      />
      <Label
        v-else
        col="2"
        text="✕"
        class="text-xl text-slate-400 px-2"
        @tap="onClose"
      />
    </GridLayout>

    <!-- Fullscreen WebView -->
    <WebView row="1" class="w-full h-full" @loaded="onWebViewLoaded" />
  </GridLayout>
</template>
