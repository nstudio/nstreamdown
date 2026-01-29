/**
 * Markdown Parser for NativeScript Streamdown
 * Handles parsing markdown into tokens and managing incomplete streaming markdown
 */

export type MarkdownTokenType = 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6' | 'paragraph' | 'code-block' | 'code-inline' | 'blockquote' | 'list-ordered' | 'list-unordered' | 'list-item' | 'table' | 'table-row' | 'table-cell' | 'horizontal-rule' | 'link' | 'image' | 'bold' | 'italic' | 'bold-italic' | 'strikethrough' | 'math-inline' | 'math-block' | 'mermaid' | 'text';

export interface MarkdownToken {
  type: MarkdownTokenType;
  raw: string;
  content: string;
  children?: MarkdownToken[];
  metadata?: Record<string, unknown>;
}

export interface ParsedMarkdown {
  tokens: MarkdownToken[];
  isComplete: boolean;
}

// Regex patterns for parsing
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const CODE_BLOCK_PATTERN = /^```(\w*)$/;
const CODE_BLOCK_END_PATTERN = /^```$/;
const BLOCKQUOTE_PATTERN = /^>\s*(.*)$/;
const ORDERED_LIST_PATTERN = /^(\d+)\.\s+(.*)$/;
const UNORDERED_LIST_PATTERN = /^[-*+]\s+(.*)$/;
const HORIZONTAL_RULE_PATTERN = /^(?:[-*_]){3,}$/;
const TABLE_SEPARATOR_PATTERN = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;
const TABLE_ROW_PATTERN = /^\|(.+)\|$/;
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD_PATTERN = /\*\*([^*]+)\*\*|__([^_]+)__/g;
const ITALIC_PATTERN = /\*([^*]+)\*|_([^_]+)_/g;
const BOLD_ITALIC_PATTERN = /\*\*\*([^*]+)\*\*\*|___([^_]+)___/g;
const STRIKETHROUGH_PATTERN = /~~([^~]+)~~/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;
const MATH_BLOCK_PATTERN = /^\$\$(.*)$/;
const MATH_INLINE_PATTERN = /\$([^$]+)\$/g;

// Pre-compiled inline formatting pattern (moved outside function for efficiency)
// Using simpler patterns without lookbehind for better V8 performance
const INLINE_BOLD_ITALIC_PATTERN = /\*\*\*([^*]+)\*\*\*|___([^_]+)___/g;
const INLINE_BOLD_PATTERN = /\*\*([^*]+)\*\*|__([^_]+)__/g;
const INLINE_ITALIC_PATTERN_STAR = /(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/g;
const INLINE_ITALIC_PATTERN_UNDER = /(?:^|[^_])_([^_]+)_(?:[^_]|$)/g;
const INLINE_STRIKETHROUGH = /~~([^~]+)~~/g;
const INLINE_CODE = /`([^`]+)`/g;
const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const INLINE_IMAGE = /!\[([^\]]*)\]\(([^)]+)\)/g;
const INLINE_MATH = /\$([^$\n]+)\$/g;

/**
 * Handle incomplete markdown tokens during streaming
 * Simplified to avoid expensive regex with lookbehind
 * Now aware of code block context to avoid incorrect completions
 */
export function remend(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text.endsWith(' ') && !text.endsWith('  ') ? text.slice(0, -1) : text;

  // Check if we're inside an unclosed code block
  // Count ``` occurrences (must be at line start or after whitespace for code blocks)
  const codeBlockMarkers = result.split('\n').filter((line) => line.trim().startsWith('```')).length;
  const inCodeBlock = codeBlockMarkers % 2 !== 0;

  // If inside a code block, don't try to complete inline formatting
  // The code block itself will be handled by the parser
  if (inCodeBlock) {
    return result;
  }

  // Handle incomplete bold (**text) - only on last line to avoid false positives
  const lines = result.split('\n');
  const lastLine = lines[lines.length - 1];

  // Count ** pairs on last line only
  let doubleStarCount = 0;
  for (let i = 0; i < lastLine.length - 1; i++) {
    if (lastLine[i] === '*' && lastLine[i + 1] === '*') {
      // Make sure it's not *** (bold-italic)
      const prevIsStar = i > 0 && lastLine[i - 1] === '*';
      const nextIsStar = i + 2 < lastLine.length && lastLine[i + 2] === '*';
      if (!prevIsStar && !nextIsStar) {
        doubleStarCount++;
        i++; // Skip the second *
      }
    }
  }
  if (doubleStarCount % 2 !== 0) {
    result = result + '**';
  }

  // Handle incomplete inline code (`code) - only on last line
  let backtickCount = 0;
  for (const char of lastLine) {
    if (char === '`') backtickCount++;
  }
  if (backtickCount % 2 !== 0) {
    result = result + '`';
  }

  // Handle incomplete strikethrough (~~text) - only on last line
  let doubleTildeCount = 0;
  for (let i = 0; i < lastLine.length - 1; i++) {
    if (lastLine[i] === '~' && lastLine[i + 1] === '~') {
      doubleTildeCount++;
      i++;
    }
  }
  if (doubleTildeCount % 2 !== 0) {
    result = result + '~~';
  }

  // Handle incomplete link [text](url - only on last line
  const lastOpenBracket = lastLine.lastIndexOf('[');
  if (lastOpenBracket !== -1) {
    const afterBracket = lastLine.slice(lastOpenBracket);
    if (afterBracket.includes('](') && !afterBracket.includes(')')) {
      result = result + ')';
    } else if (!afterBracket.includes(']')) {
      // Don't add fake link - just leave it incomplete
    }
  }

  // Handle incomplete math block
  const mathBlockMarkers = (result.match(/^\$\$|(?<=\n)\$\$/g) || []).length;
  if (mathBlockMarkers % 2 !== 0) {
    result = result + '$$';
  }

  // Handle incomplete inline math on last line (single $)
  let singleDollarCount = 0;
  for (let i = 0; i < lastLine.length; i++) {
    if (lastLine[i] === '$') {
      const prevIsDollar = i > 0 && lastLine[i - 1] === '$';
      const nextIsDollar = i < lastLine.length - 1 && lastLine[i + 1] === '$';
      if (!prevIsDollar && !nextIsDollar) {
        singleDollarCount++;
      }
    }
  }
  if (singleDollarCount % 2 !== 0) {
    result = result + '$';
  }

  return result;
}

