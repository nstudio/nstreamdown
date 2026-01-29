/**
 * NativeScript Streamdown Vue Components
 *
 * Export all markdown rendering components for Vue applications
 */

// Main component
export { default as Streamdown } from './components/Streamdown.vue';

// Sub-components
export { default as MdMermaid } from './components/MdMermaid.vue';

// Export registration function for NativeScript elements
export { registerStreamdownElements } from './register-elements';

// Re-export core utilities from main package for convenience
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend, lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, getHeadingFontSize, debounce, generateMermaidHTML, configureIOSWebViewForMermaid, configureAndroidWebViewForMermaid, loadMermaidIntoIOSWebView, loadMermaidIntoAndroidWebView } from '@nstudio/nstreamdown';

export type { MarkdownToken, MarkdownTokenType, ParsedMarkdown, StreamdownTheme, HighlightedToken, MermaidHtmlOptions } from '@nstudio/nstreamdown';
