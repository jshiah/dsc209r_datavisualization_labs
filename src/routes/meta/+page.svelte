<div id="tooltip" style="position: absolute; visibility: hidden; background: white; border: 1px solid black; padding: 5px; border-radius: 5px;"></div>

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

    let hoverTimeout;  // Timeout variable to handle the delay

    onMount(async () => {
        data = await d3.csv('loc.csv', (row) => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.datetime),
        }));

        commits = d3
            .groups(data, (d) => d.commit)
            .map(([commit, lines]) => {
                let first = lines[0];
                let { author, date, time, timezone, datetime } = first;
                let ret = {
                    id: commit,
                    url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                    author,
                    date,
                    time,
                    timezone,
                    datetime,
                    hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                    totalLines: lines.length,
                };

                // Additional statistics
                numFiles = new Set(data.map(d => d.file)).size;
                maxFileLength = Math.max(...data.map(d => d.line));
                longestFile = data.reduce((max, current) => current.line > max.line ? current : max).file;
                avgFileLength = data.reduce((sum, d) => sum + d.line, 0) / data.length;

                return ret;
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
            .attr("r", 5)
            .attr("fill", "steelblue")
            .style("pointer-events", "all")
            
            .on('mouseover', function (event, d) {
                // Scale the circle up on hover
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5 * 1.5);

                // Show tooltip with a delay of 500ms
                const tooltip = d3.select("#tooltip");
                tooltip.html(`
                    <strong>Commit:</strong> <a href="${d.url}" target="_blank">${d.id}</a><br>
                    <strong>Author:</strong> ${d.author}<br>
                    <strong>Date:</strong> ${d.date}<br>
                    <strong>Time:</strong> ${d.time}<br>
                    <strong>Lines Committed:</strong> ${d.totalLines}
                `)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");

                // Clear any previous timeout and set a new one for hiding the tooltip after 500ms
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    tooltip.style("visibility", "hidden");
                }, 500);
            })
            .on('mouseout', function (event, d) {
                // Reset circle size when mouse leaves
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5);

                // Clear previous timeout (if any) before hiding the tooltip immediately
                clearTimeout(hoverTimeout);

                // Hide tooltip immediately
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

<style>
    header {
        background-color: transparent;
        text-align: start;
        color: rgb(0, 0, 0)
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
    }
</style>
