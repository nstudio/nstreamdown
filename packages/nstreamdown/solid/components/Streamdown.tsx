/**
 * Streamdown Component for Solid
 * Main component for rendering streaming markdown content natively on iOS
 */
import { createSignal, createMemo, createEffect, onCleanup, For, Show, JSX } from 'solid-js';
import { parseMarkdown } from '@nstudio/nstreamdown';
import type { MarkdownToken } from '@nstudio/nstreamdown';

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

  return (
    <stacklayout class="streamdown-container">
      <For each={tokens()}>
        {(token, index) => (
          <>
            {/* Headings */}
            <Show when={isHeading(token)}>
              <label
                text={token.content}
                class={`${getHeadingClass(getHeadingLevel(token))} text-slate-800 mb-2`}
                textWrap={true}
              />
            </Show>

            {/* Paragraphs */}
            <Show when={token.type === 'paragraph'}>
              <label
                text={token.content}
                class="text-base text-slate-700 mb-3 leading-6"
                textWrap={true}
              />
            </Show>

            {/* Code blocks */}
            <Show when={token.type === 'code-block'}>
              <stacklayout class="bg-slate-800 rounded-lg p-3 mb-3">
                <Show when={getLanguage(token)}>
                  <label
                    text={getLanguage(token)}
                    class="text-xs text-slate-400 mb-2"
                  />
                </Show>
                <label
                  text={token.content}
                  class="text-sm text-green-400 font-mono"
                  textWrap={true}
                />
              </stacklayout>
            </Show>

            {/* Blockquotes */}
            <Show when={token.type === 'blockquote'}>
              <stacklayout class="border-l-4 border-slate-300 pl-4 mb-3">
                <label
                  text={token.content}
                  class="text-base text-slate-600 italic"
                  textWrap={true}
                />
              </stacklayout>
            </Show>

            {/* Ordered lists */}
            <Show when={token.type === 'list-ordered'}>
              <stacklayout class="mb-3">
                <For each={token.children || []}>
                  {(item, itemIndex) => (
                    <gridlayout columns="auto, *" class="mb-1">
                      <label col="0" text={`${itemIndex() + 1}.`} class="text-slate-500 mr-2" />
                      <label col="1" text={item.content} class="text-slate-700" textWrap={true} />
                    </gridlayout>
                  )}
                </For>
              </stacklayout>
            </Show>

            {/* Unordered lists */}
            <Show when={token.type === 'list-unordered'}>
              <stacklayout class="mb-3">
                <For each={token.children || []}>
                  {(item) => (
                    <gridlayout columns="auto, *" class="mb-1">
                      <label col="0" text="•" class="text-slate-500 mr-2" />
                      <label col="1" text={item.content} class="text-slate-700" textWrap={true} />
                    </gridlayout>
                  )}
                </For>
              </stacklayout>
            </Show>

            {/* Tables */}
            <Show when={token.type === 'table'}>
              <scrollview orientation="horizontal" class="mb-3">
                <stacklayout class="bg-white rounded-lg border border-slate-200">
                  <For each={token.children || []}>
                    {(row, rowIndex) => (
                      <gridlayout
                        columns={row.children?.map(() => '*').join(', ')}
                        class={rowIndex() === 0 ? 'bg-slate-100' : ''}
                      >
                        <For each={row.children || []}>
                          {(cell, cellIndex) => (
                            <label
                              col={cellIndex()}
                              text={cell.content}
                              class={`${rowIndex() === 0 ? 'font-semibold ' : ''}p-2 text-sm text-slate-700`}
                            />
                          )}
                        </For>
                      </gridlayout>
                    )}
                  </For>
                </stacklayout>
              </scrollview>
            </Show>

            {/* Images */}
            <Show when={token.type === 'image'}>
              <image
                src={getUrl(token)}
                class="rounded-lg mb-3"
                stretch="aspectFit"
              />
            </Show>

            {/* Horizontal rules */}
            <Show when={token.type === 'horizontal-rule'}>
              <stacklayout class="h-px bg-slate-200 my-4" />
            </Show>

            {/* Math blocks */}
            <Show when={token.type === 'math-block'}>
              <label
                text={token.content}
                class="text-base text-slate-700 bg-slate-100 p-3 rounded-lg mb-3 font-mono"
                textWrap={true}
              />
            </Show>
          </>
        )}
      </For>

      {/* Streaming caret */}
      <Show when={showCaret() && isStreamingActive()}>
        <label text={caretChar()} class="text-lg text-gray-400 animate-pulse" />
      </Show>
    </stacklayout>
  );
}
