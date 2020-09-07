/**
 * Register custom NativeScript views for Solid
 * This file should be imported in app.js to register all custom elements
 */
import { registerElement } from 'dominative';
import { NativeCodeView } from '@nstudio/nstreamdown';

// Register custom views
export function registerStreamdownElements(): void {
  registerElement('nativeCodeView', NativeCodeView);
}
