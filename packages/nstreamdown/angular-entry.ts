/**
 * NativeScript Streamdown - Angular Package Entry Point
 *
 * This is a simplified export for the Angular package build.
 * It avoids the references.d.ts to prevent ng-packagr issues with NativeScript types.
 */

// Export core library
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend, MarkdownToken, MarkdownTokenType, ParsedMarkdown } from './lib/markdown-parser';

export { StreamdownTheme, lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, HighlightedToken, getHeadingFontSize, debounce } from './lib/utils';

// Export views
export { NativeCodeView } from './views/native-code-view';

// Export menu utilities
export { showMenu, MenuItem, MenuConfig, MenuResult } from './utils';
