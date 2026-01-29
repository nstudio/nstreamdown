/**
 * NativeScript Streamdown - iOS Implementation
 */

// Re-export everything from common
export * from './common';

@NativeClass()
export class WKScriptMessageHandlerImpl extends NSObject {
  static ObjCProtocols = [WKScriptMessageHandler];
  callback: ((message: any) => void) | null = null;

  userContentControllerDidReceiveScriptMessage(userContentController: any, message: any): void {
    if (this.callback) {
      this.callback(message);
    }
  }
}

// Stub for Android-only class
export class RoundedOutlineProvider {
  constructor(radius: number) {}
}
