/**
 * Streamdown Utilities for NativeScript
 */

import { Color, Utils } from '@nativescript/core';

// Declare iOS types that are available at runtime
declare const UIFont: any;
declare const UIColor: any;
declare const UIPasteboard: any;
declare const UIApplication: any;
declare const NSURL: any;
declare const NSMutableAttributedString: any;
declare const NSMakeRange: any;
declare const NSFontAttributeName: any;
declare const NSForegroundColorAttributeName: any;
declare const NSBackgroundColorAttributeName: any;
declare const NSStrikethroughStyleAttributeName: any;
declare const NSUnderlineStyleAttributeName: any;
declare const NSUnderlineStyle: any;

/**
 * Theme colors for streamdown components
 */
export interface StreamdownTheme {
  // Text colors
  textPrimary: Color;
  textSecondary: Color;
  textMuted: Color;

  // Background colors
  bgPrimary: Color;
  bgSecondary: Color;
  bgMuted: Color;
  bgCode: Color;

  // Accent colors
  accentPrimary: Color;
  accentLink: Color;
  accentError: Color;
  accentSuccess: Color;

  // Border colors
  borderDefault: Color;
  borderMuted: Color;

  // Code syntax highlighting
  codeKeyword: Color;
  codeString: Color;
  codeNumber: Color;
  codeComment: Color;
  codeFunction: Color;
  codeVariable: Color;
  codeOperator: Color;
  codePunctuation: Color;
}

/**
 * Light theme for streamdown
 */
export const lightTheme: StreamdownTheme = {
  textPrimary: new Color('#1a1a1a'),
  textSecondary: new Color('#4a4a4a'),
  textMuted: new Color('#6b7280'),
  bgPrimary: new Color('#ffffff'),
  bgSecondary: new Color('#f9fafb'),
  bgMuted: new Color('#f3f4f6'),
  bgCode: new Color('#f1f5f9'),
  accentPrimary: new Color('#3b82f6'),
  accentLink: new Color('#2563eb'),
  accentError: new Color('#ef4444'),
  accentSuccess: new Color('#22c55e'),
  borderDefault: new Color('#e5e7eb'),
  borderMuted: new Color('#d1d5db'),
  codeKeyword: new Color('#8b5cf6'),
  codeString: new Color('#059669'),
  codeNumber: new Color('#0891b2'),
  codeComment: new Color('#6b7280'),
  codeFunction: new Color('#2563eb'),
  codeVariable: new Color('#dc2626'),
  codeOperator: new Color('#0d9488'),
  codePunctuation: new Color('#374151'),
};

/**
 * Dark theme for streamdown
 */
export const darkTheme: StreamdownTheme = {
  textPrimary: new Color('#f9fafb'),
  textSecondary: new Color('#d1d5db'),
  textMuted: new Color('#9ca3af'),
  bgPrimary: new Color('#111827'),
  bgSecondary: new Color('#1f2937'),
  bgMuted: new Color('#374151'),
  bgCode: new Color('#1e293b'),
  accentPrimary: new Color('#60a5fa'),
  accentLink: new Color('#93c5fd'),
  accentError: new Color('#f87171'),
  accentSuccess: new Color('#4ade80'),
  borderDefault: new Color('#374151'),
  borderMuted: new Color('#4b5563'),
  codeKeyword: new Color('#a78bfa'),
  codeString: new Color('#34d399'),
  codeNumber: new Color('#22d3ee'),
  codeComment: new Color('#9ca3af'),
  codeFunction: new Color('#60a5fa'),
  codeVariable: new Color('#f87171'),
  codeOperator: new Color('#2dd4bf'),
  codePunctuation: new Color('#d1d5db'),
};

/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Declare Android types for rich text
declare const android: any;

/**
 * Create attributed/spannable string for rich text (iOS and Android)
 */
