<script>
    import projects from '$lib/projects.json'; // Import your projects data
    import Project from '$lib/Project.svelte';
    import Pie from '$lib/Pie.svelte';  // Import the Pie component

    import * as d3 from 'd3'; 

    let query = '';
    let selectedYear = null; // Variable to track the selected year

    // Reactive statement to filter projects based on query and selected year
    $: filteredProjects = projects.filter((project) => {
        const matchesQuery = query ? Object.values(project).join(' ').toLowerCase().includes(query.toLowerCase()) : true;
        const matchesYear = selectedYear ? project.year === selectedYear : true; // Filter by selected year
        return matchesQuery && matchesYear; // Combine both conditions
    });

    // Compute pieData based on the original projects data
    $: pieData = d3.rollups(
        projects, // Use the original projects data
        (v) => v.length,
        (d) => d.year
    ).map(([year, count]) => ({
        value: count,
        label: year
    }));

    // Function to handle year selection from Pie component
    function handleYearSelect(year) {
        selectedYear = year; // Update selectedYear with the year from the Pie chart
    }
</script>

<svelte:head>
    <title>My Projects</title>
</svelte:head>

<h1>{filteredProjects.length} Projects</h1>

<!-- Bind the selected index of the Pie chart to selectedYearIndex -->
<Pie data={pieData} on:yearSelect={event => handleYearSelect(event.detail)} />

<input
  type="search"
  bind:value="{query}"
  class="search-input"  
  aria-label="Search projects"
  placeholder="🔍 Search projects…"
/>

<div class="projects">
    {#each filteredProjects as p}
      <Project data={p} />
    {/each}
</div>

<style>
    /* Style for the search input */
    .search-input {
        display: block;
        margin: 20px auto;  /* Centers the search bar horizontally */
        padding: 10px 15px;
        font-size: 16px;
        width: 80%;  /* Make the search input wider */
        max-width: 800px;  /* Optional: maximum width for the search input */
        border-radius: 8px;
        border: 1px solid #ccc;
    }
</style>