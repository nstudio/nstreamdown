<stackLayout class="streamdown-container">
    {#each tokens as token, index (getTokenKey(index, token))}
        <!-- Headings -->
        {#if isHeading(token)}
            <label
                class="{getHeadingClass(getHeadingLevel(token))} {textColorOverride ? '' : 'text-slate-800'} {headingSpacing || 'mb-2'}"
                textWrap={true}
                color={textColorOverride}
            >
                <formattedString>
                    {#each token.children || [{ type: 'text', content: token.content }] as child}
                        {#if child.type === 'bold'}
                            <span text={child.content} class="font-bold" />
                        {:else if child.type === 'italic'}
                            <span text={child.content} class="italic" />
                        {:else if child.type === 'bold-italic'}
                            <span text={child.content} class="font-bold italic" />
                        {:else if child.type === 'code-inline'}
                            <span text={child.content} class="font-mono bg-slate-200 text-pink-600" color={codeInlineColorOverride} />
                        {:else if child.type === 'strikethrough'}
                            <span text={child.content} class="line-through" color={strikethroughColorOverride} />
                        {:else}
                            <span text={child.content} />
                        {/if}
                    {/each}
                </formattedString>
            </label>
        {/if}

        <!-- Paragraphs -->
        {#if token.type === 'paragraph'}
            <label
                class="text-base text-slate-700 {paragraphSpacing || 'mb-3'} leading-6"
                textWrap={true}
                color={textColorOverride}
            >
                <formattedString>
                    {#each token.children || [{ type: 'text', content: token.content }] as child}
                        {#if child.type === 'bold'}
                            <span text={child.content} class="font-bold" />
                        {:else if child.type === 'italic'}
                            <span text={child.content} class="italic" />
                        {:else if child.type === 'bold-italic'}
                            <span text={child.content} class="font-bold italic" />
                        {:else if child.type === 'code-inline'}
                            <span text={child.content} class="font-mono bg-slate-200 text-pink-600" color={codeInlineColorOverride} />
                        {:else if child.type === 'strikethrough'}
                            <span text={child.content} class="line-through text-slate-400" color={strikethroughColorOverride} />
                        {:else if child.type === 'link'}
                            <span text={child.content} class="text-blue-600 underline" color={linkColorOverride} />
                        {:else}
                            <span text={child.content} />
                        {/if}
                    {/each}
                </formattedString>
            </label>
        {/if}

        <!-- Code blocks -->
        {#if token.type === 'code-block'}
            <stackLayout class="bg-slate-800 rounded-lg p-3 {codeBlockSpacing || 'mb-3'}">
                {#if getLanguage(token)}
                    <label
                        text={getLanguage(token)}
                        class="text-xs text-slate-400 mb-2"
                    />
                {/if}
                <label
                    text={token.content}
                    class="text-sm text-green-400 font-mono"
                    textWrap={true}
                />
            </stackLayout>
        {/if}

        <!-- Blockquotes -->
        {#if token.type === 'blockquote'}
            <stackLayout class="border-l-4 border-slate-300 pl-4 {blockquoteSpacing || 'mb-3'}">
                <label
                    text={token.content}
                    class="text-base text-slate-600 italic"
                    textWrap={true}
                    color={textColorOverride}
                />
            </stackLayout>
        {/if}

        <!-- Ordered lists -->
        {#if token.type === 'list-ordered'}
            <stackLayout class="{listSpacing || 'mb-3'}">
                {#each token.children || [] as item, itemIndex}
                    <gridLayout columns="auto, *" class="mb-1">
                        <label col="0" text="{itemIndex + 1}." class="text-slate-500 mr-2" color={textColorOverride} />
                        <label col="1" text={item.content} class="text-slate-700" textWrap={true} color={textColorOverride} />
                    </gridLayout>
                {/each}
            </stackLayout>
        {/if}

        <!-- Unordered lists -->
        {#if token.type === 'list-unordered'}
            <stackLayout class="{listSpacing || 'mb-3'}">
                {#each token.children || [] as item}
                    <gridLayout columns="auto, *" class="mb-1">
                        <label col="0" text="•" class="text-slate-500 mr-2" color={textColorOverride} />
                        <label col="1" text={item.content} class="text-slate-700" textWrap={true} color={textColorOverride} />
                    </gridLayout>
                {/each}
            </stackLayout>
        {/if}

        <!-- Tables -->
        {#if token.type === 'table'}
            <scrollView orientation="horizontal" class="{tableSpacing || 'mb-3'}">
                <stackLayout class="bg-white rounded-lg border border-slate-200">
                    {#each token.children || [] as row, rowIndex}
                        <gridLayout
                            columns={row.children?.map(() => '*').join(', ')}
                            class={rowIndex === 0 ? 'bg-slate-100' : ''}
                        >
                            {#each row.children || [] as cell, cellIndex}
                                <label
                                    col={cellIndex}
                                    text={cell.content}
                                    class="{rowIndex === 0 ? 'font-semibold ' : ''}p-2 text-sm text-slate-700"
                                />
                            {/each}
                        </gridLayout>
                    {/each}
                </stackLayout>
            </scrollView>
        {/if}

        <!-- Images -->
        {#if token.type === 'image'}
            <image
                src={getUrl(token)}
                class="rounded-lg {imageSpacing || 'mb-3'}"
                stretch="aspectFit"
            />
        {/if}

        <!-- Horizontal rules -->
        {#if token.type === 'horizontal-rule'}
            <stackLayout class="h-px bg-slate-200 {horizontalRuleSpacing || 'my-4'}" />
        {/if}

        <!-- Math blocks -->
        {#if token.type === 'math-block'}
            <label
                text={token.content}
                class="text-base text-slate-700 bg-slate-100 p-3 rounded-lg {mathBlockSpacing || 'mb-3'} font-mono"
                textWrap={true}
            />
        {/if}

        <!-- Mermaid diagrams -->
        {#if token.type === 'mermaid-block'}
            <MdMermaid
                content={token.content}
                darkMode={true}
            />
        {/if}
    {/each}

    <!-- Streaming caret -->
    {#if showCaret && isStreamingActive}
        <label text={caretChar} class="text-lg text-gray-400 animate-pulse" />
    {/if}
</stackLayout>

<script lang="ts">
    import { onDestroy } from 'svelte';
    import { parseMarkdown } from '@nstudio/nstreamdown';
    import type { MarkdownToken } from '@nstudio/nstreamdown';
    import MdMermaid from './MdMermaid.svelte';

    export interface StreamdownConfig {
        /** Mode: 'streaming' for real-time updates, 'static' for complete markdown */
        mode?: 'streaming' | 'static';
        /** Whether to show copy/download controls */
        controls?: boolean;
        /** Whether to animate the caret during streaming */
        showCaret?: boolean;
        /** Custom caret character */
        caret?: string;
        /** Override body text color for headings, paragraphs, lists, blockquotes (e.g. 'white', '#ffffff'). When not set, default theme colors apply. */
        textColor?: string;
        /** Override link text color (default: blue-600 / #2563eb) */
        linkColor?: string;
        /** Override inline code text color (default: pink-600 / #db2777) */
        codeInlineColor?: string;
        /** Override strikethrough text color (default: slate-400 / #94a3b8) */
        strikethroughColor?: string;
        /** Override inline math text color (default: blue-800 / #1e40af) */
        mathInlineColor?: string;
        /** Override paragraph spacing class (default: 'mb-3') */
        paragraphClass?: string;
        /** Override heading spacing class (default: 'mb-2') */
        headingClass?: string;
        /** Override list container spacing class (default: 'mb-3') */
        listClass?: string;
        /** Override blockquote spacing class (default: 'mb-3') */
        blockquoteClass?: string;
        /** Override code block spacing class (default: 'mb-3') */
        codeBlockClass?: string;
        /** Override image spacing class (default: 'mb-3') */
        imageClass?: string;
        /** Override horizontal rule spacing class (default: 'my-4') */
        horizontalRuleClass?: string;
        /** Override table spacing class (default: 'mb-3') */
        tableClass?: string;
        /** Override math block spacing class (default: 'mb-3') */
        mathBlockClass?: string;
    }

    // Props
    export let content: string = '';
    export let config: StreamdownConfig = {};

    // Internal state
    let markdown = '';
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingContent = '';
    let lastUpdateTime = 0;
    const THROTTLE_MS = 32;

    // Computed values
    $: mode = config?.mode || 'streaming';
    $: showCaret = config?.showCaret ?? true;
    $: caretChar = config?.caret || '▋';

    // Color overrides from config
    $: textColorOverride = config?.textColor || undefined;
    $: linkColorOverride = config?.linkColor || undefined;
    $: codeInlineColorOverride = config?.codeInlineColor || undefined;
    $: strikethroughColorOverride = config?.strikethroughColor || undefined;
    $: mathInlineColorOverride = config?.mathInlineColor || undefined;

    // Spacing overrides from config
    $: paragraphSpacing = config?.paragraphClass || undefined;
    $: headingSpacing = config?.headingClass || undefined;
    $: listSpacing = config?.listClass || undefined;
    $: blockquoteSpacing = config?.blockquoteClass || undefined;
    $: codeBlockSpacing = config?.codeBlockClass || undefined;
    $: imageSpacing = config?.imageClass || undefined;
    $: horizontalRuleSpacing = config?.horizontalRuleClass || undefined;
    $: tableSpacing = config?.tableClass || undefined;
    $: mathBlockSpacing = config?.mathBlockClass || undefined;

    // Parse tokens
    $: parsedResult = markdown ? parseMarkdown(markdown, mode === 'streaming') : { tokens: [], isComplete: true };
    $: tokens = parsedResult.tokens;
    $: isComplete = parsedResult.isComplete;
    $: isStreamingActive = mode === 'streaming' && !isComplete;

    // Watch content changes with throttling
    $: {
        const newContent = content;
        const currentMode = mode;

        if (currentMode === 'streaming') {
            pendingContent = newContent;
            const now = Date.now();
            const elapsed = now - lastUpdateTime;

            if (elapsed >= THROTTLE_MS) {
                lastUpdateTime = now;
                markdown = newContent;
            } else if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                    lastUpdateTime = Date.now();
                    markdown = pendingContent;
                }, THROTTLE_MS - elapsed);
            }
        } else {
            markdown = newContent;
        }
    }

    // Cleanup
    onDestroy(() => {
        if (throttleTimer) {
            clearTimeout(throttleTimer);
            throttleTimer = null;
        }
    });

    // Helper functions
    function isHeading(token: MarkdownToken): boolean {
        return token.type.startsWith('heading');
    }

    function getHeadingLevel(token: MarkdownToken): number {
        return parseInt(token.type.replace('heading', ''), 10) || 1;
    }

    function getLanguage(token: MarkdownToken): string {
        return (token.metadata?.['language'] as string) || '';
    }

    function getUrl(token: MarkdownToken): string {
        return (token.metadata?.['url'] as string) || '';
    }

    function getTokenKey(index: number, token: MarkdownToken): string {
        return `${index}-${token.type}-${token.content?.length || 0}`;
    }

    function getHeadingClass(level: number): string {
        const sizes: Record<number, string> = {
            1: 'text-3xl font-bold',
            2: 'text-2xl font-bold',
            3: 'text-xl font-semibold',
            4: 'text-lg font-semibold',
            5: 'text-base font-medium',
            6: 'text-sm font-medium'
        };
        return sizes[level] || sizes[1];
    }
</script>
