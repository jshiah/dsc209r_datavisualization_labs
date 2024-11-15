<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let pages = [
        { url: './', title: 'Home' },
        { url: './projects', title: 'Projects' },
        { url: './resume', title: 'Resume' },
        { url: './contact', title: 'Contact' },
        { url: './meta', title: 'Meta' },
        { url: 'https://github.com/jshiah', title: 'GitHub' } 
    ];

    // Initialize colorScheme with a default value
    let colorScheme = 'automatic'; // Default value
    let root = globalThis?.document?.documentElement; // Access the <html> element

    // Function to handle theme change
    function handleThemeChange(event) {
        const scheme = event.target.value;
        colorScheme = scheme; // Update the variable
        if (typeof localStorage !== 'undefined') {
            localStorage.colorScheme = scheme; // Save to localStorage
        }
    }

    // Set initial value based on localStorage or OS preference
    onMount(() => {
        if (typeof localStorage !== 'undefined' && "colorScheme" in localStorage) {
            colorScheme = localStorage.colorScheme;
        }
    });

    // Reactive statement to set the color scheme
    $: root?.style.setProperty('color-scheme', colorScheme);
</script>

<style>
    .color-scheme {
        position: absolute;
        top: 1em;
        right: 1em;
        margin: 1em 0;
    }
</style>

<nav>
    {#each pages as p}
        <a href={p.url} class:current={'.' + $page.route.id === p.url} target={ p.url.startsWith("http") ? "_blank" : null }>
            {p.title}
        </a>
    {/each}
</nav>

<label class="color-scheme">
    Theme:
    <select bind:value={colorScheme} on:change={handleThemeChange}>
        <option value="automatic">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>
<!-- 
<p>
    {#if colorScheme === 'automatic'}
        light dark
    {:else if colorScheme === 'light'}
        light
    {:else if colorScheme === 'dark'}
        dark
    {/if}
</p> -->

<slot />