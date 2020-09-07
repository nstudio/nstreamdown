/**
 * Register custom NativeScript views for React
 * This file should be imported in app.ts to register all custom elements
 */
import { registerElement } from 'react-nativescript';
import { NativeCodeView } from '@nstudio/nstreamdown';

// Register custom views
export function registerStreamdownElements(): void {
  registerElement('nativeCodeView', () => NativeCodeView as any);
}
