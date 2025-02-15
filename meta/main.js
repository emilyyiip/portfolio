let data = [];
let commits = [];
let brushSelection = null;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    processCommits();
    displayStats();
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
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
    dl.append('dt').text('Number of Files');
    dl.append('dd').text(d3.group(data, d => d.file).size);
    dl.append('dt').text('Maximum File Length');
    dl.append('dd').text(d3.max(data, d => d.line));
    dl.append('dt').text('Average Line Length');
    dl.append('dd').text(d3.mean(data, d => d.length).toFixed(2));
}

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

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => d3.scaleSqrt().domain([0, 100]).range([2, 30])(d.totalLines))
        .style('fill-opacity', 0.7)
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

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');
    container.innerHTML = '';
    if (selectedCommits.length === 0) return;
    const lines = selectedCommits.flatMap(d => d.lines);
    const breakdown = d3.rollup(lines, v => v.length, d => d.type);
    breakdown.forEach((count, language) => {
        const formatted = d3.format(".1~%")(count / lines.length);
        container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
