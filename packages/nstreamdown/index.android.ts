/**
 * NativeScript Streamdown - Android Implementation
 */

// Re-export everything from common
export * from './common';

export class WKScriptMessageHandlerImpl {
  // mermaid stub helper
}

@NativeClass()
export class RoundedOutlineProvider extends android.view.ViewOutlineProvider {
  private radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
    return global.__native(this);
  }

  getOutline(view: android.view.View, outline: android.graphics.Outline): void {
    outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), this.radius);
  }
}
