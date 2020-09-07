/**
 * TypeScript definitions for org.nativescript.streamdown
 * Android native Kotlin classes for NativeScript Streamdown
 */

declare module org {
  export module nativescript {
    export module streamdown {
      /**
       * Token types for syntax highlighting
       */
      export enum SyntaxTokenType {
        KEYWORD,
        STRING,
        NUMBER,
        COMMENT,
        FUNCTION,
        TYPE,
        PROPERTY,
        PUNCTUATION,
        PLAIN,
      }

      /**
       * Color scheme for syntax highlighting
       */
      export class ColorScheme {
        public static class: java.lang.Class<org.nativescript.streamdown.ColorScheme>;
        public keyword: number;
        public string: number;
        public number: number;
        public comment: number;
        public function: number;
        public type: number;
        public property: number;
        public punctuation: number;
        public plain: number;
        public background: number;
        public constructor(keyword: number, string: number, number: number, comment: number, func: number, type: number, property: number, punctuation: number, plain: number, background: number);
      }

      /**
       * Syntax highlighter for NativeScript Streamdown
       * Uses Android SpannableString for efficient rendering
       */
      export class SyntaxHighlighter {
        public static class: java.lang.Class<org.nativescript.streamdown.SyntaxHighlighter>;

        /**
         * Get the singleton instance
         */
        public static getShared(): org.nativescript.streamdown.SyntaxHighlighter;

        /**
         * Get the dark color scheme
         */
        public static getDarkScheme(): org.nativescript.streamdown.ColorScheme;

        /**
         * Get the light color scheme
         */
        public static getLightScheme(): org.nativescript.streamdown.ColorScheme;

        /**
         * Highlight code synchronously
         */
        public highlight(code: string, language: string, scheme?: org.nativescript.streamdown.ColorScheme): globalAndroid.text.SpannableStringBuilder;

        /**
         * Full highlight with tokenization (alias for highlight)
         */
        public highlightFull(code: string, language: string, scheme?: org.nativescript.streamdown.ColorScheme): globalAndroid.text.SpannableStringBuilder;

        /**
         * Highlight code asynchronously and update a TextView
         */
        public highlightAsync(code: string, language: string, textView: globalAndroid.widget.TextView, scheme?: org.nativescript.streamdown.ColorScheme): void;
      }

      export module SyntaxHighlighter {
        /**
         * Callback interface for async highlighting
         */
        export class HighlightCallback extends java.lang.Object {
          public static class: java.lang.Class<org.nativescript.streamdown.SyntaxHighlighter.HighlightCallback>;
          public constructor(implementation: { onComplete(result: globalAndroid.text.SpannableStringBuilder): void });
          public constructor();
          public onComplete(result: globalAndroid.text.SpannableStringBuilder): void;
        }
      }
    }
  }
}
