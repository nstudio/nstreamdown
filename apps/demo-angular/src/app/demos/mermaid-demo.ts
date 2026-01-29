/**
 * MermaidDemo Component
 * A demo component showcasing various Mermaid diagram types
 * Toggle MERMAID_DEMO_ENABLED to enable/disable
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal } from '@angular/core';
import { NativeScriptCommonModule, RouterExtensions } from '@nativescript/angular';
import { MdMermaid } from '@nstudio/nstreamdown/angular';

/**
 * ========================================
 * TOGGLE THIS TO ENABLE/DISABLE THE DEMO
 * ========================================
 */
export const MERMAID_DEMO_ENABLED = true;

/**
 * Collection of Mermaid diagram examples
 */
export const MERMAID_EXAMPLES = [
  {
    title: 'Flowchart',
    description: 'A simple decision flowchart',
    diagram: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Ship it! 🚀]`,
  },
  {
    title: 'Sequence Diagram',
    description: 'API request/response flow',
    diagram: `sequenceDiagram
    participant App
    participant API
    participant DB
    
    App->>API: POST /chat
    API->>DB: Store message
    DB-->>API: OK
    API-->>App: Stream response
    Note over App,API: Real-time streaming`,
  },
  {
    title: 'State Diagram',
    description: 'App lifecycle states',
    diagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: Start
    Loading --> Streaming: Data received
    Streaming --> Complete: Done
    Streaming --> Error: Failed
    Error --> Idle: Retry
    Complete --> Idle: Reset
    Complete --> [*]`,
  },
  {
    title: 'Class Diagram',
    description: 'Streamdown architecture',
    diagram: `classDiagram
    class Streamdown {
        +content: string
        +config: StreamdownConfig
        +parseMarkdown()
        +render()
    }
    class MarkdownParser {
        +parse(text): Token[]
        +remend(text): string
    }
    class MdMermaid {
        +diagram: string
        +darkMode: boolean
        +render()
    }
    Streamdown --> MarkdownParser
    Streamdown --> MdMermaid`,
  },
  {
    title: 'Pie Chart',
    description: 'Framework usage distribution',
    diagram: `pie showData
    title NativeScript Frameworks
    "Angular" : 35
    "Vue" : 25
    "React" : 20
    "Solid" : 12
    "Svelte" : 8`,
  },
  {
    title: 'Git Graph',
    description: 'Branch and merge visualization',
    diagram: `gitGraph
    commit id: "Initial"
    branch feature
    checkout feature
    commit id: "Add mermaid"
    commit id: "Fix bugs"
    checkout main
    merge feature id: "Merge PR"
    commit id: "Release v1.0"`,
  },
];

@Component({
  selector: 'MermaidDemo',
  template: `
    <GridLayout rows="auto, *" class="bg-slate-100 dark:bg-slate-900" androidOverflowEdge="bottom">
      <!-- ActionBar -->
      <ActionBar row="0" flat="true" class="text-black dark:text-white bg-slate-50 dark:bg-slate-900" title="Mermaid Diagrams">
        <NavigationButton text="" android.systemIcon="ic_menu_back" (tap)="goBack()"></NavigationButton>
      </ActionBar>

      <!-- Content -->
      <ScrollView row="1">
        <StackLayout class="p-4">
          <!-- Header -->
          <Label text="🧜‍♀️ Mermaid Diagrams" class="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2"></Label>
          <Label text="Interactive diagram rendering powered by mermaid.js" class="text-sm text-slate-500 dark:text-slate-400 mb-4" textWrap="true"></Label>

          <!-- Diagram examples -->
          @for (example of examples; track example.title) {
            <StackLayout class="mb-6">
              <Label [text]="example.title" class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1"></Label>
              <Label [text]="example.description" class="text-xs text-slate-500 dark:text-slate-400 mb-2"></Label>
              <MdMermaid [content]="example.diagram" [darkMode]="darkMode()"></MdMermaid>
            </StackLayout>
          }
        </StackLayout>
      </ScrollView>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule, MdMermaid],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MermaidDemo {
  examples = MERMAID_EXAMPLES;
  darkMode = signal(true);

  constructor(private routerExtensions: RouterExtensions) {}

  toggleDarkMode() {
    this.darkMode.update((v) => !v);
  }

  goBack() {
    this.routerExtensions.back();
  }
}