/**
 * Parse inline formatting within text
 * Simplified version for better performance - avoids complex regex
 */
export function parseInlineFormatting(text: string): MarkdownToken[] {
  if (!text || text.length === 0) {
    return [];
  }

  // For short text with no special chars, return as-is
  if (text.length < 3 || !/[*_`~\[$]/.test(text)) {
    return [{ type: 'text', raw: text, content: text }];
  }

  const tokens: MarkdownToken[] = [];

  // Find all matches and their positions
  interface Match {
    start: number;
    end: number;
    type: MarkdownTokenType;
    content: string;
    raw: string;
    metadata?: Record<string, unknown>;
  }

  const matches: Match[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex before each use
  INLINE_BOLD_ITALIC_PATTERN.lastIndex = 0;
  while ((match = INLINE_BOLD_ITALIC_PATTERN.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'bold-italic',
      content: match[1] || match[2],
      raw: match[0],
    });
  }

  INLINE_BOLD_PATTERN.lastIndex = 0;
  while ((match = INLINE_BOLD_PATTERN.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'bold',
      content: match[1] || match[2],
      raw: match[0],
    });
  }

  // Handle italic with * (must be after bold to avoid conflicts)
  INLINE_ITALIC_PATTERN_STAR.lastIndex = 0;
  while ((match = INLINE_ITALIC_PATTERN_STAR.exec(text)) !== null) {
    // The regex includes context chars, so we need to adjust the actual match position
    const fullMatch = match[0];
    const content = match[1];
    // Find where the actual *content* starts within the full match
    const starIndex = fullMatch.indexOf('*');
    const actualStart = match.index + starIndex;
    const actualEnd = actualStart + content.length + 2; // +2 for the surrounding *
    matches.push({
      start: actualStart,
      end: actualEnd,
      type: 'italic',
      content: content,
      raw: '*' + content + '*',
    });
    // Move lastIndex back to handle overlapping context
    INLINE_ITALIC_PATTERN_STAR.lastIndex = match.index + 1;
  }

  // Handle italic with _ (must be after bold to avoid conflicts)
  INLINE_ITALIC_PATTERN_UNDER.lastIndex = 0;
  while ((match = INLINE_ITALIC_PATTERN_UNDER.exec(text)) !== null) {
    // The regex includes context chars, so we need to adjust the actual match position
    const fullMatch = match[0];
    const content = match[1];
    // Find where the actual _content_ starts within the full match
    const underIndex = fullMatch.indexOf('_');
    const actualStart = match.index + underIndex;
    const actualEnd = actualStart + content.length + 2; // +2 for the surrounding _
    matches.push({
      start: actualStart,
      end: actualEnd,
      type: 'italic',
      content: content,
      raw: '_' + content + '_',
    });
    // Move lastIndex back to handle overlapping context
    INLINE_ITALIC_PATTERN_UNDER.lastIndex = match.index + 1;
  }

  INLINE_STRIKETHROUGH.lastIndex = 0;
  while ((match = INLINE_STRIKETHROUGH.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'strikethrough',
      content: match[1],
      raw: match[0],
    });
  }

  INLINE_CODE.lastIndex = 0;
  while ((match = INLINE_CODE.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'code-inline',
      content: match[1],
      raw: match[0],
    });
  }

  INLINE_IMAGE.lastIndex = 0;
  while ((match = INLINE_IMAGE.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'image',
      content: match[1] || '',
      raw: match[0],
      metadata: { url: match[2] },
    });
  }

  INLINE_LINK.lastIndex = 0;
  while ((match = INLINE_LINK.exec(text)) !== null) {
    // Skip if this is part of an image (starts with !)
    if (match.index > 0 && text[match.index - 1] === '!') continue;
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'link',
      content: match[1],
      raw: match[0],
      metadata: { url: match[2] },
    });
  }

  INLINE_MATH.lastIndex = 0;
  while ((match = INLINE_MATH.exec(text)) !== null) {
    // Skip if this looks like $$ (math block)
    if ((match.index > 0 && text[match.index - 1] === '$') || (match.index + match[0].length < text.length && text[match.index + match[0].length] === '$')) {
      continue;
    }
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'math-inline',
      content: match[1],
      raw: match[0],
    });
  }

  // If no matches, return text as-is
  if (matches.length === 0) {
    return [{ type: 'text', raw: text, content: text }];
  }

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep earlier/longer ones)
  const filteredMatches: Match[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filteredMatches.push(m);
      lastEnd = m.end;
    }
  }

  // Build tokens array
  let pos = 0;
  for (const m of filteredMatches) {
    // Add text before this match
    if (m.start > pos) {
      tokens.push({
        type: 'text',
        raw: text.slice(pos, m.start),
        content: text.slice(pos, m.start),
      });
    }

    // Add the matched token
    tokens.push({
      type: m.type,
      raw: m.raw,
      content: m.content,
      metadata: m.metadata,
    });

    pos = m.end;
  }

  // Add remaining text
  if (pos < text.length) {
    tokens.push({
      type: 'text',
      raw: text.slice(pos),
      content: text.slice(pos),
    });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', raw: text, content: text }];
}

/**
 * Parse markdown text into tokens
 */
export function parseMarkdown(markdown: string, isStreaming = true): ParsedMarkdown {
  // Apply remend for streaming content
  const processedMarkdown = isStreaming ? remend(markdown) : markdown;

  const lines = processedMarkdown.split('\n');
  const tokens: MarkdownToken[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent = '';
  let inTable = false;
  let tableRows: MarkdownToken[] = [];
  let inMathBlock = false;
  let mathBlockContent = '';

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (CODE_BLOCK_PATTERN.test(trimmedLine)) {
      if (inCodeBlock) {
        // End of code block - check if it's a mermaid diagram
        const isMermaid = codeBlockLanguage.toLowerCase() === 'mermaid';
        tokens.push({
          type: isMermaid ? 'mermaid' : 'code-block',
          raw: codeBlockContent,
          content: codeBlockContent,
          metadata: { language: codeBlockLanguage },
        });
        inCodeBlock = false;
        codeBlockContent = '';
        codeBlockLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        const match = trimmedLine.match(CODE_BLOCK_PATTERN);
        codeBlockLanguage = match ? match[1] : '';
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line;
      i++;
      continue;
    }

    // Handle math blocks ($$...$$)
    if (trimmedLine === '$$' || trimmedLine.startsWith('$$')) {
      if (inMathBlock) {
        // End of math block - check if line ends with $$ or is just $$
        if (trimmedLine === '$$') {
          tokens.push({
            type: 'math-block',
            raw: mathBlockContent,
            content: mathBlockContent.trim(),
          });
          inMathBlock = false;
          mathBlockContent = '';
        } else if (trimmedLine.endsWith('$$')) {
          // Content ends with $$ on same line
          mathBlockContent += (mathBlockContent ? '\n' : '') + trimmedLine.slice(0, -2);
          tokens.push({
            type: 'math-block',
            raw: mathBlockContent,
            content: mathBlockContent.trim(),
          });
          inMathBlock = false;
          mathBlockContent = '';
        } else {
          // Continue math block
          mathBlockContent += (mathBlockContent ? '\n' : '') + trimmedLine;
        }
      } else {
        // Start of math block
        if (trimmedLine.length > 4 && trimmedLine.startsWith('$$') && trimmedLine.endsWith('$$')) {
          // Single line math block: $$ content $$
          tokens.push({
            type: 'math-block',
            raw: trimmedLine,
            content: trimmedLine.slice(2, -2).trim(),
          });
        } else if (trimmedLine === '$$') {
          // Start of multi-line math block
          inMathBlock = true;
          mathBlockContent = '';
        } else {
          // $$ followed by content on same line
          inMathBlock = true;
          mathBlockContent = trimmedLine.slice(2).trim();
        }
      }
      i++;
      continue;
    }

    if (inMathBlock) {
      // Check for ending $$
      if (trimmedLine.endsWith('$$')) {
        mathBlockContent += (mathBlockContent ? '\n' : '') + trimmedLine.slice(0, -2);
        tokens.push({
          type: 'math-block',
          raw: mathBlockContent,
          content: mathBlockContent.trim(),
        });
        inMathBlock = false;
        mathBlockContent = '';
      } else {
        mathBlockContent += (mathBlockContent ? '\n' : '') + line;
      }
      i++;
      continue;
    }

    // Handle horizontal rule
    if (HORIZONTAL_RULE_PATTERN.test(trimmedLine)) {
      tokens.push({
        type: 'horizontal-rule',
        raw: line,
        content: '',
      });
      i++;
      continue;
    }

    // Handle headings
    const headingMatch = trimmedLine.match(HEADING_PATTERN);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const headingType = `heading${level}` as MarkdownTokenType;
      tokens.push({
        type: headingType,
        raw: line,
        content: headingMatch[2],
        children: parseInlineFormatting(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Handle blockquotes
    const blockquoteMatch = trimmedLine.match(BLOCKQUOTE_PATTERN);
    if (blockquoteMatch) {
      const content = blockquoteMatch[1];
      tokens.push({
        type: 'blockquote',
        raw: line,
        content: content,
        children: parseInlineFormatting(content),
      });
      i++;
      continue;
    }

    // Handle ordered lists
    const orderedListMatch = trimmedLine.match(ORDERED_LIST_PATTERN);
    if (orderedListMatch) {
      const listItems: MarkdownToken[] = [];
      while (i < lines.length && ORDERED_LIST_PATTERN.test(lines[i].trim())) {
        const itemMatch = lines[i].trim().match(ORDERED_LIST_PATTERN);
        if (itemMatch) {
          listItems.push({
            type: 'list-item',
            raw: lines[i],
            content: itemMatch[2],
            children: parseInlineFormatting(itemMatch[2]),
            metadata: { number: parseInt(itemMatch[1], 10) },
          });
        }
        i++;
      }
      tokens.push({
        type: 'list-ordered',
        raw: listItems.map((item) => item.raw).join('\n'),
        content: '',
        children: listItems,
      });
      continue;
    }

    // Handle unordered lists (including task lists)
    const unorderedListMatch = trimmedLine.match(UNORDERED_LIST_PATTERN);
    if (unorderedListMatch) {
      const listItems: MarkdownToken[] = [];
      while (i < lines.length && UNORDERED_LIST_PATTERN.test(lines[i].trim())) {
        const itemMatch = lines[i].trim().match(UNORDERED_LIST_PATTERN);
        if (itemMatch) {
          let itemContent = itemMatch[1];
          let isTask = false;
          let isChecked = false;

          // Check for task list syntax: [x] or [ ]
          const taskMatch = itemContent.match(/^\[([ xX])\]\s*(.*)/);
          if (taskMatch) {
            isTask = true;
            isChecked = taskMatch[1].toLowerCase() === 'x';
            itemContent = taskMatch[2];
          }

          listItems.push({
            type: 'list-item',
            raw: lines[i],
            content: itemContent,
            children: parseInlineFormatting(itemContent),
            metadata: {
              isTask,
              isChecked,
            },
          });
        }
        i++;
      }
      tokens.push({
        type: 'list-unordered',
        raw: listItems.map((item) => item.raw).join('\n'),
        content: '',
        children: listItems,
      });
      continue;
    }

    // Handle tables
    if (TABLE_ROW_PATTERN.test(trimmedLine)) {
      // Check if next line is a separator (for table header)
      if (i + 1 < lines.length && TABLE_SEPARATOR_PATTERN.test(lines[i + 1].trim())) {
        // This is a table
        const headerCells = trimmedLine
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim());
        const headerRow: MarkdownToken = {
          type: 'table-row',
          raw: line,
          content: '',
          children: headerCells.map((cell) => ({
            type: 'table-cell' as MarkdownTokenType,
            raw: cell,
            content: cell,
            children: parseInlineFormatting(cell),
            metadata: { isHeader: true },
          })),
          metadata: { isHeader: true },
        };

        tableRows = [headerRow];
        i += 2; // Skip header and separator

        // Parse remaining rows
        while (i < lines.length && TABLE_ROW_PATTERN.test(lines[i].trim())) {
          const rowLine = lines[i].trim();
          const cells = rowLine
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim());
          tableRows.push({
            type: 'table-row',
            raw: lines[i],
            content: '',
            children: cells.map((cell) => ({
              type: 'table-cell' as MarkdownTokenType,
              raw: cell,
              content: cell,
              children: parseInlineFormatting(cell),
              metadata: { isHeader: false },
            })),
            metadata: { isHeader: false },
          });
          i++;
        }

        tokens.push({
          type: 'table',
          raw: tableRows.map((row) => row.raw).join('\n'),
          content: '',
          children: tableRows,
        });
        tableRows = [];
        continue;
      }
    }

    // Handle empty lines
    if (trimmedLine === '') {
      i++;
      continue;
    }

    // Handle standalone images (line contains only an image)
    const standaloneImageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (standaloneImageMatch) {
      tokens.push({
        type: 'image',
        raw: line,
        content: standaloneImageMatch[1] || '',
        metadata: { url: standaloneImageMatch[2] },
      });
      i++;
      continue;
    }

    // Default: paragraph
    tokens.push({
      type: 'paragraph',
      raw: line,
      content: trimmedLine,
      children: parseInlineFormatting(trimmedLine),
    });
    i++;
  }

  // Handle unclosed code blocks
  if (inCodeBlock) {
    tokens.push({
      type: 'code-block',
      raw: codeBlockContent,
      content: codeBlockContent,
      metadata: { language: codeBlockLanguage, isIncomplete: true },
    });
  }

  // Handle unclosed math blocks
  if (inMathBlock) {
    tokens.push({
      type: 'math-block',
      raw: mathBlockContent,
      content: mathBlockContent,
      metadata: { isIncomplete: true },
    });
  }

  return {
    tokens,
    isComplete: !inCodeBlock && !inMathBlock,
  };
}

/**
 * Parse markdown into renderable blocks
 */
export function parseMarkdownIntoBlocks(markdown: string): string[] {
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let currentBlock = '';
  let inCodeBlock = false;
  let inMathBlock = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        currentBlock += '\n' + line;
        blocks.push(currentBlock);
        currentBlock = '';
        inCodeBlock = false;
      } else {
        if (currentBlock.trim()) {
          blocks.push(currentBlock);
        }
        currentBlock = line;
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      currentBlock += '\n' + line;
      continue;
    }

    // Handle math blocks
    if (trimmedLine.startsWith('$$')) {
      if (inMathBlock) {
        currentBlock += '\n' + line;
        blocks.push(currentBlock);
        currentBlock = '';
        inMathBlock = false;
      } else {
        if (currentBlock.trim()) {
          blocks.push(currentBlock);
        }
        currentBlock = line;
        inMathBlock = true;
      }
      continue;
    }

    if (inMathBlock) {
      currentBlock += '\n' + line;
      continue;
    }

    // Handle empty lines as block separators
    if (trimmedLine === '') {
      if (currentBlock.trim()) {
        blocks.push(currentBlock);
        currentBlock = '';
      }
      continue;
    }

    // Add to current block
    if (currentBlock) {
      currentBlock += '\n' + line;
    } else {
      currentBlock = line;
    }
  }

  // Add remaining content
  if (currentBlock.trim()) {
    blocks.push(currentBlock);
  }

  return blocks;
}
