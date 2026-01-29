// Import Angular compiler for JIT fallback (needed when library isn't fully AOT compiled)
import '@angular/compiler';

import { bootstrapApplication, NativeDialogModule, provideNativeScriptHttpClient, provideNativeScriptRouter, runNativeScriptAngularApp } from '@nativescript/angular';
import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { App } from './app/app';
import './global';

// Register custom streamdown elements from the plugin
import { registerStreamdownElements } from '@nstudio/nstreamdown/angular';
import { Application, Color } from '@nativescript/core';
registerStreamdownElements();

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(App, {
      providers: [provideNativeScriptHttpClient(withInterceptorsFromDi()), provideNativeScriptRouter(routes), provideZonelessChangeDetection(), importProvidersFrom(NativeDialogModule)],
    });
  },
});
