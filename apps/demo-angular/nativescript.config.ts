import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'io.nstudio.nstreamdown.demoangular',
  appPath: 'src',
  appResourcesPath: '../../tools/assets/App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
} as NativeScriptConfig;
