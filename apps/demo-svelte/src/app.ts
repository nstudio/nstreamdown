/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app's first page.
*/

import { svelteNativeNoFrame } from '@nativescript-community/svelte-native';
import { NativeCodeView } from '@nstudio/nstreamdown';
import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import App from './App.svelte';

// Register streamdown elements
registerNativeViewElement('nativeCodeView', () => NativeCodeView);

svelteNativeNoFrame(App, {});
