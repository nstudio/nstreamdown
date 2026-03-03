/**
 * MdMath Component
 * Renders mathematical expressions using LaTeX notation
 * Converts LaTeX to Unicode-based display for native iOS rendering
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, input, computed } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { copyToClipboard } from '@nstudio/nstreamdown';

@Component({
  selector: 'MdMath',
  template: `
    <!-- Inline math -->
    @if (!block()) {
      <Label [text]="renderedMath()" class="text-base text-blue-800 dark:text-blue-300 italic" [color]="color() || null"></Label>
    }

    <!-- Block math -->
    @if (block()) {
      <GridLayout class="rounded-xl border border-blue-200 dark:border-blue-800 my-3 overflow-hidden" rows="auto, auto">
        <!-- Controls -->
        <GridLayout row="0" columns="auto, *, auto" class="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-3 py-2">
          <Label col="0" text="∑ Math" class="text-xs text-blue-600 dark:text-blue-400 font-medium"></Label>
          <Label col="1"></Label>
          <Button col="2" [text]="copied() ? '✓ Copied' : 'Copy LaTeX'" class="text-xs text-blue-600 dark:text-blue-400 bg-transparent px-2 py-1 h-[25]" ignoreTouchAnimation="true" (tap)="onCopy()"></Button>
        </GridLayout>

        <!-- Math content -->
        <StackLayout row="1" class="bg-gradient-to-b from-blue-50 dark:from-slate-800 to-white dark:to-slate-900 p-5">
          <Label [text]="renderedMath()" class="text-xl text-gray-900 dark:text-gray-100 text-center font-medium" textWrap="true"></Label>
        </StackLayout>
      </GridLayout>
    }
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMath {
  content = input('');
  block = input(false);
  color = input('');

  copied = signal(false);

  renderedMath = computed(() => this.latexToUnicode(this.content()));

  /**
   * Convert LaTeX to readable text with Unicode math symbols
   * Provides rich Unicode rendering for common mathematical expressions
   */
  private latexToUnicode(latex: string): string {
    let result = latex.trim();

    // Greek letters (lowercase)
    const greekLower: Record<string, string> = {
      '\\alpha': 'α',
      '\\beta': 'β',
      '\\gamma': 'γ',
      '\\delta': 'δ',
      '\\epsilon': 'ε',
      '\\varepsilon': 'ε',
      '\\zeta': 'ζ',
      '\\eta': 'η',
      '\\theta': 'θ',
      '\\vartheta': 'ϑ',
      '\\iota': 'ι',
      '\\kappa': 'κ',
      '\\lambda': 'λ',
      '\\mu': 'μ',
      '\\nu': 'ν',
      '\\xi': 'ξ',
      '\\pi': 'π',
      '\\varpi': 'ϖ',
      '\\rho': 'ρ',
      '\\varrho': 'ϱ',
      '\\sigma': 'σ',
      '\\varsigma': 'ς',
      '\\tau': 'τ',
      '\\upsilon': 'υ',
      '\\phi': 'φ',
      '\\varphi': 'ϕ',
      '\\chi': 'χ',
      '\\psi': 'ψ',
      '\\omega': 'ω',
    };

    // Greek letters (uppercase)
    const greekUpper: Record<string, string> = {
      '\\Gamma': 'Γ',
      '\\Delta': 'Δ',
      '\\Theta': 'Θ',
      '\\Lambda': 'Λ',
      '\\Xi': 'Ξ',
      '\\Pi': 'Π',
      '\\Sigma': 'Σ',
      '\\Upsilon': 'Υ',
      '\\Phi': 'Φ',
      '\\Psi': 'Ψ',
      '\\Omega': 'Ω',
    };

    // Mathematical operators and symbols
    const mathSymbols: Record<string, string> = {
      '\\infty': '∞',
      '\\pm': '±',
      '\\mp': '∓',
      '\\times': '×',
      '\\div': '÷',
      '\\cdot': '·',
      '\\ast': '∗',
      '\\star': '⋆',
      '\\circ': '∘',
      '\\leq': '≤',
      '\\le': '≤',
      '\\geq': '≥',
      '\\ge': '≥',
      '\\neq': '≠',
      '\\ne': '≠',
      '\\approx': '≈',
      '\\simeq': '≃',
      '\\equiv': '≡',
      '\\cong': '≅',
      '\\propto': '∝',
      '\\ll': '≪',
      '\\gg': '≫',
      '\\prec': '≺',
      '\\succ': '≻',
      '\\sum': '∑',
      '\\prod': '∏',
      '\\coprod': '∐',
      '\\int': '∫',
      '\\oint': '∮',
      '\\iint': '∬',
      '\\iiint': '∭',
      '\\partial': '∂',
      '\\nabla': '∇',
      '\\prime': '′',
      '\\forall': '∀',
      '\\exists': '∃',
      '\\nexists': '∄',
      '\\in': '∈',
      '\\notin': '∉',
      '\\ni': '∋',
      '\\subset': '⊂',
      '\\supset': '⊃',
      '\\subseteq': '⊆',
      '\\supseteq': '⊇',
      '\\cup': '∪',
      '\\cap': '∩',
      '\\setminus': '∖',
      '\\emptyset': '∅',
      '\\varnothing': '∅',
      '\\land': '∧',
      '\\lor': '∨',
      '\\lnot': '¬',
      '\\neg': '¬',
      '\\rightarrow': '→',
      '\\to': '→',
      '\\leftarrow': '←',
      '\\gets': '←',
      '\\leftrightarrow': '↔',
      '\\uparrow': '↑',
      '\\downarrow': '↓',
      '\\Rightarrow': '⇒',
      '\\Leftarrow': '⇐',
      '\\Leftrightarrow': '⇔',
      '\\mapsto': '↦',
      '\\longmapsto': '⟼',
      '\\sqrt': '√',
      '\\surd': '√',
      '\\angle': '∠',
      '\\measuredangle': '∡',
      '\\sphericalangle': '∢',
      '\\perp': '⊥',
      '\\parallel': '∥',
      '\\triangle': '△',
      '\\square': '□',
      '\\diamond': '◇',
      '\\ldots': '…',
      '\\cdots': '⋯',
      '\\vdots': '⋮',
      '\\ddots': '⋱',
      '\\aleph': 'ℵ',
      '\\beth': 'ℶ',
      '\\hbar': 'ℏ',
      '\\ell': 'ℓ',
      '\\Re': 'ℜ',
      '\\Im': 'ℑ',
      '\\wp': '℘',
    };

    // Superscript digits and letters
    const superscripts: Record<string, string> = {
      '0': '⁰',
      '1': '¹',
      '2': '²',
      '3': '³',
      '4': '⁴',
      '5': '⁵',
      '6': '⁶',
      '7': '⁷',
      '8': '⁸',
      '9': '⁹',
      '+': '⁺',
      '-': '⁻',
      '=': '⁼',
      '(': '⁽',
      ')': '⁾',
      n: 'ⁿ',
      i: 'ⁱ',
      x: 'ˣ',
      y: 'ʸ',
    };

    // Subscript digits
    const subscripts: Record<string, string> = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
      '+': '₊',
      '-': '₋',
      '=': '₌',
      '(': '₍',
      ')': '₎',
      a: 'ₐ',
      e: 'ₑ',
      o: 'ₒ',
      x: 'ₓ',
      i: 'ᵢ',
      j: 'ⱼ',
      k: 'ₖ',
      n: 'ₙ',
      m: 'ₘ',
    };

    // Apply Greek letters
    for (const [tex, unicode] of Object.entries({ ...greekLower, ...greekUpper })) {
      result = result.replace(new RegExp(tex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g'), unicode);
    }

    // Apply math symbols
    for (const [tex, unicode] of Object.entries(mathSymbols)) {
      result = result.replace(new RegExp(tex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g'), unicode);
    }

    // Handle fractions: \frac{a}{b} -> ᵃ⁄ᵦ or (a)/(b)
    result = result.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) => {
      // Try to use Unicode fraction slash for simple cases
      if (num.length === 1 && den.length === 1) {
        const supNum = superscripts[num] || num;
        const subDen = subscripts[den] || den;
        return `${supNum}⁄${subDen}`;
      }
      return `(${num})/(${den})`;
    });

    // Handle superscripts: ^{...} or ^x
    result = result.replace(/\^{([^{}]+)}/g, (_, content) => {
      return content
        .split('')
        .map((c: string) => superscripts[c] || c)
        .join('');
    });
    result = result.replace(/\^([0-9n])/g, (_, c) => superscripts[c] || `^${c}`);

    // Handle subscripts: _{...} or _x
    result = result.replace(/_{([^{}]+)}/g, (_, content) => {
      return content
        .split('')
        .map((c: string) => subscripts[c] || c)
        .join('');
    });
    result = result.replace(/_([0-9])/g, (_, c) => subscripts[c] || `_${c}`);

    // Handle square roots
    result = result.replace(/√{([^{}]+)}/g, '√($1)');
    result = result.replace(/\\sqrt{([^{}]+)}/g, '√($1)');
    result = result.replace(/\\sqrt\[([^\]]+)\]{([^{}]+)}/g, '$1√($2)');

    // Handle text commands
    result = result.replace(/\\text{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathrm{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathbf{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathit{([^{}]+)}/g, '$1');
    result = result.replace(/\\mathbb{([^{}]+)}/g, (_, c) => {
      // Double-struck letters for common sets
      const bb: Record<string, string> = {
        N: 'ℕ',
        Z: 'ℤ',
        Q: 'ℚ',
        R: 'ℝ',
        C: 'ℂ',
      };
      return bb[c] || c;
    });

    // Handle limits, sin, cos, etc.
    result = result.replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|exp|lim|max|min|sup|inf|det|dim|ker|deg)(?![a-zA-Z])/g, '$1');

    // Remove leftover LaTeX commands
    result = result.replace(/\\(left|right|big|Big|bigg|Bigg|,|;|:|!|\s)/g, '');
    result = result.replace(/\\[a-zA-Z]+/g, '');

    // Clean up braces
    result = result.replace(/[{}]/g, '');

    // Clean up extra whitespace
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  onCopy() {
    if (copyToClipboard(this.content())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
