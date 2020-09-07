import * as React from 'react';
import { start, registerElement, NativeScriptProps, ViewAttributes } from 'react-nativescript';
import { NativeCodeView } from '@nstudio/nstreamdown';
import { App } from './components/App';

// In NativeScript, the app.ts file is the entry point to your application. You
// can use this file to perform app-level initialization, but the primary
// purpose of the file is to pass control to the app's first module.

// Controls react-nativescript log verbosity.
// - true: all logs;
// - false: only error logs.
Object.defineProperty(global, '__DEV__', { value: false });

// To use NativeCodeView within JSX
interface NativeCodeViewAttrs extends ViewAttributes {
  code: string;
  language: string;
}
declare global {
  module JSX {
    interface IntrinsicElements {
      nativeCodeView: NativeScriptProps<NativeCodeViewAttrs, NativeCodeView>;
    }
  }
}

registerElement('nativeCodeView', () => <any>NativeCodeView);

start(React.createElement(App, {}, null));

// Do not place any code after the application has been started as it will not
// be executed on iOS.