export function createAttributedString(text: string, attributes: Record<string, unknown>): any {
  if (global.isIOS) {
    return createIOSAttributedString(text, attributes);
  } else if (global.isAndroid) {
    return createAndroidSpannableString(text, attributes);
  }
  return null;
}

/**
 * Create iOS attributed string for rich text
 */
function createIOSAttributedString(text: string, attributes: Record<string, unknown>): any {
  const attributedString = NSMutableAttributedString.alloc().initWithString(text);

  if (attributes.bold) {
    const font = UIFont.boldSystemFontOfSize((attributes.fontSize as number) || 16);
    attributedString.addAttributeValueRange(NSFontAttributeName, font, NSMakeRange(0, text.length));
  }

  if (attributes.italic) {
    const font = UIFont.italicSystemFontOfSize((attributes.fontSize as number) || 16);
    attributedString.addAttributeValueRange(NSFontAttributeName, font, NSMakeRange(0, text.length));
  }

  if (attributes.color) {
    const color = UIColor.colorWithRedGreenBlueAlpha(((attributes.color as Color).r || 0) / 255, ((attributes.color as Color).g || 0) / 255, ((attributes.color as Color).b || 0) / 255, ((attributes.color as Color).a || 255) / 255);
    attributedString.addAttributeValueRange(NSForegroundColorAttributeName, color, NSMakeRange(0, text.length));
  }

  if (attributes.backgroundColor) {
    const bgColor = UIColor.colorWithRedGreenBlueAlpha(((attributes.backgroundColor as Color).r || 0) / 255, ((attributes.backgroundColor as Color).g || 0) / 255, ((attributes.backgroundColor as Color).b || 0) / 255, ((attributes.backgroundColor as Color).a || 255) / 255);
    attributedString.addAttributeValueRange(NSBackgroundColorAttributeName, bgColor, NSMakeRange(0, text.length));
  }

  if (attributes.strikethrough) {
    attributedString.addAttributeValueRange(NSStrikethroughStyleAttributeName, NSUnderlineStyle.Single, NSMakeRange(0, text.length));
  }

  if (attributes.underline) {
    attributedString.addAttributeValueRange(NSUnderlineStyleAttributeName, NSUnderlineStyle.Single, NSMakeRange(0, text.length));
  }

  return attributedString;
}

/**
 * Create Android SpannableString for rich text
 */
