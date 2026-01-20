import { For } from 'solid-js';

const demos = [
  {
    id: 'demo',
    title: 'Streaming Demo',
    description: 'Watch markdown render in real-time',
    icon: '⚡',
    color: 'bg-green-100',
    darkColor: 'dark:bg-green-900',
  },
  {
    id: 'chat',
    title: 'Chat Interface',
    description: 'Interactive AI chat with streaming',
    icon: '💬',
    color: 'bg-purple-100',
    darkColor: 'dark:bg-purple-900',
  },
];

const features = [
  'Stream markdown',
  'Incomplete tokens',
  'GFM support',
  'Code highlighting',
  'Tables',
  'Math (LaTeX)',
  'Images',
  'Native performance',
  'Dark mode',
  'CJK support',
];

const getFeatureRow = (index) => Math.floor(index / 2);
const getFeatureCol = (index) => index % 2;

export const Home = (props) => {
  return (
    <page>
      <actionbar flat={true} class="bg-slate-50 dark:bg-slate-900" title="nstreamdown">

        </actionbar>
      <gridlayout rows="*" class="bg-slate-50 dark:bg-slate-900">

        {/* Content */}
        <scrollview>
          <stacklayout class="p-4 pt-6">
            {/* Hero section */}
            <stacklayout class="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-2xl p-6 mb-6">
              <label text="Native Markdown Streaming" class="text-xl dark:text-white text-black font-bold text-center leading-[3]" />
              <label text="Real-time AI streaming with beautiful markdown rendering, powered by NativeScript." class="text-sm text-blue-400 dark:text-blue-200 text-center leading-[3] mt-2" textWrap={true} />
            </stacklayout>

            {/* Demo cards */}
            <label text="Demos" class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3" />

            <For each={demos}>
              {(demo) => (
                <stacklayout class="mb-3">
                  <gridlayout columns="48, *, auto" rows="48" class="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm" on:tap={() => props.onNavigate(demo.id)}>
                    {/* Icon container - vertically centered via GridLayout */}
                    <gridlayout col="0" rows="*" columns="*" class={`w-12 h-12 rounded-xl ${demo.color} ${demo.darkColor}`}>
                      <label text={demo.icon} class="text-xl text-center" />
                    </gridlayout>

                    {/* Text - use nested GridLayout for vertical centering */}
                    <gridlayout col="1" rows="*,auto, auto,*" class="ml-3">
                      <label row="1" text={demo.title} class="text-base font-semibold text-slate-800 dark:text-slate-100 leading-[3]" />
                      <label row="2" text={demo.description} class="text-xs text-slate-500 dark:text-slate-400 leading-[3]" textWrap={true} />
                    </gridlayout>

                    {/* Arrow */}
                    <label col="2" text="›" class="text-2xl text-slate-300 dark:text-slate-600 font-light" />
                  </gridlayout>
                </stacklayout>
              )}
            </For>

            {/* Features list */}
            <label text="Features" class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-6 mb-3" />

            <gridlayout columns="*, *" rows="auto, auto, auto, auto, auto" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <For each={features}>
                {(feature, index) => (
                  <gridlayout row={getFeatureRow(index())} col={getFeatureCol(index())} columns="auto, *" class="p-2">
                    <label col="0" text="✓" class="text-green-500 dark:text-green-400 text-sm mr-2" />
                    <label col="1" text={feature} class="text-sm text-slate-600 dark:text-slate-300 leading-[3]" textWrap={true} />
                  </gridlayout>
                )}
              </For>
            </gridlayout>

            {/* Footer */}
            <label text="Inspired by streamdown.ai • Built for NativeScript" class="text-xs text-slate-400 dark:text-slate-500 text-center mt-8 mb-4" />
          </stacklayout>
        </scrollview>
      </gridlayout>
    </page>
  );
};
