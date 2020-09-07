/**
 * Native Code View
 * Custom NativeScript view for syntax-highlighted code blocks on iOS and Android
 * Uses UITextView with NSAttributedString for iOS
 * Uses TextView with SpannableString for Android
 */
import { View, Property, booleanConverter, Color } from '@nativescript/core';

// Declare iOS types available at runtime
declare const UITextView: any;
declare const UIFont: any;
declare const UIFontWeight: any;
declare const UIColor: any;
declare const UIEdgeInsetsMake: any;
declare const NSMutableAttributedString: any;
declare const NSMakeRange: any;
declare const NSFontAttributeName: any;
declare const NSForegroundColorAttributeName: any;
declare const NSObliquenessAttributeName: any;

// Declare Android types available at runtime
declare const android: any;
declare const org: any;

// Define properties
const codeProperty = new Property<NativeCodeView, string>({
  name: 'code',
  defaultValue: '',
});

const languageProperty = new Property<NativeCodeView, string>({
  name: 'language',
  defaultValue: '',
});

const darkModeProperty = new Property<NativeCodeView, boolean>({
  name: 'darkMode',
  defaultValue: true,
  valueConverter: booleanConverter,
});

// Syntax highlighting patterns
interface SyntaxPattern {
  pattern: RegExp;
  color: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
}

const SYNTAX_PATTERNS: Record<string, SyntaxPattern[]> = {
  default: [
    // Comments
    { pattern: /\/\/.*$/gm, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /\/\*[\s\S]*?\*\//gm, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /#.*$/gm, color: '#6A9955', fontStyle: 'italic' },
    // Strings
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, color: '#CE9178' },
    // Keywords
    { pattern: /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|throw|new|this|super|extends|static|get|set|typeof|instanceof|null|undefined|true|false|void|interface|type|enum|public|private|protected|readonly|abstract|implements|package|break|continue|switch|case|do|finally|in|of|yield|with|as|is)\b/g, color: '#569CD6', fontStyle: 'bold' },
    // Numbers
    { pattern: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, color: '#B5CEA8' },
    // Functions
    { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, color: '#DCDCAA' },
    // Decorators/Annotations
    { pattern: /@\w+/g, color: '#C586C0' },
    // Types
    { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, color: '#4EC9B0' },
  ],
  typescript: [], // Will use default
  javascript: [], // Will use default
  swift: [
    { pattern: /\/\/.*$/gm, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /\/\*[\s\S]*?\*\//gm, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, color: '#CE9178' },
    { pattern: /\b(import|class|struct|enum|protocol|extension|func|var|let|if|else|for|while|return|guard|switch|case|default|break|continue|throw|try|catch|do|as|is|in|true|false|nil|self|super|init|deinit|static|private|public|internal|fileprivate|open|final|override|mutating|lazy|weak|unowned|optional|required|convenience|dynamic)\b/g, color: '#C586C0', fontStyle: 'bold' },
    { pattern: /\b\d+(?:\.\d+)?\b/g, color: '#B5CEA8' },
    { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, color: '#4EC9B0' },
    { pattern: /@\w+/g, color: '#569CD6' },
  ],
  python: [
    { pattern: /#.*$/gm, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, color: '#6A9955', fontStyle: 'italic' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, color: '#CE9178' },
    { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|yield|pass|break|continue|and|or|not|in|is|True|False|None|self|global|nonlocal|assert|del|async|await)\b/g, color: '#C586C0', fontStyle: 'bold' },
    { pattern: /\b\d+(?:\.\d+)?\b/g, color: '#B5CEA8' },
    { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, color: '#4EC9B0' },
    { pattern: /@\w+/g, color: '#DCDCAA' },
  ],
};

export class NativeCodeView extends View {
  // Properties
  code: string = '';
  language: string = '';
  darkMode: boolean = true;

  private _textView: any = null;

  override createNativeView(): any {
    if (__APPLE__) {
      return this.createIOSNativeView();
    } else if (__ANDROID__) {
      return this.createAndroidNativeView();
    }
    return null as any;
  }

  private createIOSNativeView(): any {
    const textView = UITextView.alloc().init();
    textView.editable = false;
    textView.selectable = true;
    textView.scrollEnabled = true;
    textView.showsHorizontalScrollIndicator = true;
    textView.showsVerticalScrollIndicator = false;
    textView.textContainerInset = UIEdgeInsetsMake(12, 12, 12, 12);
    textView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0.12, 0.16, 0.22, 1);
    textView.layer.cornerRadius = 8;

