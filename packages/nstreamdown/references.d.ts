/// <reference path="../../node_modules/@nativescript/types/index.d.ts" />
/// <reference path="./typings/index.d.ts" />

// nativescript-vue module declaration for library builds
declare module 'nativescript-vue' {
  import type { DefineComponent, App } from 'vue';
  export function registerElement(name: string, resolver: () => any): void;
  export function createApp(component: any): App;
  export type { DefineComponent };
}

// Vue SFC module declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Svelte module declarations
declare module '*.svelte' {
  import type { SvelteComponent } from 'svelte';
  const component: typeof SvelteComponent;
  export default component;
}

// Native iOS SyntaxHighlighter declarations
declare class SyntaxHighlighter extends NSObject {
  static alloc(): SyntaxHighlighter; // inherited from NSObject

  static new(): SyntaxHighlighter; // inherited from NSObject

  static readonly shared: SyntaxHighlighter;

  createCodeViewLanguageFrame(code: string, language: string, frame: CGRect): UITextView;

  highlightAsyncLanguageLabel(code: string, language: string, label: UILabel): void;

  highlightLanguage(code: string, language: string): NSAttributedString;
}

declare const enum SyntaxTokenType {
  Keyword = 0,

  String = 1,

  Number = 2,

  Comment = 3,

  Function = 4,

  Type = 5,

  Property = 6,

  Punctuation = 7,

  Plain = 8,
}
