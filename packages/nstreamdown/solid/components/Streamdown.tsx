/**
 * Streamdown Component for Solid
 * Main component for rendering streaming markdown content natively on iOS
 */
import { createSignal, createMemo, createEffect, onCleanup, onMount, For, Show, Switch, Match, JSX } from 'solid-js';
import { isIOS, isAndroid } from '@nativescript/core';
import { parseMarkdown, parseInlineFormatting, copyToClipboard
} from '@nstudio/nstreamdown';
import type { MarkdownToken } from '@nstudio/nstreamdown';
import { MdMermaid } from './MdMermaid';

// Declare iOS types available at runtime
declare type UILabel = any;
declare const SyntaxHighlighter: any;

// Declare Android types
declare const org: any;
declare const android: any;

/**
 * CodeBlock Component
 * Renders code blocks with syntax highlighting using native highlighters
 */
interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock(props: CodeBlockProps): JSX.Element {
  const [copied, setCopied] = createSignal(false);
  let nativeLabel: any = null;
  let lastHighlightedCode = '';

  const onCopy = () => {
    if (copyToClipboard(props.code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyHighlighting = (code: string, language: string) => {
    if (!nativeLabel || !code) return;

    // Skip if already highlighted this exact code
    if (lastHighlightedCode === code) return;
    lastHighlightedCode = code;

    if (isIOS) {
      try {
        const iosLabel = nativeLabel.ios as UILabel;
        if (iosLabel) {
          // Use native Swift syntax highlighter
          if (typeof SyntaxHighlighter !== 'undefined') {
            const highlighter = SyntaxHighlighter.shared;
            if (highlighter) {
              const attrString = highlighter.highlightLanguage(code, language || 'typescript');
              if (attrString) {
                iosLabel.attributedText = attrString;
                return;
              }
            }
          }
        }
      } catch (e) {
        console.log('[CodeBlock] iOS Syntax highlighting error:', e);
      }
    }

    // Android - use native Kotlin syntax highlighter
    if (isAndroid) {
      try {
        const androidLabel = nativeLabel.android;
        if (androidLabel && typeof org !== 'undefined' && org.nativescript?.streamdown?.SyntaxHighlighter) {
          const highlighter = org.nativescript.streamdown.SyntaxHighlighter.getShared();
          const scheme = org.nativescript.streamdown.SyntaxHighlighter.getDarkScheme();

          // Reduce line spacing to match iOS
          androidLabel.setLineSpacing(0, 1.0);

          // Use synchronous highlight for immediate display
          const spannableString = highlighter.highlight(code, language || 'typescript', scheme);
          if (spannableString) {
            androidLabel.setText(spannableString, android.widget.TextView.BufferType.SPANNABLE);
            return;
          }
        }
      } catch (e) {
        console.log('[CodeBlock] Android Syntax highlighting error:', e);
      }
    }

    // Fallback to plain text
    if (nativeLabel) {
      nativeLabel.text = code;
    }
  };

  const onContainerLoaded = (args: any) => {
    // Apply rounded corners on Android programmatically
    if (isAndroid) {
      const view = args.object;
      const nativeView = view.android;
      if (nativeView) {
        const context = nativeView.getContext();
        const density = context.getResources().getDisplayMetrics().density;
        const radiusPx = 12 * density;

        const drawable = new android.graphics.drawable.GradientDrawable();
        drawable.setCornerRadius(radiusPx);
        drawable.setColor(android.graphics.Color.rgb(15, 23, 42)); // bg-slate-900
        nativeView.setBackground(drawable);
        nativeView.setClipToOutline(true);
      }
    }
  };

  const onCodeLabelLoaded = (args: any) => {
    nativeLabel = args.object;
    // Trigger initial render
    if (props.code) {
      applyHighlighting(props.code, props.language);
    }
  };

  // Re-apply highlighting when code changes
  createEffect(() => {
    const currentCode = props.code;
    const currentLang = props.language;
    if (nativeLabel && currentCode) {
      applyHighlighting(currentCode, currentLang);
    }
  });

  return (
    <gridlayout class="rounded-xl border border-slate-700 bg-slate-900 mt-2 mb-3 overflow-hidden" rows="auto, auto" on:loaded={onContainerLoaded}>
      {/* Header with language and copy button */}
      <gridlayout row="0" columns="*, auto" class="bg-slate-800 border-b border-slate-700 px-3 py-2">
        <label col="0" text={props.language || 'code'} class="text-xs text-slate-400 font-mono" />
        <Show when={isIOS} fallback={
          <label col="1" text={copied() ? '✓' : '📋'} class="text-base text-blue-400 px-1 h-[18]" on:tap={onCopy} />
        }>
          <image src={copied() ? 'sys://checkmark.circle' : 'sys://document.on.document'} col="1" class="w-4 h-4 text-blue-400" on:tap={onCopy} />
        </Show>
      </gridlayout>

      {/* Code content with native syntax highlighting */}
      <scrollview row="1" orientation="horizontal" class="bg-slate-900">
        <stacklayout class="p-3">
          <label class="font-mono text-xs" textWrap={true} on:loaded={onCodeLabelLoaded} />
        </stacklayout>
      </scrollview>
    </gridlayout>
  );
}

export interface StreamdownConfig {
  /** Mode: 'streaming' for real-time updates, 'static' for complete markdown */
  mode?: 'streaming' | 'static';
  /** Whether to show copy/download controls */
  controls?: boolean;
  /** Whether to animate the caret during streaming */
  showCaret?: boolean;
  /** Custom caret character */
  caret?: string;
}

export interface StreamdownProps {
  content: string;
  config?: StreamdownConfig;
  isStreaming?: boolean;
  onLinkTap?: (url: string) => void;
  onParseComplete?: () => void;
}

export function Streamdown(props: StreamdownProps): JSX.Element {
  const [markdown, setMarkdown] = createSignal('');
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingContent = '';
  let lastUpdateTime = 0;
  const THROTTLE_MS = 32;

  // Computed values
  const mode = () => props.config?.mode || 'streaming';
  const showCaret = () => props.config?.showCaret ?? true;
  const caretChar = () => props.config?.caret || '▋';

  // Parsed result
  const parsedResult = createMemo(() => {
    const md = markdown();
    if (!md) return { tokens: [], isComplete: true };
    const isStreamingMode = mode() === 'streaming';
    return parseMarkdown(md, isStreamingMode);
  });

  const tokens = () => parsedResult().tokens;
  const isComplete = () => parsedResult().isComplete;
  const isStreamingActive = () => mode() === 'streaming' && !isComplete();

  // Watch content changes with throttling
  createEffect(() => {
    const newContent = props.content;
    const currentMode = mode();

    if (currentMode === 'streaming') {
      pendingContent = newContent;
      const now = Date.now();
      const elapsed = now - lastUpdateTime;

      if (elapsed >= THROTTLE_MS) {
        lastUpdateTime = now;
        setMarkdown(newContent);
      } else if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          lastUpdateTime = Date.now();
          setMarkdown(pendingContent);
        }, THROTTLE_MS - elapsed);
      }
    } else {
      setMarkdown(newContent);
    }
  });

  // Cleanup
  onCleanup(() => {
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
  });

  // Helper functions
  const isHeading = (token: MarkdownToken): boolean => token.type.startsWith('heading');
  const getHeadingLevel = (token: MarkdownToken): number => parseInt(token.type.replace('heading', ''), 10) || 1;
  const getLanguage = (token: MarkdownToken): string => (token.metadata?.['language'] as string) || '';
  const getUrl = (token: MarkdownToken): string => (token.metadata?.['url'] as string) || '';

  const getHeadingClass = (level: number): string => {
    const sizes: Record<number, string> = {
      1: 'text-3xl font-bold',
      2: 'text-2xl font-bold',
      3: 'text-xl font-semibold',
      4: 'text-lg font-semibold',
      5: 'text-base font-medium',
      6: 'text-sm font-medium'
    };
    return sizes[level] || sizes[1];
  };

  // Get children for inline formatting, parsing content if needed
  const getInlineChildren = (token: MarkdownToken): MarkdownToken[] => {
    if (token.children && token.children.length > 0) {
      return token.children;
    }
    if (token.content) {
      return parseInlineFormatting(token.content);
    }
    return [{ type: 'text', raw: '', content: '' }];
  };

  // Check if list item is a task item
  const isTaskItem = (item: MarkdownToken): boolean => {
    return item.metadata?.['isTask'] === true;
  };

  // Check if task item is checked
  const isChecked = (item: MarkdownToken): boolean => {
    return item.metadata?.['isChecked'] === true;
  };

  // Get bullet for list item
  const getBullet = (index: number, item: MarkdownToken, ordered: boolean): string => {
    if (ordered) {
      const num = item.metadata?.['number'] ?? index + 1;
      return `${num}.`;
    }
    return '•';
  };

  // Calculate column widths for tables
  const calculateColumnWidths = (rows: MarkdownToken[]): string => {
    const allRows = rows.filter((row) => !row.metadata?.['isSeparator']);
    if (allRows.length === 0) return '*';

    const columnCount = allRows[0]?.children?.length || 1;
    const widths: number[] = new Array(columnCount).fill(0);

    // Calculate max content length for each column
    for (const row of allRows) {
      if (!row.children) continue;
      for (let i = 0; i < row.children.length && i < columnCount; i++) {
        const cell = row.children[i];
        const contentLength = getCellTextLength(cell);
        widths[i] = Math.max(widths[i], contentLength);
      }
    }

    // Convert character lengths to approximate pixel widths
    const pixelWidths = widths.map((charCount) => {
      const minWidth = 60;
      const calculatedWidth = Math.max(minWidth, charCount * 8 + 32);
      return Math.min(calculatedWidth, 200);
    });

    return pixelWidths.map((w) => `${w}`).join(', ');
  };

  const getCellTextLength = (cell: MarkdownToken): number => {
    if (cell.children && cell.children.length > 0) {
      return cell.children.reduce((sum, token) => sum + (token.content?.length || 0), 0);
    }
    return cell.content?.length || 0;
  };

  // Get header row from table rows
  const getHeaderRow = (rows: MarkdownToken[]): MarkdownToken | null => {
    return rows.find((row) => row.metadata?.['isHeader']) || null;
  };

  // Get body rows from table rows
  const getBodyRows = (rows: MarkdownToken[]): MarkdownToken[] => {
    return rows.filter((row) => !row.metadata?.['isHeader'] && !row.metadata?.['isSeparator']);
  };

  // LaTeX to Unicode conversion for math expressions
  const latexToUnicode = (latex: string): string => {
    let result = latex.trim();

    // Greek letters (lowercase)
    const greekLower: Record<string, string> = {
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
      '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η',
      '\\theta': 'θ', '\\vartheta': 'ϑ', '\\iota': 'ι', '\\kappa': 'κ',
      '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ',
      '\\pi': 'π', '\\varpi': 'ϖ', '\\rho': 'ρ', '\\varrho': 'ϱ',
      '\\sigma': 'σ', '\\varsigma': 'ς', '\\tau': 'τ', '\\upsilon': 'υ',
      '\\phi': 'φ', '\\varphi': 'ϕ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
    };

    // Greek letters (uppercase)
    const greekUpper: Record<string, string> = {
      '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
      '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ',
      '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
    };

    // Mathematical operators and symbols
    const mathSymbols: Record<string, string> = {
      '\\infty': '∞', '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\div': '÷',
      '\\cdot': '·', '\\ast': '∗', '\\star': '⋆', '\\circ': '∘',
      '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
      '\\neq': '≠', '\\ne': '≠', '\\approx': '≈', '\\simeq': '≃',
      '\\equiv': '≡', '\\cong': '≅', '\\propto': '∝', '\\ll': '≪', '\\gg': '≫',
      '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\oint': '∮',
      '\\partial': '∂', '\\nabla': '∇', '\\prime': '′',
      '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
      '\\in': '∈', '\\notin': '∉', '\\ni': '∋',
      '\\subset': '⊂', '\\supset': '⊃', '\\subseteq': '⊆', '\\supseteq': '⊇',
      '\\cup': '∪', '\\cap': '∩', '\\emptyset': '∅', '\\varnothing': '∅',
      '\\land': '∧', '\\lor': '∨', '\\lnot': '¬', '\\neg': '¬',
      '\\rightarrow': '→', '\\to': '→', '\\leftarrow': '←', '\\gets': '←',
      '\\leftrightarrow': '↔', '\\Rightarrow': '⇒', '\\Leftarrow': '⇐',
      '\\Leftrightarrow': '⇔', '\\mapsto': '↦',
      '\\sqrt': '√', '\\surd': '√', '\\angle': '∠', '\\perp': '⊥',
      '\\parallel': '∥', '\\triangle': '△', '\\square': '□',
      '\\ldots': '…', '\\cdots': '⋯', '\\vdots': '⋮', '\\ddots': '⋱',
    };

    // Superscript digits and letters
    const superscripts: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
      'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ',
    };

    // Subscript digits
    const subscripts: Record<string, string> = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
      'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ',
      'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'n': 'ₙ', 'm': 'ₘ',
    };

    // Apply Greek letters
    for (const [tex, unicode] of Object.entries({ ...greekLower, ...greekUpper })) {
      result = result.replace(new RegExp(tex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g'), unicode);
    }

    // Apply math symbols
    for (const [tex, unicode] of Object.entries(mathSymbols)) {
      result = result.replace(new RegExp(tex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g'), unicode);
    }

    // Handle fractions
    result = result.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) => {
      if (num.length === 1 && den.length === 1) {
        const supNum = superscripts[num] || num;
        const subDen = subscripts[den] || den;
        return `${supNum}⁄${subDen}`;
      }
      return `(${num})/(${den})`;
    });

    // Handle superscripts
    result = result.replace(/\^{([^{}]+)}/g, (_, content) => {
      return content.split('').map((c: string) => superscripts[c] || c).join('');
    });
    result = result.replace(/\^([0-9n])/g, (_, c) => superscripts[c] || `^${c}`);

    // Handle subscripts
    result = result.replace(/_{([^{}]+)}/g, (_, content) => {
      return content.split('').map((c: string) => subscripts[c] || c).join('');
    });
    result = result.replace(/_([0-9])/g, (_, c) => subscripts[c] || `_${c}`);

    // Handle square roots
    result = result.replace(/\\sqrt{([^{}]+)}/g, '√($1)');
    result = result.replace(/\\sqrt\[([^\]]+)\]{([^{}]+)}/g, '$1√($2)');

    // Handle text commands
    result = result.replace(/\\text{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathrm{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathbf{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathit{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathbb{([^{}]+)}/g, (_, c) => {
      const bb: Record<string, string> = { 'N': 'ℕ', 'Z': 'ℤ', 'Q': 'ℚ', 'R': 'ℝ', 'C': 'ℂ' };
      return bb[c] || c;
    });

    // Handle common functions
    result = result.replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|exp|lim|max|min|sup|inf|det|dim|ker|deg)(?![a-zA-Z])/g, '$1');

    // Remove leftover LaTeX commands
    result = result.replace(/\\(left|right|big|Big|bigg|Bigg|,|;|:|!|\s)/g, '');
    result = result.replace(/\\[a-zA-Z]+/g, '');

    // Clean up braces
    result = result.replace(/[{}]/g, '');

    // Clean up extra whitespace
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  };

  // Render inline span based on type (with checked state support)
  const renderSpan = (child: MarkdownToken, isCheckedItem: boolean = false) => {
    const checkedClass = isCheckedItem ? 'text-slate-400 dark:text-slate-500' : '';
    
    switch (child.type) {
      case 'bold':
        return <span text={child.content} class={`font-bold ${checkedClass}`} />;
      case 'italic':
        return <span text={child.content} class={`italic ${checkedClass}`} />;
      case 'bold-italic':
        return <span text={child.content} class={`font-bold italic ${checkedClass}`} />;
      case 'code-inline':
        return <span text={child.content} class="font-mono bg-slate-100 dark:bg-slate-700 text-pink-600 dark:text-pink-400" />;
      case 'strikethrough':
        return <span text={child.content} class="text-slate-400 dark:text-slate-500" textDecoration="line-through" />;
      case 'link':
        return <span text={child.content} class="text-blue-600 dark:text-blue-400 underline" />;
      case 'math-inline':
        return <span text={latexToUnicode(child.content)} class="text-blue-800 dark:text-blue-300 italic" />;
      default:
        return <span text={child.content} class={checkedClass} />;
    }
  };

  return (
    <stacklayout class="streamdown-container">
      <For each={tokens()}>
        {(token, index) => (
          <Switch fallback={null}>
            {/* Headings */}
            <Match when={isHeading(token)}>
              <label
                class={`${getHeadingClass(getHeadingLevel(token))} text-slate-800 mb-2 leading-[3]`}
                textWrap={true}
              >
                <formattedstring>
                  <For each={getInlineChildren(token)}>
                    {(child) => renderSpan(child)}
                  </For>
                </formattedstring>
              </label>
            </Match>

            {/* Paragraphs */}
            <Match when={token.type === 'paragraph'}>
              <label
                class="text-base text-slate-700 mb-3 leading-[3]"
                textWrap={true}
              >
                <formattedstring>
                  <For each={getInlineChildren(token)}>
                    {(child) => renderSpan(child)}
                  </For>
                </formattedstring>
              </label>
            </Match>

            {/* Code blocks */}
            <Match when={token.type === 'code-block'}>
              <CodeBlock code={token.content} language={getLanguage(token)} />
            </Match>

            {/* Blockquotes */}
            <Match when={token.type === 'blockquote'}>
              <stacklayout class="border-l-4 border-slate-300 pl-4 mb-3">
                <label
                  class="text-base text-slate-600 italic leading-[3]"
                  textWrap={true}
                >
                  <formattedstring>
                    <For each={getInlineChildren(token)}>
                      {(child) => renderSpan(child)}
                    </For>
                  </formattedstring>
                </label>
              </stacklayout>
            </Match>

            {/* Ordered lists */}
            <Match when={token.type === 'list-ordered'}>
              <stacklayout class="my-2 pl-2">
                <For each={token.children || []}>
                  {(item, itemIndex) => (
                    <gridlayout columns={isTaskItem(item) ? 'auto, auto, *' : 'auto, *'} class="py-0.5">
                      {/* Bullet or number (not shown for task items) */}
                      <Show when={!isTaskItem(item)}>
                        <label col="0" text={getBullet(itemIndex(), item, true)} class="text-sm text-slate-500 dark:text-slate-400 pr-2 w-6 leading-[3]" />
                      </Show>
                      {/* Checkbox for task items */}
                      <Show when={isTaskItem(item)}>
                        <gridlayout col="0" rows="18" columns="18" class="mr-2">
                          <label text={isChecked(item) ? '☑' : '☐'} class={isChecked(item) ? 'text-green-600 dark:text-green-400 text-base align-middle' : 'text-slate-400 dark:text-slate-500 text-base align-middle'} />
                        </gridlayout>
                      </Show>
                      {/* Content with inline formatting */}
                      <flexboxlayout col={isTaskItem(item) ? 1 : 1} flexWrap="wrap" alignItems="center">
                        <For each={getInlineChildren(item)}>
                          {(child) => (
                            <label class={`text-sm leading-[3] ${isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`} textWrap={true}>
                              <formattedstring>
                                {renderSpan(child, isChecked(item))}
                              </formattedstring>
                            </label>
                          )}
                        </For>
                      </flexboxlayout>
                    </gridlayout>
                  )}
                </For>
              </stacklayout>
            </Match>

            {/* Unordered lists */}
            <Match when={token.type === 'list-unordered'}>
              <stacklayout class="my-2 pl-2">
                <For each={token.children || []}>
                  {(item, itemIndex) => (
                    <gridlayout columns={isTaskItem(item) ? 'auto, auto, *' : 'auto, *'} class="py-0.5">
                      {/* Bullet (not shown for task items) */}
                      <Show when={!isTaskItem(item)}>
                        <label col="0" text={getBullet(itemIndex(), item, false)} class="text-sm text-slate-500 dark:text-slate-400 pr-2 w-6 leading-[3]" />
                      </Show>
                      {/* Checkbox for task items */}
                      <Show when={isTaskItem(item)}>
                        <gridlayout col="0" rows="18" columns="18" class="mr-2">
                          <label text={isChecked(item) ? '☑' : '☐'} class={isChecked(item) ? 'text-green-600 dark:text-green-400 text-base align-middle' : 'text-slate-400 dark:text-slate-500 text-base align-middle'} />
                        </gridlayout>
                      </Show>
                      {/* Content with inline formatting */}
                      <flexboxlayout col={isTaskItem(item) ? 1 : 1} flexWrap="wrap" alignItems="center">
                        <For each={getInlineChildren(item)}>
                          {(child) => (
                            <label class={`text-sm leading-[3] ${isChecked(item) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`} textWrap={true}>
                              <formattedstring>
                                {renderSpan(child, isChecked(item))}
                              </formattedstring>
                            </label>
                          )}
                        </For>
                      </flexboxlayout>
                    </gridlayout>
                  )}
                </For>
              </stacklayout>
            </Match>

            {/* Tables */}
            <Match when={token.type === 'table'}>
              <gridlayout class="rounded-xl border border-slate-200 dark:border-slate-700 my-3 overflow-hidden" rows="auto, *">
                {/* Controls */}
                <gridlayout row="0" columns="*, auto" class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2">
                  <label col="0" text="Table" class="text-xs text-slate-400 dark:text-slate-500" />
                  <label col="1" text="Copy" class="text-xs text-blue-600 dark:text-blue-400 font-medium" on:tap={() => {
                    const lines: string[] = [];
                    for (const row of token.children || []) {
                      const cells = row.children?.map((cell) => cell.content) || [];
                      lines.push(cells.join('\t'));
                    }
                    copyToClipboard(lines.join('\n'));
                  }} />
                </gridlayout>

                {/* Table content */}
                <scrollview row="1" orientation="horizontal">
                  <stacklayout>
                    {/* Header row */}
                    <Show when={getHeaderRow(token.children || [])}>
                      {(header) => (
                        <gridlayout columns={calculateColumnWidths(token.children || [])} class="bg-slate-100 dark:bg-slate-800">
                          <For each={header().children || []}>
                            {(cell, cellIndex) => (
                              <stacklayout col={cellIndex()} class="border-b border-slate-200 dark:border-slate-700 px-3 py-2">
                                <flexboxlayout flexWrap="wrap" alignItems="center">
                                  <For each={getInlineChildren(cell)}>
                                    {(child) => (
                                      <label class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        <formattedstring>
                                          {renderSpan(child)}
                                        </formattedstring>
                                      </label>
                                    )}
                                  </For>
                                </flexboxlayout>
                              </stacklayout>
                            )}
                          </For>
                        </gridlayout>
                      )}
                    </Show>

                    {/* Body rows */}
                    <For each={getBodyRows(token.children || [])}>
                      {(row, rowIndex) => (
                        <gridlayout columns={calculateColumnWidths(token.children || [])} class={rowIndex() % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'}>
                          <For each={row.children || []}>
                            {(cell, cellIndex) => (
                              <stacklayout col={cellIndex()} class="border-b border-slate-100 dark:border-slate-700 px-3 py-2">
                                <flexboxlayout flexWrap="wrap" alignItems="center">
                                  <For each={getInlineChildren(cell)}>
                                    {(child) => (
                                      <label class="text-xs text-slate-700 dark:text-slate-300">
                                        <formattedstring>
                                          {renderSpan(child)}
                                        </formattedstring>
                                      </label>
                                    )}
                                  </For>
                                </flexboxlayout>
                              </stacklayout>
                            )}
                          </For>
                        </gridlayout>
                      )}
                    </For>
                  </stacklayout>
                </scrollview>
              </gridlayout>
            </Match>

            {/* Images */}
            <Match when={token.type === 'image'}>
              <image
                src={getUrl(token)}
                class="rounded-lg mb-3"
                stretch="aspectFit"
              />
            </Match>

            {/* Horizontal rules */}
            <Match when={token.type === 'horizontal-rule'}>
              <stacklayout class="h-px bg-slate-200 my-4" />
            </Match>

            {/* Math blocks */}
            <Match when={token.type === 'math-block'}>
              <gridlayout class="rounded-xl border border-blue-200 dark:border-blue-800 my-3 overflow-hidden" rows="auto, auto">
                {/* Controls */}
                <gridlayout row="0" columns="auto, *, auto" class="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-3 py-2">
                  <label col="0" text="∑ Math" class="text-xs text-blue-600 dark:text-blue-400 font-medium" />
                  <label col="1" />
                  <label col="2" text="Copy LaTeX" class="text-xs text-blue-600 dark:text-blue-400" on:tap={() => copyToClipboard(token.content)} />
                </gridlayout>
                {/* Math content */}
                <stacklayout row="1" class="bg-gradient-to-b from-blue-50 dark:from-slate-800 to-white dark:to-slate-900 p-5">
                  <label text={latexToUnicode(token.content)} class="text-xl text-gray-900 dark:text-gray-100 text-center font-medium" textWrap={true} />
                </stacklayout>
              </gridlayout>
            </Match>

            {/* Mermaid diagrams */}
            <Match when={token.type === 'mermaid-block'}>
              <MdMermaid
                content={token.content}
                darkMode={true}
              />
            </Match>
          </Switch>
        )}
      </For>

      {/* Streaming caret */}
      <Show when={showCaret() && isStreamingActive()}>
        <label text={caretChar()} class="text-lg text-gray-400 animate-pulse" />
      </Show>
    </stacklayout>
  );
}