function createAndroidSpannableString(text: string, attributes: Record<string, unknown>): any {
  const spannableString = new android.text.SpannableStringBuilder(text);

  // Bold
  if (attributes.bold) {
    spannableString.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  // Italic
  if (attributes.italic) {
    spannableString.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.ITALIC), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  // Foreground color
  if (attributes.color) {
    const c = attributes.color as Color;
    const androidColor = android.graphics.Color.argb(c.a || 255, c.r || 0, c.g || 0, c.b || 0);
    spannableString.setSpan(new android.text.style.ForegroundColorSpan(androidColor), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  // Background color
  if (attributes.backgroundColor) {
    const c = attributes.backgroundColor as Color;
    const androidColor = android.graphics.Color.argb(c.a || 255, c.r || 0, c.g || 0, c.b || 0);
    spannableString.setSpan(new android.text.style.BackgroundColorSpan(androidColor), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  // Strikethrough
  if (attributes.strikethrough) {
    spannableString.setSpan(new android.text.style.StrikethroughSpan(), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  // Underline
  if (attributes.underline) {
    spannableString.setSpan(new android.text.style.UnderlineSpan(), 0, text.length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
  }

  return spannableString;
}

/**
 * Format font size based on heading level
 */
export function getHeadingFontSize(level: 1 | 2 | 3 | 4 | 5 | 6): number {
  const sizes = {
    1: 32,
    2: 28,
    3: 24,
    4: 20,
    5: 18,
    6: 16,
  };
  return sizes[level];
}

/**
 * Simple syntax highlighting for code
 */
export interface HighlightedToken {
  content: string;
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'punctuation' | 'type' | 'text';
}

// Language-specific keyword sets
const KEYWORDS_TS = new Set(['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'do', 'return', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'void', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'readonly', 'as', 'in', 'of', 'switch', 'case', 'break', 'continue', 'finally', 'yield', 'delete', 'implements', 'package', 'declare', 'module', 'namespace', 'abstract', 'constructor']);

const KEYWORDS_SWIFT = new Set(['import', 'class', 'struct', 'enum', 'protocol', 'extension', 'func', 'var', 'let', 'if', 'else', 'for', 'while', 'repeat', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'guard', 'defer', 'do', 'in', 'where', 'as', 'is', 'nil', 'true', 'false', 'self', 'Self', 'super', 'init', 'deinit', 'get', 'set', 'willSet', 'didSet', 'throws', 'rethrows', 'override', 'final', 'static', 'private', 'public', 'internal', 'open', 'fileprivate', 'mutating', 'nonmutating', 'lazy', 'weak', 'unowned', 'optional', 'required', 'convenience', 'dynamic', 'infix', 'prefix', 'postfix', 'operator', 'associatedtype', 'typealias']);

const TYPES_TS = new Set(['string', 'number', 'boolean', 'object', 'any', 'never', 'unknown', 'void', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Promise', 'Map', 'Set', 'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Component', 'FC', 'React', 'Props']);

const TYPES_SWIFT = new Set(['Int', 'String', 'Bool', 'Double', 'Float', 'Character', 'Array', 'Dictionary', 'Set', 'Optional', 'Any', 'AnyObject', 'Void', 'Never', 'UIView', 'UIViewController', 'UILabel', 'UIButton', 'UIImage', 'CGRect', 'CGPoint', 'CGSize', 'NSObject']);

// Pre-compiled character sets to avoid creating regex in hot loops
const DIGIT_CHARS = new Set('0123456789');
const WORD_CHARS = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$');
const IDENT_START_CHARS = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$@');
const NUMBER_CHARS = new Set('0123456789.xXabcdefABCDEF');
const OPERATOR_CHARS = new Set('+-*/%=<>!&|^~?:');
const PUNCTUATION_CHARS = new Set('{}()[];,.');
const UPPERCASE_CHARS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const LOWERCASE_ALPHA_CHARS = new Set('abcdefghijklmnopqrstuvwxyz');

function isUpperCamelCase(word: string): boolean {
  if (word.length === 0 || !UPPERCASE_CHARS.has(word[0])) return false;
  for (let i = 1; i < word.length; i++) {
    const c = word[i];
    if (!UPPERCASE_CHARS.has(c) && !LOWERCASE_ALPHA_CHARS.has(c)) return false;
  }
  return true;
}

function isFunctionCall(code: string, startIndex: number): boolean {
  let j = startIndex;
  // Skip whitespace
  while (j < code.length && (code[j] === ' ' || code[j] === '\t')) {
    j++;
  }
  return code[j] === '(';
}

export function highlightCode(code: string, language: string): HighlightedToken[] {
  const tokens: HighlightedToken[] = [];
  const lang = language.toLowerCase();

  const keywords = lang === 'swift' ? KEYWORDS_SWIFT : KEYWORDS_TS;
  const types = lang === 'swift' ? TYPES_SWIFT : TYPES_TS;

  let i = 0;
  let currentText = '';
  const codeLen = code.length;

  const flushText = () => {
    if (currentText) {
      tokens.push({ content: currentText, type: 'text' });
      currentText = '';
    }
  };

  while (i < codeLen) {
    const char = code[i];

    // Single-line comment
    if (char === '/' && code[i + 1] === '/') {
      flushText();
      const endLine = code.indexOf('\n', i);
      const end = endLine === -1 ? codeLen : endLine;
      tokens.push({ content: code.slice(i, end), type: 'comment' });
      i = end;
      continue;
    }

    // Multi-line comment
    if (char === '/' && code[i + 1] === '*') {
      flushText();
      const end = code.indexOf('*/', i + 2);
      const endPos = end === -1 ? codeLen : end + 2;
      tokens.push({ content: code.slice(i, endPos), type: 'comment' });
      i = endPos;
      continue;
    }

    // Strings
    if (char === '"' || char === "'" || char === '`') {
      flushText();
      const quote = char;
      let j = i + 1;
      while (j < codeLen) {
        if (code[j] === '\\') {
          j += 2; // Skip escaped char
        } else if (code[j] === quote) {
          j++;
          break;
        } else {
          j++;
        }
      }
      tokens.push({ content: code.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    // Numbers
    if (DIGIT_CHARS.has(char) && (i === 0 || !WORD_CHARS.has(code[i - 1]))) {
      flushText();
      let j = i;
      while (j < codeLen && NUMBER_CHARS.has(code[j])) {
        j++;
      }
      tokens.push({ content: code.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // Words (identifiers, keywords, types)
    if (IDENT_START_CHARS.has(char)) {
      flushText();
      let j = i;
      while (j < codeLen && WORD_CHARS.has(code[j])) {
        j++;
      }
      const word = code.slice(i, j);

      if (keywords.has(word)) {
        tokens.push({ content: word, type: 'keyword' });
      } else if (types.has(word) || isUpperCamelCase(word)) {
        tokens.push({ content: word, type: 'type' });
      } else if (isFunctionCall(code, j)) {
        tokens.push({ content: word, type: 'function' });
      } else {
        tokens.push({ content: word, type: 'text' });
      }
      i = j;
      continue;
    }

    // Operators and punctuation
    if (OPERATOR_CHARS.has(char)) {
      flushText();
      let op = char;
      // Handle multi-char operators
      if (i + 1 < codeLen) {
        const next = code[i + 1];
        if ((char === '=' && next === '>') || (char === '=' && next === '=') || (char === '!' && next === '=') || (char === '<' && next === '=') || (char === '>' && next === '=') || (char === '&' && next === '&') || (char === '|' && next === '|') || (char === '+' && next === '+') || (char === '-' && next === '-') || (char === '-' && next === '>') || (char === '?' && next === '.') || (char === '?' && next === '?')) {
          op = char + next;
          i++;
        }
      }
      tokens.push({ content: op, type: 'operator' });
      i++;
      continue;
    }

    // Punctuation
    if (PUNCTUATION_CHARS.has(char)) {
      flushText();
      tokens.push({ content: char, type: 'punctuation' });
      i++;
      continue;
    }

    // Whitespace and other characters
    currentText += char;
    i++;
  }

  flushText();
  return tokens;
}

/**
 * Debounce function for streaming updates
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Copy text to clipboard (iOS and Android)
 */
export function copyToClipboard(text: string): boolean {
  if (global.isIOS) {
    UIPasteboard.generalPasteboard.string = text;
    return true;
  } else if (global.isAndroid) {
    try {
      const context = Utils.android.getApplicationContext();
      const clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE);
      const clip = android.content.ClipData.newPlainText('text', text);
      clipboard.setPrimaryClip(clip);
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      return false;
    }
  }
  return false;
}

/**
 * Open URL in browser (iOS Safari, Android default browser)
 */
export function openUrl(url: string): boolean {
  if (global.isIOS) {
    const nsUrl = NSURL.URLWithString(url);
    if (nsUrl && UIApplication.sharedApplication.canOpenURL(nsUrl)) {
      UIApplication.sharedApplication.openURLOptionsCompletionHandler(nsUrl, null, null);
      return true;
    }
  } else if (global.isAndroid) {
    try {
      const context = Utils.android.getApplicationContext();
      const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
      intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);
      return true;
    } catch (e) {
      console.error('Failed to open URL:', e);
      return false;
    }
  }
  return false;
}
