let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // Convert string to number
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone), // Convert date
        datetime: new Date(row.datetime),
    }));

    processCommits();
    console.log(commits);
}

function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        let ret = {
            id: commit,
            url: `https://github.com/YOUR_REPO/commit/${commit}`, // Replace YOUR_REPO with actual repo
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Convert time to decimal
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

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
