/**
 * NativeRichText Component
 * Uses native iOS NSAttributedString for proper rich text rendering
 * This provides better inline formatting support than Label with spans
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, input, computed, effect } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { Label } from '@nativescript/core';
import { MarkdownToken, parseInlineFormatting } from '@nstudio/nstreamdown';
import { lightTheme, darkTheme, StreamdownTheme } from '@nstudio/nstreamdown';

@Component({
  selector: 'NativeRichText',
  template: ` <Label #label textWrap="true" [class]="containerClass()"></Label> `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeRichText implements AfterViewInit {
  @ViewChild('label') labelRef!: ElementRef<Label>;

  text = input('');
  tokens = input<MarkdownToken[]>([]);
  containerClass = input('');
  baseFontSize = input(16);
  darkMode = input(false);

  private label: Label | null = null;

  displayTokens = computed(() => {
    const t = this.tokens();
    if (t.length > 0) return t;
    const txt = this.text();
    return txt ? parseInlineFormatting(txt) : [];
  });

  theme = computed(() => (this.darkMode() ? darkTheme : lightTheme));

  constructor() {
    effect(() => {
      // Subscribe to all relevant signals
      this.displayTokens();
      this.theme();
      this.baseFontSize();
      // Update attributed text when any of these change
      this.updateAttributedText();
    });
  }

  ngAfterViewInit() {
    this.label = this.labelRef?.nativeElement;
    this.updateAttributedText();
  }

  private updateAttributedText() {
    if (!this.label || !global.isIOS) {
      // Fallback for non-iOS or if label not ready
      if (this.label) {
        this.label.text =
          this.text() ||
          this.displayTokens()
            .map((t) => t.content)
            .join('');
      }
      return;
    }

    const nativeLabel = (this.label as any).ios;
    if (!nativeLabel) return;

    const attributedString = NSMutableAttributedString.alloc().init();

    for (const token of this.displayTokens()) {
      const tokenAttrString = this.createAttributedStringForToken(token);
      attributedString.appendAttributedString(tokenAttrString);
    }

    nativeLabel.attributedText = attributedString;
  }

  private createAttributedStringForToken(token: MarkdownToken): any {
    const text = token.content;
    const attributes = NSMutableDictionary.alloc().init();

    // Base font
    let font: any = UIFont.systemFontOfSize(this.baseFontSize());

    // Text color
    const textColor = this.uiColorFromColor(this.theme().textPrimary);
    attributes.setObjectForKey(textColor, NSForegroundColorAttributeName);

    const fontSize = this.baseFontSize();
    const currentTheme = this.theme();

    switch (token.type) {
      case 'bold':
        font = UIFont.boldSystemFontOfSize(fontSize);
        break;

      case 'italic':
        font = UIFont.italicSystemFontOfSize(fontSize);
        break;

      case 'bold-italic':
        // iOS doesn't have a built-in bold-italic, use font descriptor
        const boldItalicDescriptor = UIFont.systemFontOfSize(fontSize).fontDescriptor.fontDescriptorWithSymbolicTraits(UIFontDescriptorSymbolicTraits.TraitBold | UIFontDescriptorSymbolicTraits.TraitItalic);
        if (boldItalicDescriptor) {
          font = UIFont.fontWithDescriptorSize(boldItalicDescriptor, fontSize);
        }
        break;

      case 'code-inline':
        font = UIFont.monospacedSystemFontOfSizeWeight(fontSize - 1, UIFontWeightRegular);
        const codeBgColor = this.uiColorFromColor(currentTheme.bgCode);
        attributes.setObjectForKey(codeBgColor, NSBackgroundColorAttributeName);
        const codeTextColor = this.uiColorFromColor(currentTheme.accentPrimary);
        attributes.setObjectForKey(codeTextColor, NSForegroundColorAttributeName);
        break;

      case 'strikethrough':
        attributes.setObjectForKey(NSUnderlineStyle.Single, NSStrikethroughStyleAttributeName);
        const strikeColor = this.uiColorFromColor(currentTheme.textMuted);
        attributes.setObjectForKey(strikeColor, NSForegroundColorAttributeName);
        break;

      case 'link':
        const linkColor = this.uiColorFromColor(currentTheme.accentLink);
        attributes.setObjectForKey(linkColor, NSForegroundColorAttributeName);
        attributes.setObjectForKey(NSUnderlineStyle.Single, NSUnderlineStyleAttributeName);
        // Store URL for tap handling
        if (token.metadata?.['url']) {
          const url = NSURL.URLWithString(token.metadata['url'] as string);
          if (url) {
            attributes.setObjectForKey(url, NSLinkAttributeName);
          }
        }
        break;

      case 'math-inline':
        font = UIFont.monospacedSystemFontOfSizeWeight(fontSize, UIFontWeightRegular);
        const mathColor = UIColor.systemPurpleColor;
        attributes.setObjectForKey(mathColor, NSForegroundColorAttributeName);
        break;

      default:
        // Plain text - use defaults
        break;
    }

    attributes.setObjectForKey(font, NSFontAttributeName);

    return NSAttributedString.alloc().initWithStringAttributes(text, attributes as NSDictionary<string, any>);
  }

  private uiColorFromColor(color: { r: number; g: number; b: number; a: number }): any {
    return UIColor.colorWithRedGreenBlueAlpha(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
  }
}
