# nstreamdown

Native streaming markdown for NativeScript apps.

## Prerequisites

Before you begin, make sure you have:

- [Environment setup](https://docs.nativescript.org/setup/) (NativeScript 8.x or later)
- Node 22.x or later

## Installation

```bash
# npm
npm install @nstudio/nstreamdown

# yarn
yarn add @nstudio/nstreamdown

# pnpm
pnpm add @nstudio/nstreamdown

# bun
bun add @nstudio/nstreamdown
```

## Choose Your Framework

| Framework | Import Path |
|-----------|-------------|
| Angular | `@nstudio/nstreamdown/angular` |
| React | `@nstudio/nstreamdown/react` |
| Vue | `@nstudio/nstreamdown/vue` |
| Svelte | `@nstudio/nstreamdown/svelte` |
| Solid | `@nstudio/nstreamdown/solid` |

## Basic Usage

### Angular

```typescript
import { Component } from '@angular/core';
import { Streamdown } from '@nstudio/nstreamdown/angular';

@Component({
  selector: 'app-my-component',
  template: `
    <Streamdown [content]="markdown" />
  `,
  imports: [Streamdown],
})
export class MyComponent {
  markdown = `
# Hello World!

This is **bold** and *italic* text.

\`\`\`typescript
const greeting = 'Hello, NativeScript!';
console.log(greeting);
\`\`\`
  `;
}
```

### React

```tsx
import { useState } from 'react';
import { Streamdown } from '@nstudio/nstreamdown/react';

export function MyComponent() {
  const [markdown] = useState(`
# Hello World!

This is **bold** and *italic* text.
  `);

  return <Streamdown content={markdown} />;
}
```

### Solid

```tsx
import { Streamdown } from '@nstudio/nstreamdown/solid';

export function MyComponent() {
  const markdown = '# Hello World';
  const config = { mode: 'streaming', controls: true };

  return (
    <Streamdown
      content={markdown}
      config={config}
    />
  );
}
```

### Svelte

```svelte
<script lang="ts">
  import { Streamdown } from '@nstudio/nstreamdown/svelte';

  let markdown = '# Hello World';
  const config = { mode: 'streaming', controls: true };
</script>

<Streamdown
  content={markdown}
  {config}
/>
```

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Streamdown } from '@nstudio/nstreamdown/vue';

const markdown = ref(`
# Hello World!

This is **bold** and *italic* text.
`);
</script>

<template>
  <Streamdown :content="markdown" />
</template>
```

## Streaming Mode

For AI-powered apps, enable streaming mode to show content as it arrives:

```typescript
import { Component, signal } from '@angular/core';
import { Streamdown } from '@nstudio/nstreamdown/angular';

@Component({
  selector: 'app-chat',
  template: `
    <Streamdown
      [content]="streamingContent()"
      [config]="{
        mode: 'streaming',
        showCaret: true,
        controls: true
      }"
    />
  `,
  imports: [Streamdown],
})
export class Chat {
  streamingContent = signal('');

  async streamFromAI() {
    const response = 'Hello! I am an **AI assistant**...';
    const words = response.split(' ');
    
    for (const word of words) {
      this.streamingContent.update(c => c + word + ' ');
      await this.delay(50);
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Documentation

- [Getting Started](https://nstreamdown.ai/docs/getting-started)
- [Configuration](https://nstreamdown.ai/docs/configuration) - Customize streaming behavior and appearance
- [Features](https://nstreamdown.ai/docs/features) - Explore all supported markdown features
- [Components](https://nstreamdown.ai/docs/components) - Learn about individual markdown components
- [API Reference](https://nstreamdown.ai/docs/api) - Complete API documentation

## Resources

- [Documentation](https://nstreamdown.ai/docs)
- [GitHub](https://github.com/nstudio/nstreamdown)
- [NativeScript](https://nativescript.org/)
- [Streamdown by Vercel](https://streamdown.ai)

---

## Contributing

Found a bug or want to contribute a new feature? Contributions are welcome!

### Setup

```bash
npm run setup
npm start
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Interactive menu for all development tasks |

### Focusing on a Package

Run `npm start` and choose the focus commands for the package you wish to develop in isolation.

<h3 align="center">Made with ❤️ for the NativeScript community</h3>

<p align="center">Inspired by <a href="https://streamdown.ai/">Streamdown.ai</a> by Vercel</p>
