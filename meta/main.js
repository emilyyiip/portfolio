let data = [];
let commits = [];
let xScale;
let yScale;
let brushSelection = null;

const width = 1000;
const height = 600;

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
    createScatterplot(); 
}

function processCommits() {
    const commitMap = new Map(); 

    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        let totalChanges = lines.length;
        let additions = totalChanges;
        let deletions = 0;

        for (const entry of lines) {
            const prevLength = commitMap.get(entry.file) || 0;
            const lengthDiff = prevLength - entry.length;

            if (lengthDiff > 0) {
                deletions += lengthDiff;
            }

            commitMap.set(entry.file, entry.length);
        }

        return {
            id: commit,
            url: `https://github.com/emilyyiip/portfolio/commit/${commit}`,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: totalChanges,
            additions: additions,
            deletions: deletions
        };
    });
}

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    const selectedCommits = updateSelectionCount();
    updateLanguageBreakdown(selectedCommits);
}

function isCommitSelected(commit) {
    if (!brushSelection) return false;
    
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

    const x = xScale(commit.datetime); 
    const y = yScale(commit.hourFrac);

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
    d3.selectAll('circle')
        .classed('selected', d => isCommitSelected(d))
        .style('fill', d => isCommitSelected(d) ? '#ff6b6b' : (d.hourFrac < 6 || d.hourFrac >= 18 ? '#4477AA' : '#DD7733'));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById('selection-count').textContent = `${selectedCommits.length || 'No'} commits selected`;
    return selectedCommits;
}

function updateLanguageBreakdown(selectedCommits) {
    const container = document.getElementById('language-breakdown');

    if (!selectedCommits || selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const selectedLines = data.filter(d => 
        selectedCommits.some(commit => commit.id === d.commit)
    );

    const breakdown = d3.rollup(
        selectedLines,
        v => v.length,
        d => d.type
    );

    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / selectedLines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }

    return breakdown;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
