import { Application } from '@nativescript/core';
import { render } from '@nativescript-community/solid-js';
import { registerElement } from 'dominative';
import { NativeCodeView } from '@nstudio/nstreamdown';

import { App } from './app.jsx';

// Register streamdown elements
registerElement('nativeCodeView', NativeCodeView);

document.body.actionBarHidden = false;
render(App, document.body);

const create = () => document;

Application.run({ create });
