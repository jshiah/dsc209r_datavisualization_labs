<div id="tooltip" style="position: absolute; visibility: hidden; background: white; border: 1px solid black; padding: 5px; border-radius: 5px; pointer-events: none;"></div>

<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    let data = [];
    let commits = [];
    let numFiles = 0;
    let maxFileLength = 0;
    let longestFile = '';
    let avgFileLength = 0;

    let width = 1000,  
        height = 600; 

    let margin = { top: 20, right: 20, bottom: 40, left: 50 };

    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;

    let xScale, yScale;
    let svg, xAxis, yAxis;

    // Reactive variables for selected data
    let hasSelection = false;
    let selectedCommits = [];
    let selectedLines = [];
    let languageBreakdown = new Map();

    onMount(async () => {
        data = await d3.csv('loc.csv', (row) => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.datetime),
            language: row.language // Assuming there's a language column
        }));

        commits = d3
            .groups(data, (d) => d.commit)
            .map(([commit, lines]) => {
                let first = lines[0];
                let { author, date, time, timezone, datetime } = first;
                return {
                    id: commit,
                    url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                    author,
                    date,
                    time,
                    timezone,
                    datetime,
                    hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                    totalLines: lines.length,
                    lines: lines // Store lines for language breakdown
                };
            });

        // Define scales
        xScale = d3.scaleTime()
            .domain(d3.extent(commits, (d) => d.datetime))
            .nice()
            .range([usableArea.left, usableArea.right]);

        yScale = d3.scaleLinear()
            .domain([0, 24])
            .nice()
            .range([usableArea.top, usableArea.height]);

        const minRadius = 2;
        const maxRadius = 30;
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(commits, (d) => d.totalLines))
            .range([minRadius, maxRadius])
            .clamp(true);

        commits = d3.sort(commits, (d) => -d.totalLines);

        // Create SVG container
        svg = d3.select("#scatterplot")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("class", "dots")
            .selectAll("circle")
            .data(commits)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", (commit) => xScale(commit.datetime))
            .attr("cy", (commit) => yScale(commit.hourFrac))
            .attr("r", (commit) => rScale(commit.totalLines))
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.7)
            .style("pointer-events", "all")
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", rScale(d.totalLines) * 1.5);

                const tooltip = d3.select("#tooltip");
                tooltip.html(`
                    <strong>Commit:</strong> <a href="${d.url}" target="_blank">${d.id}</a><br>
                    <strong>Author:</strong> ${d.author}<br>
                    <strong>Date:</strong> ${d.date}<br>
                    <strong>Time:</strong> ${d.time}<br>
                    <strong>Lines Committed :</strong> ${d.totalLines}
                `)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", rScale(d.totalLines));

                d3.select("#tooltip").style("visibility", "hidden");
            });

        // Create X-axis
        xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${usableArea.height})`)
            .call(d3.axisBottom(xScale));

        // Create Y-axis
        yAxis = svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${usableArea.left}, 0)`)
            .call(d3.axisLeft(yScale)
                .tickFormat((d) => {
                    return String(d % 24).padStart(2, '0') + ':00';
                })
            );

        // Create gridlines
        svg.append("g")
            .attr("class", "gridlines")
            .selectAll("line")
            .data(yScale.ticks(10))
            .enter()
            .append("line")
            .attr("x1", usableArea.left)
            .attr("x2", usableArea.right)
            .attr("y1", (d) => yScale(d))
            .attr("y2", (d) => yScale(d))
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-dasharray", "2,2");

        // Create a brush
        const brush = d3.brush()
            .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
            .on("start brush end", brushed);

        svg.append("g")
            .attr("class", "brush")
            .call(brush);

    function brushed(event) {
    if (event.selection) {
        const [[x0, y0], [x1, y1]] = event.selection;

        // Draw the rectangle for the brush
        svg.selectAll(".brush-rect").remove(); // Remove previous rectangles
        svg.append("rect")
            .attr("class", "brush-rect")
            .attr("x", x0)
            .attr("y", y0)
            .attr("width", x1 - x0)
            .attr("height", y1 - y0)
            .attr("fill", "rgba(255, 192, 203, 0.3)") // Light pink color
            .attr("pointer-events", "none"); // Make it non-interactive

        // Reset selected commits and language breakdown
        selectedCommits = [];
        languageBreakdown.clear();

        // Loop through the circles and check if they are inside the brushed area
        svg.selectAll(".circle")
            .attr("fill", (d) => {
                const cx = xScale(d.datetime);
                const cy = yScale(d.hourFrac);
                // Check if the circle is within the brushed area
                if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                    selectedCommits.push(d);
                    d.lines.forEach(line => {
                        const lang = line.language;
                        if (languageBreakdown.has(lang)) {
                            languageBreakdown.set(lang, languageBreakdown.get(lang) + 1);
                        } else {
                            languageBreakdown.set(lang, 1);
                        }
                    });
                    return "darkgreen"; // Change to desired color for selected dots
                }
                return "steelblue"; // Default color
            });

        // Update the display of selected information
        updateSelectedInfo(true);
    } else {
        // Reset selection if no area is selected
        hasSelection = false; // Reset selection
        selectedCommits = []; // Clear selected commits
        languageBreakdown.clear(); // Clear language breakdown
        updateSelectedInfo(false); // Update display with "No commits selected"
    }
}

