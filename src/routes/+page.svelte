<script>
    import { onMount } from 'svelte';
    import projects from '$lib/projects.json'; 
    import Project from '$lib/Project.svelte';

    let username = 'jshiah'; 
</script>

<svelte:head>
    <title>Home Page</title>
</svelte:head>

<main>
    <h1>Joyce Shiah</h1>
    <p>MS DS student @ UCSD HDSI. Welcome to my Lab-1 Assignment.</p>
    <img src="/my-portfolio/freezercat.jpeg" alt="I saw a cat named Freezer at the cat shelter." width="500" height="700"/>

    <h2>Latest Projects</h2>
    <div class="projects highlights">
        {#each projects.slice(0, 3) as project}
            <Project data={project} hLevel={3} />
        {/each}
    </div>

    <h2>GitHub Profile Stats</h2>
    {#await fetch(`https://api.github.com/users/${username}`)}
        <p>Loading...</p>
    {:then response}
        {#await response.json()}
            <p>Decoding...</p>
        {:then data}
            <dl class="grid">
                <dt>Username:</dt>
                <dd>{data.login}</dd>
                <dt>Followers:</dt>
                <dd>{data.followers}</dd>
                <dt>Following:</dt>
                <dd>{data.following}</dd>
                <dt>Public Repos:</dt>
                <dd>{data.public_repos}</dd>
                <!-- <dt>Avatar:</dt> -->
                <!-- <dd><img src={data.avatar_url} alt="Avatar" width="100" /></dd> -->
            </dl>
        {:catch error}
            <p class="error">Something went wrong while decoding the response: {error.message}</p>
        {/await}
    {:catch error}
        <p class="error">Something went wrong while fetching the data: {error.message}</p>
    {/await}
</main>

<style>
    .error {
        color: red;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: auto auto;
        gap: 10px; /* Optional: Add some space between grid items */
    }
    dt {
        grid-row: 1; /* Place all <dt> elements in the first row */
        font-weight: bold; /* Optional: Make <dt> bold */
    }
    dd {
        grid-row: 2; /* Place all <dd> elements in the second row */
        margin: 0; /* Remove default margin */
    }
</style>