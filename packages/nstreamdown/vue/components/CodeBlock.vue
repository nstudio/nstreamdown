<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { isIOS, isAndroid } from '@nativescript/core';
import { copyToClipboard } from '@nstudio/nstreamdown';

// Declare iOS types available at runtime
declare const SyntaxHighlighter: any;

interface Props {
  code: string;
  language?: string;
  isIncomplete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: '',
  isIncomplete: false
});

const copied = ref(false);
const codeLabel = ref<any>(null);
let lastHighlightedCode = '';

function onCodeLabelLoaded(args: any) {
  codeLabel.value = args.object;
  applyHighlighting();
}

function applyHighlighting() {
  if (!codeLabel.value || !props.code) return;
  
  // Skip if already highlighted this exact code
  if (lastHighlightedCode === props.code) return;
  lastHighlightedCode = props.code;

  if (isIOS) {
    try {
      const iosLabel = codeLabel.value.ios;
      if (iosLabel) {
        // Use native Swift syntax highlighter
        if (typeof SyntaxHighlighter !== 'undefined') {
          const highlighter = SyntaxHighlighter.shared;
          if (highlighter) {
            const attrString = highlighter.highlightLanguage(props.code, props.language || 'typescript');
            if (attrString) {
              iosLabel.attributedText = attrString;
              return;
            }
          }
        }
      }
    } catch (e) {
      console.log('[CodeBlock] Syntax highlighting error:', e);
    }
  }

  // Android - use native Kotlin syntax highlighter
  if (isAndroid) {
    try {
      const androidLabel = codeLabel.value.android;
      if (androidLabel && typeof org !== 'undefined' && org.nativescript?.streamdown?.SyntaxHighlighter) {
        const highlighter = org.nativescript.streamdown.SyntaxHighlighter.getShared();
        const scheme = org.nativescript.streamdown.SyntaxHighlighter.getDarkScheme();

        // Reduce line spacing to match iOS (1.0 = single spacing, no extra)
        androidLabel.setLineSpacing(0, 1.0);

        // Use synchronous highlight for immediate display
        const spannableString = highlighter.highlight(props.code, props.language || 'typescript', scheme);
        if (spannableString) {
          androidLabel.setText(spannableString, android.widget.TextView.BufferType.SPANNABLE);
          return;
        }
      }
    } catch (e) {
      console.log('[CodeBlock] Android Syntax highlighting error:', e);
    }
  }

  // Fallback - just set text
  codeLabel.value.text = props.code;
}

function onCopy() {
  if (copyToClipboard(props.code)) {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

// Watch for code changes
watch(() => props.code, () => {
  applyHighlighting();
});

watch(() => props.language, () => {
  lastHighlightedCode = ''; // Reset to force re-highlight
  applyHighlighting();
});
</script>

<template>
  <GridLayout class="rounded-xl border border-slate-700 bg-slate-900 my-3 overflow-hidden" rows="auto, auto">
    <!-- Header with language and copy button -->
    <GridLayout row="0" columns="*, auto" class="bg-slate-800 border-b border-slate-700 px-3 py-2">
      <Label col="0" :text="language || 'code'" class="text-xs text-slate-400 font-mono" />
      <Image 
        v-if="isIOS"
        :src="copied ? 'sys://checkmark.circle' : 'sys://document.on.document'" 
        col="1" 
        class="w-4 h-4 text-blue-400" 
        @tap="onCopy" 
      />
      <Label v-else col="1" :text="copied ? '✓' : '📋'" class="text-base text-blue-400 px-1 h-[18]" @tap="onCopy"></Label>
    </GridLayout>

    <!-- Code content with native syntax highlighting -->
    <ScrollView row="1" orientation="horizontal" class="bg-slate-900">
      <StackLayout class="p-3">
        <Label 
          class="font-mono text-xs text-slate-200" 
          textWrap="true" 
          @loaded="onCodeLabelLoaded"
        />
      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>
