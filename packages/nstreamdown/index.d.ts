/**
 * NativeScript Streamdown Type Definitions
 */

// Export core library types
export * from './lib';

// Export native views
export * from './views';

// Export utilities
export * from './utils';

export declare class WKScriptMessageHandlerImpl {
  // used with mermaid component on iOS
  static new(): WKScriptMessageHandlerImpl;
  callback: ((message: any) => void) | null;
}

export declare class RoundedOutlineProvider {
  // used with mermaid component on Android for rounded corners
  constructor(radius: number);
}
