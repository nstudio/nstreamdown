/**
 * MdCodeBlock Component
 * Renders code blocks with syntax highlighting using NSAttributedString
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, input, effect } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { isIOS, isAndroid } from '@nativescript/core';
import { copyToClipboard } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdCodeBlock',
  template: `
    <GridLayout class="rounded-xl border border-slate-700 bg-slate-900 mt-2 mb-3 overflow-hidden" rows="auto, auto" (loaded)="onContainerLoaded($event)">
      <!-- Header with language and copy button -->
      <GridLayout row="0" columns="*, auto" class="bg-slate-800 border-b border-slate-700 px-3 py-2">
        <Label col="0" [text]="language() || 'code'" class="text-xs text-slate-400 font-mono"></Label>
        @if (isIOS) {
          <Image [src]="copied() ? 'sys://checkmark.circle' : 'sys://document.on.document'" col="1" class="w-4 h-4 text-blue-400" (tap)="onCopy()"></Image>
        } @else {
          <Label col="1" [text]="copied() ? '✓' : '📋'" class="text-base text-blue-400 px-1 h-[18]" (tap)="onCopy()"></Label>
        }
      </GridLayout>

      <!-- Code content with native syntax highlighting -->
      <ScrollView row="1" orientation="horizontal" class="bg-slate-900">
        <StackLayout class="p-3">
          <Label #codeLabel class="font-mono text-xs" textWrap="true" (loaded)="onCodeLabelLoaded($event)"></Label>
        </StackLayout>
      </ScrollView>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCodeBlock {
  // Signal-based inputs for fine-grained reactivity
  code = input('');
  language = input('');
  isIncomplete = input(false);
  isIOS = __APPLE__;

  copied = signal(false);
  private nativeLabel: any = null;
  private lastHighlightedCode: string = '';

  constructor() {
    // Effect reacts to any signal change automatically
    effect(() => {
      const currentCode = this.code();
      const currentLang = this.language();

      // Only process if we have a label and code
      if (!this.nativeLabel || !currentCode) return;

      this.applyHighlighting(currentCode, currentLang);
    });
  }

  onContainerLoaded(args: any) {
    // Apply rounded corners on Android programmatically
    if (isAndroid) {
      const view = args.object;
      const nativeView = view.android;
      if (nativeView) {
        // Get display density for dp to px conversion
        const context = nativeView.getContext();
        const density = context.getResources().getDisplayMetrics().density;
        const radiusPx = 12 * density; // 12dp rounded corners (xl)

        // Create a rounded drawable
        const drawable = new android.graphics.drawable.GradientDrawable();
        drawable.setCornerRadius(radiusPx);
        drawable.setColor(android.graphics.Color.rgb(15, 23, 42)); // bg-slate-900
        nativeView.setBackground(drawable);
        nativeView.setClipToOutline(true);
      }
    }
  }

  onCodeLabelLoaded(args: any) {
    this.nativeLabel = args.object;
    // Trigger initial render
    const currentCode = this.code();
    if (currentCode) {
      this.applyHighlighting(currentCode, this.language());
    }
  }

  private applyHighlighting(code: string, language: string) {
    if (!this.nativeLabel || !code) return;

    // Skip if already highlighted this exact code
    if (this.lastHighlightedCode === code) return;
    this.lastHighlightedCode = code;

    if (isIOS) {
      try {
        const iosLabel = this.nativeLabel.ios as UILabel;
        if (iosLabel) {
          // Use native Swift syntax highlighter
          if (typeof SyntaxHighlighter !== 'undefined') {
            const highlighter = SyntaxHighlighter.shared;
            if (highlighter) {
              const attrString = highlighter.highlightLanguage(code, language || 'typescript');
              if (attrString) {
                iosLabel.attributedText = attrString;
              }
            }
          }
        }
      } catch (e) {
        console.log('[MdCodeBlock] iOS Syntax highlighting error:', e);
      }
      return;
    }

    // Android - use native Kotlin syntax highlighter
    if (isAndroid) {
      try {
        const androidLabel = this.nativeLabel.android;
        if (androidLabel && typeof org !== 'undefined' && org.nativescript?.streamdown?.SyntaxHighlighter) {
          const highlighter = org.nativescript.streamdown.SyntaxHighlighter.getShared();
          const scheme = org.nativescript.streamdown.SyntaxHighlighter.getDarkScheme();

          // Reduce line spacing to match iOS (1.0 = single spacing, no extra)
          androidLabel.setLineSpacing(0, 1.0);

          // Use synchronous highlight for immediate display
          const spannableString = highlighter.highlight(code, language || 'typescript', scheme);
          if (spannableString) {
            androidLabel.setText(spannableString, android.widget.TextView.BufferType.SPANNABLE);
            return;
          }
        }
      } catch (e) {
        console.log('[MdCodeBlock] Android Syntax highlighting error:', e);
      }

      // Fallback to plain text
      this.nativeLabel.text = code;
      this.nativeLabel.color = '#e2e8f0';
      return;
    }

    // Other platforms fallback
    this.nativeLabel.text = code;
    this.nativeLabel.color = '#e2e8f0';
  }

  onCopy() {
    if (copyToClipboard(this.code())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
