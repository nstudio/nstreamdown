<frame>
    {#if currentScreen === 'home'}
        <Home on:navigate={handleNavigate} />
    {:else if currentScreen === 'demo'}
        <StreamdownDemo on:back={goBack} />
    {:else if currentScreen === 'chat'}
        <ChatDemo on:back={goBack} />
    {/if}
</frame>

<script lang="ts">
    import Home from './components/Home.svelte';
    import StreamdownDemo from './components/StreamdownDemo.svelte';
    import ChatDemo from './components/ChatDemo.svelte';

    let currentScreen = 'home';

    function handleNavigate(event: CustomEvent<string>) {
        currentScreen = event.detail;
    }

    function goBack() {
        currentScreen = 'home';
    }
</script>
