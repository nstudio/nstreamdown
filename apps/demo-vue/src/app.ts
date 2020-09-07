import { createApp, registerElement } from 'nativescript-vue';
import App from './App.vue';
import { registerStreamdownElements } from '@nstudio/nstreamdown/vue';

// Register streamdown elements
registerStreamdownElements();

createApp(App).start();
