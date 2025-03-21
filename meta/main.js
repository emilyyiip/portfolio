// main.js
let data = [];
let commits = [];
let xScale, yScale;
let selectedCommits = [];
let filteredCommits = [];

let NUM_ITEMS;
let ITEM_HEIGHT = 150;             
let VISIBLE_COUNT = 20;             
let totalHeight;

const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
const itemsContainer = d3.select('#items-container');

const scrollContainer2 = d3.select('#scroll-container-2');
const spacer2 = d3.select('#spacer-2');
const itemsContainer2 = d3.select('#items-container-2');

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
  
  // Initially, use all commits as the filtered set
  filteredCommits = commits;
  updateScatterplot(filteredCommits);
  brushSelector();

  NUM_ITEMS = commits.length;                    
  totalHeight = (NUM_ITEMS - VISIBLE_COUNT) * ITEM_HEIGHT; 
  spacer.style('height', `${totalHeight}px`)
    .style('display', 'block')  
    .style('opacity', '0');     

  spacer2.style('height', `${totalHeight}px`)
    .style('display', 'block') 
    .style('opacity', '0');    

  renderItems(0);
  renderItems2(0);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  
  scrollContainer.on('scroll', () => {
    const scrollTop = scrollContainer.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    renderItems(startIndex);
  });
  scrollContainer2.on('scroll', () => {
    const scrollTop = scrollContainer2.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    renderItems2(startIndex);
  });
});

function processCommits() {
  commits = d3
    .groups(data, d => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/emilyyiip/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      // Make the lines property read-only so it isn’t accidentally altered.
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true, 
        writable: false, 
        enumerable: true, 
      });
      return ret;
    });

  commits.sort((a, b) => a.datetime - b.datetime);
}

function displayStats() {
  const statsContainer = d3.select('#stats');
  statsContainer.html(''); 

  statsContainer.append('h2').text('Summary');
  
  const dl = statsContainer.append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd')
    .attr('id', 'commit-count')
    .text(commits.length);

  const averageFileLength = d3.mean(data, d => d.length);
  dl.append('dt').html('Average <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(averageFileLength.toFixed(2));

  const numberOfFiles = d3.rollup(data, v => v.length, d => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numberOfFiles);
}

function updateScatterplot(filteredCommits) {
  d3.select('#chart svg').remove();

  const width = 1000;
  const height = 600;
  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 50, left: 40 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3.scaleTime()
    .domain(d3.extent(filteredCommits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.height, usableArea.top]);

  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  const gridlines = svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle')
  .data(filteredCommits)
  .join('circle')
  .attr('cx', d => xScale(d.datetime))
  .attr('cy', d => yScale(d.hourFrac))
  .attr('r', d => rScale(d.totalLines))
  .style('fill', d => {
    const hour = d.hourFrac;
    return hour < 6 || hour >= 18 ? '#4477AA' : '#DD7733';
  })
  .style('fill-opacity', 0.7)
  .style('stroke-width', 1.5)
  .on('mouseenter', function (event, d) {
    console.log("Mouse entered on commit", d.id);
    d3.select(this).style('fill', '#ff6b6b');
    updateTooltipContent(d);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
    d3.select(this).style('fill-opacity', 1);
    d3.select(this).classed('selected', true);
  })  
  
  .on('mousemove', (event) => {
    // Update tooltip position as the mouse moves
    updateTooltipPosition(event);
  })
  .on('mouseleave', function (event, d) {
    // Hide tooltip on mouse leave
    updateTooltipVisibility(false);
    // Restore the original fill color based on the commit's hour
    const hour = d.hourFrac;
    d3.select(this).style('fill', hour < 6 || hour >= 18 ? '#4477AA' : '#DD7733');
    // Restore fill opacity and remove selected class
    d3.select(this).style('fill-opacity', 0.7);
    d3.select(this).classed('selected', false);
  });


  const tickValues = [];
  let currentTick = d3.min(filteredCommits, d => d.datetime);
  while (currentTick < d3.max(filteredCommits, d => d.datetime)) {
    tickValues.push(currentTick);
    currentTick = d3.timeDay.offset(currentTick, 2); 
  }

  const xAxis = d3.axisBottom(xScale)
    .tickValues(tickValues)  
    .tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .style('font-family', 'Arial, sans-serif')
    .style('font-size', '12px')
    .style('stroke', '#999');
  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis)
    .style('font-family', 'Arial, sans-serif')
    .style('font-size', '12px')
    .style('stroke', '#999');

  // Reattach brush (if needed)
  brushSelector();
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const dateEl = document.getElementById('commit-date');
  if (!commit || !commit.id) {
    link.textContent = '';
    link.removeAttribute('href');
    dateEl.textContent = '';
    return;
  }
  // Set the commit URL and id in the tooltip
  link.href = commit.url;
  link.textContent = commit.id;
  // Display the commit date and time using toLocaleString()
  dateEl.textContent = commit.datetime.toLocaleString('en', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}


function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}

