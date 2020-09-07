/**
 * Register custom NativeScript views for Vue
 * This file should be imported in app.ts to register all custom elements
 */
import { registerElement } from 'nativescript-vue';
import { NativeCodeView } from '@nstudio/nstreamdown';

// Register custom views
export function registerStreamdownElements(): void {
  registerElement('NativeCodeView', () => NativeCodeView);
}
