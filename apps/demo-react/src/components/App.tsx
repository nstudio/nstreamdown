import * as React from "react";
import { useState } from "react";
import { FrameNavigationProp } from "react-nativescript-navigation";
import { Home } from "./Home";
import { StreamdownDemo } from "./StreamdownDemo";
import { ChatDemo } from "./ChatDemo";

// Simple navigation state
type Screen = 'home' | 'demo' | 'chat';

export const App = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');

    const navigate = (screen: Screen) => {
        setCurrentScreen(screen);
    };

    const goBack = () => {
        setCurrentScreen('home');
    };

    return (
        <frame>
            {currentScreen === 'home' && <Home onNavigate={navigate} />}
            {currentScreen === 'demo' && <StreamdownDemo onBack={goBack} />}
            {currentScreen === 'chat' && <ChatDemo onBack={goBack} />}
        </frame>
    );
};
