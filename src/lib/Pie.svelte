<script>
    import * as d3 from 'd3';
    import { createEventDispatcher } from 'svelte';

    export let data = [];

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);

    let arcData = [];
    let arcs = [];

    $: {
        arcData = sliceGenerator(data);
        arcs = arcData.map((d) => arcGenerator(d));
    }

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    
    let selectedIndex = null;
    let hoveredIndex = null; // New variable to track hovered wedge
    const dispatch = createEventDispatcher();

    function handleClick(index) {
        selectedIndex = selectedIndex === index ? null : index; // Toggle selection
        if (selectedIndex !== null) {
            const selectedYear = data[selectedIndex].label;
            dispatch('yearSelect', selectedYear);
        } else {
            dispatch('yearSelect', null);
        }
    }

    function handleMouseEnter(index) {
        hoveredIndex = index; // Set hovered index
    }

    function handleMouseLeave() {
        hoveredIndex = null; // Reset hovered index
    }
</script>

<div class="container">
    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
          <path 
            d={arc} 
            fill={selectedIndex === index ? colors(index) : (hoveredIndex === index ? colors(index) : d3.rgb(colors(index)).darker(0.5))} 
            opacity={hoveredIndex !== null && hoveredIndex !== index && selectedIndex !== index ? 0.3 : 1} 
            on:click={() => handleClick(index)}
            on:mouseenter={() => handleMouseEnter(index)} 
            on:mouseleave={handleMouseLeave} 
          />
        {/each}
    </svg>

    <ul class="legend">
        {#each data as d, index}
        <li class:selected={selectedIndex === index} style="--color: { selectedIndex === index ? d3.rgb(colors(index)).brighter() : colors(index) }">
          <span class="swatch" style="background-color: var(--color);"></span>
          {d.label} <em>({d.value})</em>
        </li>
        {/each}
    </ul>
</div>

<style>
    .container {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        max-width: 100%; 
        justify-content: flex-start; 
    }

    svg {
        width: 200px;
        height: 200px;
    }

    .legend {
        list-style-type: none;
        padding: 20px;
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
        gap: 10px;
        border-radius: 8px;
        max-width: 100%; 
    }

    .legend li {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }

    path {
        transition: fill 300ms, opacity 300ms; /* Add transition for opacity */
    }

    .legend li.selected .swatch {
        border: 2px solid black; 
    }
</style>