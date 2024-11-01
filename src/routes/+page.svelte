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
            <div class="github-stats">
                <p><strong>Username:</strong> {data.login}</p>
                <p><strong>Followers:</strong> {data.followers}</p>
                <p><strong>Following:</strong> {data.following}</p>
                <p><strong>Public Repos:</strong> {data.public_repos}</p>
                <p><strong>Public Gists:</strong> {data.public_gists}</p>
                <!-- <img src={data.avatar_url} alt="Avatar" width="100" /> -->
            </div>
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
    .github-stats {
        margin-top: 20px;
    }
</style>