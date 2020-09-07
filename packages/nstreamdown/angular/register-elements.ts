/**
 * Register custom NativeScript views for Angular
 * This file should be imported in main.ts to register all custom elements
 */
import { registerElement } from '@nativescript/angular';
import { NativeCodeView } from '@nstudio/nstreamdown';

// Register custom views
export function registerStreamdownElements(): void {
  registerElement('NativeCodeView', () => NativeCodeView);
}
