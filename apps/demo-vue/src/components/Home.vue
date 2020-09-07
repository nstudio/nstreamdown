<script lang="ts" setup>
const emit = defineEmits<{
  navigate: [screen: 'demo' | 'chat'];
}>();

interface DemoItem {
  title: string;
  description: string;
  icon: string;
  route: 'demo' | 'chat';
  color: string;
}

const demos: DemoItem[] = [
  {
    title: 'Streaming Demo',
    description: 'Watch markdown render in real-time',
    icon: '⚡',
    route: 'demo',
    color: 'bg-green-100',
  },
  {
    title: 'Chat Interface',
    description: 'Interactive AI chat with streaming',
    icon: '💬',
    route: 'chat',
    color: 'bg-purple-100',
  },
];

const features = ['Streaming markdown', 'Incomplete tokens', 'GFM support', 'Code highlighting', 'Tables', 'Math (LaTeX)', 'Images', 'Native performance', 'Dark mode', 'CJK support'];

function getFeatureRow(index: number): number {
  return Math.floor(index / 2);
}

function getFeatureCol(index: number): number {
  return index % 2;
}

function navigateTo(route: 'demo' | 'chat') {
  emit('navigate', route);
}
</script>

<template>
  <Page>
    <ActionBar flat="true" class="bg-slate-50">
      <Label text="nstreamdown" class="text-lg font-bold text-slate-800" />
    </ActionBar>

    <GridLayout rows="*" class="bg-slate-50">
      <ScrollView row="0">
        <StackLayout class="p-4 pt-6">
          <!-- Hero section -->
          <StackLayout class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 mb-6">
            <Label text="Native iOS Markdown Streaming" class="text-xl text-slate-500 font-bold text-center" />
            <Label text="Real-time AI streaming with beautiful markdown rendering, powered by NativeScript." class="text-sm text-blue-300 text-center mt-2 leading-[3]" textWrap="true" />
          </StackLayout>

          <!-- Demo cards -->
          <Label text="Demos" class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3" />

          <StackLayout v-for="demo in demos" :key="demo.route" class="mb-3" @tap="navigateTo(demo.route)">
            <GridLayout columns="48, *, auto" rows="48" class="bg-white rounded-xl p-3 shadow-sm">
              <GridLayout col="0" rows="*" columns="*" :class="'w-12 h-12 rounded-xl ' + demo.color">
                <Label :text="demo.icon" class="text-xl text-center" />
              </GridLayout>
              <GridLayout col="1" rows="auto, auto" class="ml-3">
                <Label row="0" :text="demo.title" class="text-base font-semibold text-slate-800" />
                <Label row="1" :text="demo.description" class="text-xs text-slate-500" textWrap="true" />
              </GridLayout>
              <Label col="2" text="›" class="text-2xl text-slate-300 font-light" />
            </GridLayout>
          </StackLayout>

          <!-- Features list -->
          <Label text="Features" class="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-6 mb-3" />

          <GridLayout columns="*, *" rows="auto, auto, auto, auto, auto" class="bg-white rounded-xl p-4 shadow-sm">
            <GridLayout
              v-for="(feature, index) in features"
              :key="index"
              :row="getFeatureRow(index)"
              :col="getFeatureCol(index)"
              columns="auto, *"
              class="p-2"
            >
              <Label col="0" text="✓" class="text-green-500 text-sm mr-2" />
              <Label col="1" :text="feature" class="text-sm text-slate-600 leading-[3]" textWrap="true" />
            </GridLayout>
          </GridLayout>

          <!-- Footer -->
          <Label text="Inspired by streamdown.ai • Built for NativeScript" class="text-xs text-slate-400 text-center mt-8 mb-4" />
        </StackLayout>
      </ScrollView>
    </GridLayout>
  </Page>
</template>
