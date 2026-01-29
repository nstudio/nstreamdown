/**
 * Demo Home Component
 * Landing page for the NativeScript Streamdown demos
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, inject } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { Page } from '@nativescript/core';

interface DemoItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  darkColor: string;
}

@Component({
  selector: 'HomeDemo',
  template: `
    <GridLayout rows="auto, *" class="bg-slate-50 dark:bg-slate-900">
      <!-- Native ActionBar -->
      <ActionBar flat="true" class="bg-slate-50 dark:bg-slate-900">
        <Label text="@nstudio/nstreamdown" class="text-lg font-bold text-slate-500 dark:text-slate-100"></Label>
      </ActionBar>

      <!-- Content -->
      <ScrollView row="1">
        <StackLayout class="p-4 pt-6">
          <!-- Hero section -->
          <StackLayout class="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-2xl p-6 mb-6">
            <Label text="Native Markdown Streaming" class="text-xl dark:text-white text-black font-bold text-center leading-[3]"></Label>
            <Label text="Real-time AI streaming with beautiful markdown rendering, powered by NativeScript." class="text-sm text-blue-400 dark:text-blue-200 text-center leading-[3] mt-2" textWrap="true"></Label>
          </StackLayout>

          <!-- Demo cards -->
          <Label text="Demos" class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3"></Label>

          @for (demo of demos; track demo.route) {
            <StackLayout class="mb-3">
              <GridLayout columns="48, *, auto" rows="48" class="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm" [nsRouterLink]="[demo.route]">
                <!-- Icon container - vertically centered via GridLayout -->
                <GridLayout col="0" rows="*" columns="*" [class]="'w-12 h-12 rounded-xl ' + demo.color + ' ' + demo.darkColor">
                  <Label [text]="demo.icon" class="text-xl text-center"></Label>
                </GridLayout>

                <!-- Text - use nested GridLayout for vertical centering -->
                <GridLayout col="1" rows="*,auto, auto,*" class="ml-3">
                  <Label row="1" [text]="demo.title" class="text-base font-semibold text-slate-800 dark:text-slate-100 leading-[3]"></Label>
                  <Label row="2" [text]="demo.description" class="text-xs text-slate-500 dark:text-slate-400 leading-[3]" textWrap="true"></Label>
                </GridLayout>

                <!-- Arrow -->
                <Label col="2" text="›" class="text-2xl text-slate-300 dark:text-slate-600 font-light"></Label>
              </GridLayout>
            </StackLayout>
          }

          <!-- Features list -->
          <Label text="Features" class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-6 mb-3"></Label>

          <GridLayout columns="*, *" rows="auto, auto, auto, auto, auto" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            @for (feature of features; track $index; let i = $index) {
              <GridLayout [row]="getFeatureRow(i)" [col]="getFeatureCol(i)" columns="auto, *" class="p-2">
                <Label col="0" text="✓" class="text-green-500 dark:text-green-400 text-sm mr-2"></Label>
                <Label col="1" [text]="feature" class="text-sm text-slate-600 dark:text-slate-300 leading-[3]" textWrap="true"></Label>
              </GridLayout>
            }
          </GridLayout>

          <!-- Footer -->
          <Label text="Inspired by streamdown.ai • Built for NativeScript" class="text-xs text-slate-400 dark:text-slate-500 text-center mt-8 mb-4"></Label>
        </StackLayout>
      </ScrollView>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDemo {
  page = inject(Page);
  demos: DemoItem[] = [
    {
      title: 'Streaming Demo',
      description: 'Watch markdown render in real-time',
      icon: '⚡',
      route: '/demo',
      color: 'bg-green-100',
      darkColor: 'dark:bg-green-900',
    },
    {
      title: 'Chat Interface',
      description: 'Interactive AI chat with streaming',
      icon: '💬',
      route: '/chat',
      color: 'bg-purple-100',
      darkColor: 'dark:bg-purple-900',
    },
    {
      title: 'Mermaid Diagrams',
      description: 'Interactive flowcharts, sequences & more',
      icon: '📊',
      route: '/mermaid',
      color: 'bg-blue-100',
      darkColor: 'dark:bg-blue-900',
    },
  ];

  features = ['Stream markdown', 'Incomplete tokens', 'GFM support', 'Code highlighting', 'Tables', 'Math (LaTeX)', 'Images', 'Native performance', 'Dark mode', 'CJK support'];

  constructor() {
    if (__ANDROID__) {
      this.page.backgroundColor = '#000';
      // @ts-ignore
      this.page.androidOverflowEdge = 'bottom';
    }
  }

  getFeatureRow(index: number): number {
    return Math.floor(index / 2);
  }

  getFeatureCol(index: number): number {
    return index % 2;
  }
}
