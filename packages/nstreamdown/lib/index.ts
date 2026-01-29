/**
 * NativeScript Streamdown Core Library
 *
 * Framework-agnostic utilities for markdown parsing and rendering
 */

// Parser and utilities
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend } from './markdown-parser';

export type { MarkdownToken, MarkdownTokenType, ParsedMarkdown } from './markdown-parser';

export { lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, getHeadingFontSize, debounce, generateMermaidHTML, configureIOSWebViewForMermaid, configureAndroidWebViewForMermaid, loadMermaidIntoIOSWebView, loadMermaidIntoAndroidWebView, MERMAID_CDN } from './utils';

export type { StreamdownTheme, HighlightedToken, MermaidHtmlOptions } from './utils';
