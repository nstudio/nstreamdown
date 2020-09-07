/**
 * Register custom NativeScript views for Svelte
 * This file should be imported in app.ts to register all custom elements
 */
import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { NativeCodeView } from '@nstudio/nstreamdown';

// Register custom views
export function registerStreamdownElements(): void {
  registerNativeViewElement('nativeCodeView', () => NativeCodeView);
}
