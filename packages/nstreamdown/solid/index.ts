/**
 * NativeScript Streamdown Solid Components
 *
 * Export all markdown rendering components for Solid applications
 */

// Main component
export { Streamdown } from './components/Streamdown';
export type { StreamdownConfig, StreamdownProps } from './components/Streamdown';

// Sub-components
export { MdMermaid } from './components/MdMermaid';
export type { MdMermaidProps } from './components/MdMermaid';

// Export registration function for NativeScript elements
export { registerStreamdownElements } from './register-elements';

// Re-export core utilities from main package for convenience
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend, lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, getHeadingFontSize, debounce, generateMermaidHTML, configureIOSWebViewForMermaid, configureAndroidWebViewForMermaid, loadMermaidIntoIOSWebView, loadMermaidIntoAndroidWebView } from '@nstudio/nstreamdown';

export type { MarkdownToken, MarkdownTokenType, ParsedMarkdown, StreamdownTheme, HighlightedToken, MermaidHtmlOptions } from '@nstudio/nstreamdown';
