import { NgModule } from '@angular/core';

// Export all Angular components
export { Streamdown, MdHeading, MdParagraph, MdCodeBlock, MdBlockquote, MdList, MdTable, MdImage, MdHorizontalRule, MdMath, MdInline, MdText, MdCheckbox, NativeRichText } from './components';

export type { StreamdownConfig } from './components';

// Export registration function for NativeScript elements
export { registerStreamdownElements } from './register-elements';

// Re-export core utilities from main package for convenience
export { parseMarkdown, parseMarkdownIntoBlocks, parseInlineFormatting, remend, lightTheme, darkTheme, cn, copyToClipboard, openUrl, highlightCode, getHeadingFontSize, debounce } from '@nstudio/nstreamdown';

export type { MarkdownToken, MarkdownTokenType, ParsedMarkdown, StreamdownTheme, HighlightedToken } from '@nstudio/nstreamdown';

// NativeScript Angular Module (optional - components are standalone)
@NgModule()
export class NativeScriptNstreamdownModule {}
