import { describe, it, expect } from 'vitest';
import { parseInlineFormatting, parseMarkdown, remend } from './markdown-parser';

describe('parseInlineFormatting', () => {
  describe('italic text', () => {
    it('should parse *italic* with asterisks', () => {
      const tokens = parseInlineFormatting('This is *italic* text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'italic', raw: '*italic*', content: 'italic' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });

    it('should parse _italic_ with underscores', () => {
      const tokens = parseInlineFormatting('This is _italic_ text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'italic', raw: '_italic_', content: 'italic' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });

    it('should parse italic at the beginning of text', () => {
      const tokens = parseInlineFormatting('*italic* at start');
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'italic', raw: '*italic*', content: 'italic' });
      expect(tokens[1]).toEqual({ type: 'text', raw: ' at start', content: ' at start' });
    });

    it('should parse italic at the end of text', () => {
      const tokens = parseInlineFormatting('ends with *italic*');
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'ends with ', content: 'ends with ' });
      expect(tokens[1]).toEqual({ type: 'italic', raw: '*italic*', content: 'italic' });
    });

    it('should parse multiple italic sections', () => {
      const tokens = parseInlineFormatting('*one* and *two*');
      // After punctuation merging, " and " gets merged with first italic
      // so we have: italic("one and "), italic("two")
      // Actually, punctuation merging only affects punctuation, not words
      // Let's check actual output
      expect(tokens.length).toBeGreaterThanOrEqual(2);
      expect(tokens[0].type).toBe('italic');
      expect(tokens[0].content).toBe('one');
      // The last token should be italic "two"
      const lastItalic = tokens.find((t, i) => t.type === 'italic' && i > 0);
      expect(lastItalic?.content).toBe('two');
    });

    it('should not confuse italic with bold', () => {
      const tokens = parseInlineFormatting('**bold** and *italic*');
      // Check we have both bold and italic
      expect(tokens.some((t) => t.type === 'bold')).toBe(true);
      expect(tokens.some((t) => t.type === 'italic')).toBe(true);
      expect(tokens[0].type).toBe('bold');
      expect(tokens[0].content).toBe('bold');
      const italicToken = tokens.find((t) => t.type === 'italic');
      expect(italicToken?.content).toBe('italic');
    });
  });

  describe('bold text', () => {
    it('should parse **bold** with double asterisks', () => {
      const tokens = parseInlineFormatting('This is **bold** text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'bold', raw: '**bold**', content: 'bold' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });

    it('should parse __bold__ with double underscores', () => {
      const tokens = parseInlineFormatting('This is __bold__ text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'bold', raw: '__bold__', content: 'bold' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });
  });

  describe('bold-italic text', () => {
    it('should parse ***bold-italic*** with triple asterisks', () => {
      const tokens = parseInlineFormatting('This is ***bold-italic*** text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'bold-italic', raw: '***bold-italic***', content: 'bold-italic' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });
  });

  describe('punctuation merging after links', () => {
    it('should merge comma and space with preceding link', () => {
      const tokens = parseInlineFormatting('Visit [streamdown.ai](https://streamdown.ai), designed for streaming');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Visit ', content: 'Visit ' });
      expect(tokens[1].type).toBe('link');
      // Comma and space are merged with link to prevent line break issues
      expect(tokens[1].content).toBe('streamdown.ai, ');
      expect(tokens[1].metadata?.url).toBe('https://streamdown.ai');
      expect(tokens[2]).toEqual({ type: 'text', raw: 'designed for streaming', content: 'designed for streaming' });
    });

    it('should merge period with preceding link', () => {
      const tokens = parseInlineFormatting('Check out [example](https://example.com).');
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Check out ', content: 'Check out ' });
      expect(tokens[1].type).toBe('link');
      expect(tokens[1].content).toBe('example.');
    });

    it('should merge multiple punctuation marks', () => {
      const tokens = parseInlineFormatting('See [link](https://example.com)!?');
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'See ', content: 'See ' });
      expect(tokens[1].type).toBe('link');
      expect(tokens[1].content).toBe('link!?');
    });

    it('should merge punctuation and space with preceding bold text', () => {
      const tokens = parseInlineFormatting('This is **important**, please note');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1].type).toBe('bold');
      // Comma and space are merged with bold to prevent line break issues
      expect(tokens[1].content).toBe('important, ');
      expect(tokens[2]).toEqual({ type: 'text', raw: 'please note', content: 'please note' });
    });

    it('should not merge space if no punctuation before it', () => {
      const tokens = parseInlineFormatting('Visit [site](https://site.com) and more');
      // No punctuation, so space stays with following text
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Visit ', content: 'Visit ' });
      expect(tokens[1].type).toBe('link');
      expect(tokens[1].content).toBe('site');
      expect(tokens[2]).toEqual({ type: 'text', raw: ' and more', content: ' and more' });
    });

    it('should merge punctuation but keep remaining text without leading space', () => {
      const tokens = parseInlineFormatting('Visit [site](https://site.com),no space');
      // "Visit " is text, then link with comma merged, then "no space" is text
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Visit ', content: 'Visit ' });
      expect(tokens[1].type).toBe('link');
      // Comma gets merged with link
      expect(tokens[1].content).toBe('site,');
      // Remaining text after punctuation
      expect(tokens[2]).toEqual({ type: 'text', raw: 'no space', content: 'no space' });
    });
  });

  describe('links', () => {
    it('should parse links', () => {
      const tokens = parseInlineFormatting('Click [here](https://example.com) to continue');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Click ', content: 'Click ' });
      expect(tokens[1].type).toBe('link');
      expect(tokens[1].content).toBe('here');
      expect(tokens[1].metadata?.url).toBe('https://example.com');
      expect(tokens[2]).toEqual({ type: 'text', raw: ' to continue', content: ' to continue' });
    });
  });

  describe('inline code', () => {
    it('should parse inline code', () => {
      const tokens = parseInlineFormatting('Use `console.log()` for debugging');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Use ', content: 'Use ' });
      expect(tokens[1]).toEqual({ type: 'code-inline', raw: '`console.log()`', content: 'console.log()' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' for debugging', content: ' for debugging' });
    });
  });

  describe('strikethrough', () => {
    it('should parse strikethrough text', () => {
      const tokens = parseInlineFormatting('This is ~~deleted~~ text');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'This is ', content: 'This is ' });
      expect(tokens[1]).toEqual({ type: 'strikethrough', raw: '~~deleted~~', content: 'deleted' });
      expect(tokens[2]).toEqual({ type: 'text', raw: ' text', content: ' text' });
    });
  });

  describe('mixed inline formatting', () => {
    it('should handle multiple different inline formats', () => {
      const tokens = parseInlineFormatting('**bold** and *italic* and `code`');
      // Check we have all three types
      expect(tokens.some((t) => t.type === 'bold')).toBe(true);
      expect(tokens.some((t) => t.type === 'italic')).toBe(true);
      expect(tokens.some((t) => t.type === 'code-inline')).toBe(true);
      // First token should be bold
      expect(tokens[0].type).toBe('bold');
      expect(tokens[0].content).toBe('bold');
    });

    it('should handle plain text without formatting', () => {
      const tokens = parseInlineFormatting('Just plain text');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({ type: 'text', raw: 'Just plain text', content: 'Just plain text' });
    });

    it('should handle empty string', () => {
      const tokens = parseInlineFormatting('');
      expect(tokens).toHaveLength(0);
    });
  });
});

describe('parseMarkdown', () => {
  describe('paragraphs with inline formatting', () => {
    it('should parse paragraph with italic text', () => {
      const result = parseMarkdown('This is *italic* text', false);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].type).toBe('paragraph');
      expect(result.tokens[0].children).toBeDefined();
      expect(result.tokens[0].children?.some((c) => c.type === 'italic')).toBe(true);
    });

    it('should parse paragraph with link followed by punctuation', () => {
      const result = parseMarkdown('Visit [site](https://site.com), it is great.', false);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].type).toBe('paragraph');
      const linkChild = result.tokens[0].children?.find((c) => c.type === 'link');
      expect(linkChild).toBeDefined();
      // Comma and space are merged with link to prevent line break issues
      expect(linkChild?.content).toBe('site, ');
    });
  });

  describe('headings', () => {
    it('should parse heading with inline formatting', () => {
      const result = parseMarkdown('# Hello *World*', false);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].type).toBe('heading1');
      expect(result.tokens[0].children?.some((c) => c.type === 'italic')).toBe(true);
    });
  });
});

describe('remend', () => {
  it('should complete unclosed bold markers', () => {
    const result = remend('This is **bold');
    expect(result).toBe('This is **bold**');
  });

  it('should complete unclosed inline code', () => {
    const result = remend('Use `code');
    expect(result).toBe('Use `code`');
  });

  it('should complete unclosed strikethrough', () => {
    const result = remend('This is ~~deleted');
    expect(result).toBe('This is ~~deleted~~');
  });

  it('should not modify complete markdown', () => {
    const result = remend('This is **bold** text');
    expect(result).toBe('This is **bold** text');
  });
});
