let data = [];
let commits = [];

async function loadData() {
    // Load CSV and convert data types
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

function createScatterplot() {
    const width = 1000;
    const height = 600;

    // Select and create SVG
    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    // Draw scatterplot dots
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');

    // Add Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
