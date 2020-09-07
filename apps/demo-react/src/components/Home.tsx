import * as React from "react";

interface DemoItem {
  title: string;
  description: string;
  icon: string;
  route: 'demo' | 'chat';
  color: string;
}

interface HomeProps {
  onNavigate: (screen: 'demo' | 'chat') => void;
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

export const Home = ({ onNavigate }: HomeProps) => {
    const getFeatureRow = (index: number): number => Math.floor(index / 2);
    const getFeatureCol = (index: number): number => index % 2;

    return (
        <page>
            <actionBar flat={true} className="bg-slate-50">
                <label text="nstreamdown" className="text-lg font-bold text-slate-800" />
            </actionBar>

            <gridLayout rows="*" className="bg-slate-50">
                <scrollView row={0}>
                    <stackLayout className="p-4 pt-6">
                        {/* Hero section */}
                        <stackLayout className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 mb-6">
                            <label text="Native iOS Markdown Streaming" className="text-xl text-slate-500 font-bold text-center" />
                            <label text="Real-time AI streaming with beautiful markdown rendering, powered by NativeScript." className="text-sm text-blue-300 text-center mt-2" textWrap={true} />
                        </stackLayout>

                        {/* Demo cards */}
                        <label text="Demos" className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3" />

                        {demos.map((demo) => (
                            <stackLayout key={demo.route} className="mb-3" onTap={() => onNavigate(demo.route)}>
                                <gridLayout columns="48, *, auto" rows="48" className="bg-white rounded-xl p-3 shadow-sm">
                                    <gridLayout col={0} rows="*" columns="*" className={`w-12 h-12 rounded-xl ${demo.color}`}>
                                        <label text={demo.icon} className="text-xl text-center" />
                                    </gridLayout>
                                    <gridLayout col={1} rows="auto, auto" className="ml-3">
                                        <label row={0} text={demo.title} className="text-base font-semibold text-slate-800" />
                                        <label row={1} text={demo.description} className="text-xs text-slate-500" textWrap={true} />
                                    </gridLayout>
                                    <label col={2} text="›" className="text-2xl text-slate-300 font-light" />
                                </gridLayout>
                            </stackLayout>
                        ))}

                        {/* Features list */}
                        <label text="Features" className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-6 mb-3" />

                        <gridLayout columns="*, *" rows="auto, auto, auto, auto, auto" className="bg-white rounded-xl p-4 shadow-sm">
                            {features.map((feature, index) => (
                                <gridLayout
                                    key={index}
                                    row={getFeatureRow(index)}
                                    col={getFeatureCol(index)}
                                    columns="auto, *"
                                    className="p-2"
                                >
                                    <label col={0} text="✓" className="text-green-500 text-sm mr-2" />
                                    <label col={1} text={feature} className="text-sm text-slate-600" textWrap={true} />
                                </gridLayout>
                            ))}
                        </gridLayout>

                        {/* Footer */}
                        <label text="Inspired by streamdown.ai • Built for NativeScript" className="text-xs text-slate-400 text-center mt-8 mb-4" />
                    </stackLayout>
                </scrollView>
            </gridLayout>
        </page>
    );
};
