<script lang="ts" setup>
import { ref } from 'vue';
import Home from './components/Home.vue';
import StreamdownDemo from './components/StreamdownDemo.vue';
import ChatDemo from './components/ChatDemo.vue';

const currentScreen = ref<'home' | 'demo' | 'chat'>('home');
const navigationKey = ref(0);

const navigate = (screen: 'home' | 'demo' | 'chat') => {
  navigationKey.value++;
  currentScreen.value = screen;
};

const goBack = () => {
  navigationKey.value++;
  currentScreen.value = 'home';
};
</script>

<template>
  <Frame id="main-frame" :key="navigationKey">
    <Home v-if="currentScreen === 'home'" @navigate="navigate" />
    <StreamdownDemo v-else-if="currentScreen === 'demo'" @back="goBack" />
    <ChatDemo v-else-if="currentScreen === 'chat'" @back="goBack" />
  </Frame>
</template>
