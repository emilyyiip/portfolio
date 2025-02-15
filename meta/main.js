let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    displayStats();
    processCommits();
    createScatterplot();
}

// Process commits into useful format
function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        let ret = {
            id: commit,
            url: `https://github.com/emilyyiip/portfolio/commit/${commit}`,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            configurable: false, 
            writable: false, 
            enumerable: false, 
        });

        return ret;
    });
}

// Display stats at the top of the page
function displayStats() {
    // Process commits first
    processCommits();
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
    // Additional Stats
    dl.append('dt').text('Number of Files');
    dl.append('dd').text(d3.group(data, d => d.file).size);
    dl.append('dt').text('Maximum File Length');
    dl.append('dd').text(d3.max(data, d => d.line));
    dl.append('dt').text('Average Line Length');
    dl.append('dd').text(d3.mean(data, d => d.length).toFixed(2));
}

// Create scatterplot with axes, grid, and tooltip
function createScatterplot() {
    const width = 1000, height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 50 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Add grid lines
    svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Draw scatterplot dots
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
            updateTooltipContent({});
            updateTooltipVisibility(false);
        });

}

// Update tooltip content
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
}

// Show or hide the tooltip
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

// Position the tooltip near the cursor
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
const commit = [
    { id: "123abc", url: "#", datetime: new Date(), totalLines: 50, lines: [{ type: "JS", count: 50 }] },
    { id: "456def", url: "#", datetime: new Date(), totalLines: 20, lines: [{ type: "CSS", count: 20 }] },
    { id: "789ghi", url: "#", datetime: new Date(), totalLines: 80, lines: [{ type: "HTML", count: 80 }] }
];
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const xScale = d3.scaleLinear().domain([0, 100]).range([50, width - 50]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height - 50, 50]);
const rScale = d3.scaleSqrt().domain([0, 100]).range([2, 30]);
let brushSelection = null;

const dots = svg.selectAll("circle")
    .data(commit)
    .enter().append("circle")
    .attr("cx", (d, i) => xScale(i * 30))
    .attr("cy", (d, i) => yScale(i * 30))
    .attr("r", d => rScale(d.totalLines))
    .style("fill-opacity", 0.7)
    .on("mouseenter", (event, d) => {
        updateTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
        d3.select(event.currentTarget).style("fill-opacity", 1);
    })
    .on("mouseleave", () => {
        updateTooltipContent({});
        updateTooltipVisibility(false);
        d3.selectAll("circle").style("fill-opacity", 0.7);
    });

function updateTooltipContent(commit) {
    if (!commit.id) return;
    document.getElementById("commit-link").href = commit.url;
    document.getElementById("commit-link").textContent = commit.id;
    document.getElementById("commit-date").textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
}

function updateTooltipVisibility(isVisible) {
    document.getElementById("commit-tooltip").hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
}

function isCommitSelected(commit) {
    if (!brushSelection) return false;
    const [x0, y0] = brushSelection[0];
    const [x1, y1] = brushSelection[1];
    const x = xScale(commits.indexOf(commit) * 30);
    const y = yScale(commits.indexOf(commit) * 30);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function updateSelection() {
    d3.selectAll("circle").classed("selected", d => isCommitSelected(d));
    updateSelectionCount();
    updateLanguageBreakdown();
}

function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById("selection-count").textContent = `${selectedCommits.length || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById("language-breakdown");
    container.innerHTML = '';
    if (selectedCommits.length === 0) return;
    const lines = selectedCommits.flatMap(d => d.lines);
    const breakdown = d3.rollup(lines, v => v.length, d => d.type);
    breakdown.forEach((count, language) => {
        const formatted = d3.format(".1~%")(count / lines.length);
        container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
    });
}

d3.select(svg).call(d3.brush().on("start brush end", brushed));
d3.select(svg).selectAll(".dots, .overlay ~ *").raise();