function updateSelectedInfo(isSelected) {
    const numCommits = selectedCommits.length;
    const totalLines = selectedLines.length; // Total lines from selected lines
    const infoContainer = d3.select("#selected-info");

    if (isSelected && numCommits > 0) {
        // Show selected commit information if something is selected
        infoContainer.html(`
            <h3>Selected Information</h3>
            <p>Number of Commits Selected: ${numCommits}</p>
            <p>Lines of Svelte: ${languageBreakdown.get('Svelte') || 0}</p>
            <p>Language Breakdown:</p>
            <ul>
                ${Array.from(languageBreakdown.entries())
                    .map(([lang, count]) => {
                        const percentage = totalLines > 0 ? ((count / totalLines) * 100).toFixed(1) : 0; // Check for division by zero
                        return `<li>${lang}: ${count} lines (${percentage}%)</li>`;
                    })
                    .join('')}
            </ul>
        `);
        
        // Draw the pie chart
        drawPieChart(languageBreakdown);
    } else {
        // Display message if no commits are selected
        infoContainer.html(`
            <h3>No commits selected</h3>
        `);
        
        // Clear the pie chart
        d3.select("#language-pie-chart").selectAll("*").remove();
    }
}

function drawPieChart(data) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Clear any existing pie chart
    d3.select("#language-pie-chart").selectAll("*").remove();

    const svg = d3.select("#language-pie-chart")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pieData = Array.from(data.entries()).map(([lang, count]) => ({ lang, count }));

    const arcs = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d) => color(d.data.lang));

    arcs.append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .text((d) => d.data.lang);
}

    });
</script>


<svelte:head>
    <title>Meta</title>
</svelte:head>

<header>
    <h1>Meta</h1>
    <p>This page includes stats about the code of this website.</p>
</header>

<section class="stats-container">
    <dl class="stats">
      <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
      <dd>{data.length}</dd>
    </dl>

    <dl class="stats">
      <dt>Number of Files</dt>
      <dd>{numFiles}</dd>
    </dl>

    <dl class="stats">
      <dt>Maximum File Length</dt>
      <dd>{maxFileLength} lines</dd>
    </dl>

    <dl class="stats">
      <dt>Longest File</dt>
      <dd>{longestFile}</dd>
    </dl>

    <dl class="stats">
      <dt>Average File Length</dt>
      <dd>{avgFileLength.toFixed(2)} lines</dd>
    </dl>
</section>

<h2>Commits by Time of Day</h2>

<svg id="scatterplot"></svg>

<div id="selected-info" style="margin-top: 20px;"></div>
<svg id="language-pie-chart" width="400" height="400"></svg>


<style>
    header {
        background-color: transparent;
        text-align: start;
        color: rgb(0, 0, 0);
    }
    h1 {
        font-size: 4em;
        margin: 0;
    }
    .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2em;
        margin-top: 2em;
        background-color: rgb(255, 238, 238);
    }
    .stats {
        background-color: #f9f9f9;
        padding: 1em;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    dt {
        font-weight: bold;
    }
    dd {
        margin: 0;
    }

    svg {
        overflow: visible;
    }
    .gridlines line {
        stroke: black;
        stroke-opacity: 0.2;
    }

    #tooltip {
        position: absolute;
        visibility: hidden;
        background: white;
        border: 1px solid black;
        padding: 5px;
        border-radius: 5px;
        pointer-events: none;
        z-index: 10;
        transition-property: opacity 0.5s, visibility 0.5s;
    }

    .brush-rect {
        fill: rgba(0, 0, 255, 0.3);
        pointer-events: none; /* Make it non-interactive */
    }

    /* Global styles for the brush elements */
    :global(.selection) {
        fill: rgba(255, 192, 203, 0.3); /* Color for the selected area */
        stroke: rgb(139, 0, 0); /* Border color for selection */
        stroke-width: 2px; /* Border width */
        stroke-dasharray: 4, 4; /* Dotted border pattern */
    }

    :global(.handle) {
        fill: rgb(183, 0, 0); /* Handle color */
        stroke: #fff; /* Handle border color */
        stroke-width: 2px; /* Handle border width */
    }


    #selected-info {
    display: flex;
    justify-content: space-around; /* Distribute space evenly across the width */
    flex-wrap: wrap; /* Allow the content to wrap if needed */
    margin-top: 20px;
}

#selected-info h3 {
    flex: 1;
    font-size: 1.5em;
    margin: 0;
    text-align: center;
}

#selected-info p {
    flex: 1;
    text-align: center;
    margin: 0;
}

#selected-info ul {
    flex: 2;
    text-align: left;
    margin: 0;
    padding-left: 20px;
    list-style-type: none;
}

#selected-info li {
    margin-bottom: 5px;
}

</style>