    this._textView = textView;
    return textView;
  }

  private createAndroidNativeView(): any {
    const context = this._context;
    const textView = new android.widget.TextView(context);

    // Set padding (12dp converted to pixels)
    const density = context.getResources().getDisplayMetrics().density;
    const padding = Math.round(12 * density);
    textView.setPadding(padding, padding, padding, padding);

    // Set monospace font
    textView.setTypeface(android.graphics.Typeface.MONOSPACE);
    textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 13);

    // Enable horizontal scrolling
    textView.setHorizontallyScrolling(true);
    textView.setMovementMethod(new android.text.method.ScrollingMovementMethod());

    // Set background color (dark theme - matching iOS)
    const bgColor = android.graphics.Color.rgb(30, 30, 30);
    textView.setBackgroundColor(bgColor);

    // Set default text color (matching iOS)
    const textColor = android.graphics.Color.rgb(212, 212, 212);
    textView.setTextColor(textColor);

    // Enable text selection
    textView.setTextIsSelectable(true);

    this._textView = textView;
    return textView;
  }

  override initNativeView(): void {
    super.initNativeView();
    this.updateHighlighting();
  }

  override disposeNativeView(): void {
    this._textView = null;
    super.disposeNativeView();
  }

  [codeProperty.setNative](value: string) {
    this.code = value;
    this.updateHighlighting();
  }

  [languageProperty.setNative](value: string) {
    this.language = value;
    this.updateHighlighting();
  }

  [darkModeProperty.setNative](value: boolean) {
    this.darkMode = value;
    this.updateHighlighting();
  }

  private updateHighlighting(): void {
    if (!this._textView) return;

    if (__APPLE__) {
      this.updateIOSHighlighting();
    } else if (__ANDROID__) {
      this.updateAndroidHighlighting();
    }
  }

  private updateIOSHighlighting(): void {
    const attributedString = this.createHighlightedCode();
    this._textView.attributedText = attributedString;

    // Update background based on theme
    if (this.darkMode) {
      this._textView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0.12, 0.16, 0.22, 1);
    } else {
      this._textView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0.96, 0.97, 0.98, 1);
    }
  }

  private updateAndroidHighlighting(): void {
    const code = this.code || '';
    const language = this.language || 'typescript';

    // Use our Kotlin SyntaxHighlighter
    try {
      const highlighter = org.nativescript.streamdown.SyntaxHighlighter.getShared();
      const scheme = this.darkMode ? org.nativescript.streamdown.SyntaxHighlighter.getDarkScheme() : org.nativescript.streamdown.SyntaxHighlighter.getLightScheme();

      // Highlight asynchronously for better performance
      highlighter.highlightAsync(code, language, this._textView, scheme);
    } catch (e) {
      // Fallback: just set plain text if native highlighter fails
      console.error('SyntaxHighlighter error:', e);
      this._textView.setText(code);
    }

    // Update background based on theme (matching iOS)
    if (this.darkMode) {
      const bgColor = android.graphics.Color.rgb(30, 30, 30);
      this._textView.setBackgroundColor(bgColor);
    } else {
      const bgColor = android.graphics.Color.rgb(255, 255, 255);
      this._textView.setBackgroundColor(bgColor);
    }
  }

  private createHighlightedCode(): NSAttributedString {
    const code = this.code || '';
    const attributedString = NSMutableAttributedString.alloc().initWithString(code);
    const fullRange = NSMakeRange(0, code.length);

    // Base styling
    const baseFont = UIFont.monospacedSystemFontOfSizeWeight(14, UIFontWeight.Regular);
    const baseColor = this.darkMode ? UIColor.colorWithRedGreenBlueAlpha(0.85, 0.85, 0.85, 1) : UIColor.colorWithRedGreenBlueAlpha(0.2, 0.2, 0.2, 1);

    attributedString.addAttributeValueRange(NSFontAttributeName, baseFont, fullRange);
    attributedString.addAttributeValueRange(NSForegroundColorAttributeName, baseColor, fullRange);

    // Apply syntax highlighting - limit iterations to prevent runaway loops
    const patterns = SYNTAX_PATTERNS[this.language.toLowerCase()] || SYNTAX_PATTERNS.default;
    const maxMatches = 1000; // Safety limit

    for (const { pattern, color, fontStyle } of patterns) {
      // Reset regex state by creating fresh instance with global flag
      const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      let match: RegExpExecArray | null;
      let matchCount = 0;

      while ((match = regex.exec(code)) !== null && matchCount < maxMatches) {
        matchCount++;

        // Prevent infinite loop on zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
          continue;
        }

        const matchRange = NSMakeRange(match.index, match[0].length);

        // Color
        const uiColor = this.hexToUIColor(color);
        attributedString.addAttributeValueRange(NSForegroundColorAttributeName, uiColor, matchRange);

        // Font style
        if (fontStyle === 'bold') {
          const boldFont = UIFont.monospacedSystemFontOfSizeWeight(14, UIFontWeight.Bold);
          attributedString.addAttributeValueRange(NSFontAttributeName, boldFont, matchRange);
        } else if (fontStyle === 'italic') {
          // iOS monospace fonts don't have italic variants, so we use oblique transform
          const italicFont = UIFont.monospacedSystemFontOfSizeWeight(14, UIFontWeight.Regular);
          attributedString.addAttributeValueRange(NSFontAttributeName, italicFont, matchRange);
          attributedString.addAttributeValueRange(NSObliquenessAttributeName, 0.2, matchRange);
        }
      }
    }

    return attributedString;
  }

  private hexToUIColor(hex: string): UIColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return UIColor.whiteColor;
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    return UIColor.colorWithRedGreenBlueAlpha(r, g, b, 1);
  }
}

// Register properties
codeProperty.register(NativeCodeView);
languageProperty.register(NativeCodeView);
darkModeProperty.register(NativeCodeView);