function brushSelector() {
  const svg = d3.select('#chart svg');
  const brush = d3.brush().on('brush end', brushed);
  svg.call(brush);
  // Bring the dots group to the front so it receives mouse events
  svg.select('.dots').raise();
}


function brushed(evt) {
  const brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter(commit => {
        const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  countElement.textContent = selectedCommits.length === 0
    ? 'No commits selected'
    : `${selectedCommits.length} commits selected`;
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');
  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const lines = selectedCommits.flatMap(d => d.lines);
  const breakdown = d3.rollup(lines, v => v.length, d => d.type);
  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
  }
  return breakdown;
}

function commitNarrative(commit, index) {
  const fileCount = new Set(commit.lines.map(line => line.file)).size;
  return `
    <p>
      On <a href="${commit.url}" target="_blank">
        ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}
      </a>, I edited ${commit.totalLines} lines across ${fileCount} ${fileCount === 1 ? 'file' : 'files'}.
      I made some cool changes.
    </p>
  `;
}

function commitNarrative2(commit, index) {
  const fileCount = new Set(commit.lines.map(line => line.file)).size;
  return `
    <p>
      On <a href="${commit.url}" target="_blank">
        ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}
      </a>, I edited ${commit.totalLines} lines across ${fileCount} ${fileCount === 1 ? 'file' : 'files'}.
      I made nice changes.
    </p>
  `;
}

function renderItems(startIndex) {
  itemsContainer.selectAll('div').remove();
  const commitsToRender = filteredCommits.length > 0 ? filteredCommits : commits;
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commitsToRender.length);
  let newCommitSlice = commitsToRender.slice(startIndex, endIndex);
  
  // Update the scatterplot to reflect only the visible commit slice
  updateScatterplot(newCommitSlice);
  
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .html((commit, index) => commitNarrative(commit, index)) 
    .style('position', 'absolute')
    .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`); 
}
  
function renderItems2(startIndex) {
  itemsContainer2.selectAll('div').remove();
  const commitsToRender = filteredCommits.length > 0 ? filteredCommits : commits;
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commitsToRender.length);
  let newCommitSlice = commitsToRender.slice(startIndex, endIndex);

  // Update the file visualization for the visible commit slice in chart-2
  displayCommitFiles(newCommitSlice, '#chart-2');

  itemsContainer2.selectAll('div')
      .data(newCommitSlice)
      .enter()
      .append('div')
      .html((commit, index) => commitNarrative2(commit, index)) 
      .style('position', 'absolute')
      .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`); 
}
  
function displayCommitFiles(commitSlice, containerSelector = '.files') {
  // Create an ordinal scale for file types
  const types = Array.from(new Set(data.map(d => d.type))).sort();
  const fileTypeColors = d3.scaleOrdinal()
                           .domain(types)
                           .range(d3.schemeTableau10);
 
  // For the commit slice, get all lines and group by file
  const lines = commitSlice.flatMap(d => d.lines);
  let files = d3.groups(lines, d => d.file)
                .map(([name, lines]) => ({ name, lines }));
  files = d3.sort(files, (a, b) => b.lines.length - a.lines.length);
 
  d3.select(containerSelector).selectAll('div').remove();
 
  let filesContainer = d3.select(containerSelector)
                         .selectAll('div')
                         .data(files)
                         .enter()
                         .append('div')
                         .style('margin-bottom', '1em');
 
  filesContainer.append('dt')
                .html(d => `<code>${d.name}</code><br><small>${d.lines.length} lines</small>`);
 
  filesContainer.append('dd')
                .style('display', 'flex')
                .style('flex-wrap', 'wrap')
                .selectAll('div')
                .data(d => d.lines)
                .enter()
                .append('div')
                .attr('class', 'line')
                .style('background', d => fileTypeColors(d.type));
}
 
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  document.getElementById('time-slider').addEventListener('input', () => {
    // (Assuming you want to update filteredCommits based on time, add that logic here)
    // For now, we simply reassign filteredCommits as all commits.
    filteredCommits = commits; // Replace with your actual filtering logic if needed.
    updateScatterplot(filteredCommits);
  });
});
