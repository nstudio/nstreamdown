/// <reference path="../../references.d.ts" />

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
