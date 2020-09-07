/**
 * Streamdown Component for React
 * Main component for rendering streaming markdown content natively on iOS
 */
import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

export function Streamdown({
  content,
  config = {},
  isStreaming: externalIsStreaming = false,
  onLinkTap,
  onParseComplete
}: StreamdownProps): React.ReactElement {
  const [markdown, setMarkdown] = useState('');
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef('');
  const lastUpdateTimeRef = useRef(0);
  const THROTTLE_MS = 32;

  // Computed values
  const mode = config?.mode || 'streaming';
  const showCaret = config?.showCaret ?? true;
  const caretChar = config?.caret || '▋';

  // Parse tokens
  const parsedResult = useMemo(() => {
    if (!markdown) return { tokens: [], isComplete: true };
    return parseMarkdown(markdown, mode === 'streaming');
  }, [markdown, mode]);

  const tokens = parsedResult.tokens;
  const isComplete = parsedResult.isComplete;
  const isStreamingActive = mode === 'streaming' && !isComplete;

  // Watch content changes with throttling
  useEffect(() => {
    if (mode === 'streaming') {
      pendingContentRef.current = content;
      const now = Date.now();
      const elapsed = now - lastUpdateTimeRef.current;

      if (elapsed >= THROTTLE_MS) {
        lastUpdateTimeRef.current = now;
        setMarkdown(content);
      } else if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(() => {
          throttleTimerRef.current = null;
          lastUpdateTimeRef.current = Date.now();
          setMarkdown(pendingContentRef.current);
        }, THROTTLE_MS - elapsed);
      }
    } else {
      setMarkdown(content);
    }
  }, [content, mode]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, []);

  // Helper functions
  const isHeading = useCallback((token: MarkdownToken): boolean => {
    return token.type.startsWith('heading');
  }, []);

  const getHeadingLevel = useCallback((token: MarkdownToken): number => {
    return parseInt(token.type.replace('heading', ''), 10) || 1;
  }, []);

  const getLanguage = useCallback((token: MarkdownToken): string => {
    return (token.metadata?.['language'] as string) || '';
  }, []);

  const getUrl = useCallback((token: MarkdownToken): string => {
    return (token.metadata?.['url'] as string) || '';
  }, []);

  const getHeadingClass = useCallback((level: number): string => {
    const sizes: Record<number, string> = {
      1: 'text-3xl font-bold',
      2: 'text-2xl font-bold',
      3: 'text-xl font-semibold',
      4: 'text-lg font-semibold',
      5: 'text-base font-medium',
      6: 'text-sm font-medium'
    };
    return sizes[level] || sizes[1];
  }, []);

  const renderToken = (token: MarkdownToken, index: number) => {
    const key = `${index}-${token.type}-${token.content?.length || 0}`;

    // Headings
    if (isHeading(token)) {
      return (
        <label
          key={key}
          text={token.content}
          className={`${getHeadingClass(getHeadingLevel(token))} text-slate-800 mb-2`}
          textWrap={true}
        />
      );
    }

    // Paragraphs
    if (token.type === 'paragraph') {
      return (
        <label
          key={key}
          text={token.content}
          className="text-base text-slate-700 mb-3 leading-6"
          textWrap={true}
        />
      );
    }

    // Code blocks
    if (token.type === 'code-block') {
      return (
        <stackLayout key={key} className="bg-slate-800 rounded-lg p-3 mb-3">
          {getLanguage(token) && (
            <label
              text={getLanguage(token)}
              className="text-xs text-slate-400 mb-2"
            />
          )}
          <label
            text={token.content}
            className="text-sm text-green-400 font-mono"
            textWrap={true}
          />
        </stackLayout>
      );
    }

    // Blockquotes
    if (token.type === 'blockquote') {
      return (
        <stackLayout key={key} className="border-l-4 border-slate-300 pl-4 mb-3">
          <label
            text={token.content}
            className="text-base text-slate-600 italic"
            textWrap={true}
          />
        </stackLayout>
      );
    }

    // Ordered lists
    if (token.type === 'list-ordered') {
      return (
        <stackLayout key={key} className="mb-3">
          {(token.children || []).map((item, itemIndex) => (
            <gridLayout key={itemIndex} columns="auto, *" className="mb-1">
              <label col={0} text={`${itemIndex + 1}.`} className="text-slate-500 mr-2" />
              <label col={1} text={item.content} className="text-slate-700" textWrap={true} />
            </gridLayout>
          ))}
        </stackLayout>
      );
    }

    // Unordered lists
    if (token.type === 'list-unordered') {
      return (
        <stackLayout key={key} className="mb-3">
          {(token.children || []).map((item, itemIndex) => (
            <gridLayout key={itemIndex} columns="auto, *" className="mb-1">
              <label col={0} text="•" className="text-slate-500 mr-2" />
              <label col={1} text={item.content} className="text-slate-700" textWrap={true} />
            </gridLayout>
          ))}
        </stackLayout>
      );
    }

    // Tables
    if (token.type === 'table') {
      return (
        <scrollView key={key} orientation="horizontal" className="mb-3">
          <stackLayout className="bg-white rounded-lg border border-slate-200">
            {(token.children || []).map((row, rowIndex) => (
              <gridLayout
                key={rowIndex}
                columns={row.children?.map(() => '*').join(', ')}
                className={rowIndex === 0 ? 'bg-slate-100' : ''}
              >
                {(row.children || []).map((cell, cellIndex) => (
                  <label
                    key={cellIndex}
                    col={cellIndex}
                    text={cell.content}
                    className={`${rowIndex === 0 ? 'font-semibold ' : ''}p-2 text-sm text-slate-700`}
                  />
                ))}
              </gridLayout>
            ))}
          </stackLayout>
        </scrollView>
      );
    }

    // Images
    if (token.type === 'image') {
      return (
        <image
          key={key}
          src={getUrl(token)}
          className="rounded-lg mb-3"
          stretch="aspectFit"
        />
      );
    }

    // Horizontal rules
    if (token.type === 'horizontal-rule') {
      return <stackLayout key={key} className="h-px bg-slate-200 my-4" />;
    }

    // Math blocks
    if (token.type === 'math-block') {
      return (
        <label
          key={key}
          text={token.content}
          className="text-base text-slate-700 bg-slate-100 p-3 rounded-lg mb-3 font-mono"
          textWrap={true}
        />
      );
    }

    return null;
  };

  return (
    <stackLayout className="streamdown-container">
      {tokens.map((token, index) => renderToken(token, index))}

      {/* Streaming caret */}
      {showCaret && isStreamingActive && (
        <label text={caretChar} className="text-lg text-gray-400 animate-pulse" />
      )}
    </stackLayout>
  );
}
