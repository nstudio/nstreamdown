import { createSignal } from 'solid-js';
import { Home } from './components/Home';
import { StreamdownDemo } from './components/StreamdownDemo';
import { ChatDemo } from './components/ChatDemo';

const App = () => {
  const [currentScreen, setCurrentScreen] = createSignal('home');

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('home');
  };

  return (
    <frame>
      {currentScreen() === 'home' && <Home onNavigate={navigate} />}
      {currentScreen() === 'demo' && <StreamdownDemo onBack={goBack} />}
      {currentScreen() === 'chat' && <ChatDemo onBack={goBack} />}
    </frame>
  );
};

export { App };
