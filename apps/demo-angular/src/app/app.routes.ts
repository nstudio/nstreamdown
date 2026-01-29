import { Routes } from '@angular/router';
import { StreamdownDemo, ChatDemo, HomeDemo, MermaidDemo } from './demos';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeDemo },
  { path: 'demo', component: StreamdownDemo },
  { path: 'chat', component: ChatDemo },
  { path: 'mermaid', component: MermaidDemo },
];
