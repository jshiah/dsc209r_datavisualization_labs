<script>
    import projects from '$lib/projects.json'; // Import your projects data
    import Project from '$lib/Project.svelte';
</script>


<svelte:head>
    <title>Home Page</title>
</svelte:head>

<main>
    <h1>Joyce Shiah</h1>
    <p>MS DS student @ UCSD HDSI. Welcome to my Lab-1 Assignment.</p>
    <img src="/my-portfolio/freezercat.jpeg" alt="I saw a cat named Freezer at the cat shelter." width = "500" height = "700"/>

    <h2>Latest Projects</h2> <!-- Add a heading for the latest projects -->
    <div class="projects highlights"> <!-- Wrap in a div for styling -->
        {#each projects.slice(0, 3) as project} <!-- Display first 3 projects -->
            <Project data={project} hLevel={3} /> <!-- Use the Project component with hLevel prop -->
        {/each}
    </div>
</main>
