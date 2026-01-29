/**
 * NativeScript Streamdown Svelte Components
 *
 */

// Main component
export { default as Streamdown } from './components/Streamdown.svelte';

// Sub-components
export { default as MdMermaid } from './components/MdMermaid.svelte';

// Export registration function for NativeScript elements
export { registerStreamdownElements } from './register-elements';

// Re-export core utilities from main package for convenience
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend, lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, getHeadingFontSize, debounce, generateMermaidHTML, configureIOSWebViewForMermaid, configureAndroidWebViewForMermaid, loadMermaidIntoIOSWebView, loadMermaidIntoAndroidWebView } from '@nstudio/nstreamdown';

export type { MarkdownToken, MarkdownTokenType, ParsedMarkdown, StreamdownTheme, HighlightedToken, MermaidHtmlOptions } from '@nstudio/nstreamdown';
