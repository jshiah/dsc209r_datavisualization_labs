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

    let margin = { top: 20, right: 20, bottom: 40, left: 50 }; // Adjust margins to avoid clipping

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
                numFiles = new Set(data.map(d => d.file)).size; // Number of unique files
                maxFileLength = Math.max(...data.map(d => d.line)); // Maximum file length
                longestFile = data.reduce((max, current) => current.line > max.line ? current : max).file; // Longest file
                avgFileLength = data.reduce((sum, d) => sum + d.line, 0) / data.length; // Average file length

                return ret;
            });

        // Define scales with margins applied
        xScale = d3.scaleTime()
            .domain(d3.extent(commits, (d) => d.datetime)) // Time extent
            .nice()
            .range([usableArea.left, usableArea.right]);  // Apply margins to xScale

        yScale = d3.scaleLinear()
            .domain([0, 24])  // Hour of the day: 0 to 24
            .nice()
            .range([usableArea.top, usableArea.height]);  // Reversed range for descending Y-axis

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
            .attr("r", 5)  // Initial radius
            .attr("fill", "steelblue")
            .style("pointer-events", "all")  // Ensure pointer events are enabled

            // Add hover event for scaling effect
            .on('mouseover', function (event, d) {
                d3.select(this)  // Select the circle
                    .transition()  // Apply a transition for smooth scaling
                    .duration(200)  // Duration of 200ms for the transition
                    .attr("r", 5 * 1.5);  // Scale radius by 1.5x
            })
            .on('mouseout', function (event, d) {
                d3.select(this)  // Select the circle
                    .transition()  // Apply a transition for smooth scaling
                    .duration(200)  // Duration of 200ms for the transition
                    .attr("r", 5);  // Reset radius back to the initial size
            });

        // Create X-axis
        xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${usableArea.height})`) // Move the X-axis to the bottom
            .call(d3.axisBottom(xScale));

        // Create Y-axis with formatted time labels
        yAxis = svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${usableArea.left}, 0)`) // Move the Y-axis to the left
            .call(d3.axisLeft(yScale)
                .tickFormat((d) => {
                    // Format the Y-axis tick labels as HH:00, using d % 24 to handle fractional hours
                    return String(d % 24).padStart(2, '0') + ':00';
                })
            );

        // Create horizontal gridlines
        svg.append("g")
            .attr("class", "gridlines")
            .selectAll("line")
            .data(yScale.ticks(10)) // Create ticks for the gridlines
            .enter()
            .append("line")
            .attr("x1", usableArea.left) // Start from the left margin
            .attr("x2", usableArea.right) // End at the right margin
            .attr("y1", (d) => yScale(d)) // Y position based on the tick
            .attr("y2", (d) => yScale(d)) // Y position based on the tick
            .attr("stroke", "black") // Color of the gridlines
            .attr("stroke-opacity", 0.2) // Set opacity
            .attr("stroke-dasharray", "2,2"); // Optional: make them dashed
    });
</script>

<svelte:head>
    <title>Meta</title>
</svelte:head>

<header>
    <h1>Meta</h1>
    <p>This page includes stats about the code of this website.</p>
</header>

<!-- Display Statistics -->
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

<!-- SVG for scatterplot -->
<svg id="scatterplot"></svg>

<style>
    /* Scoped CSS for Meta Page only */
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
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Responsive layout */
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
        stroke: black; /* Color of the gridlines */
        stroke-opacity: 0.2; /* Opacity of the gridlines */
        transform-origin: center;
        transform-box: fill-box;
    }
</style>
