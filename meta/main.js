// meta.js
let data = [];
let commits = [];
let xScale, yScale;
let selectedCommits = [];
let filteredCommits = [];
let commitProgress = 100;
let timeScale;

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

  processCommits();

  // Create timeScale mapping commit datetime to a 0-100 range.
  timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);

  // Update the timeline display and filter commits by time.
  updateTimeDisplay();

  displayStats();
  updateScatterplot(commits);
  displayCommitFiles(commits);
  initScrollytelling();
}

function processCommits() {
  const commitMap = new Map();

  // Group raw data by commit hash and compute summary stats.
  commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
    let first = lines[0];
    let { author, date, time, timezone, datetime } = first;
    let totalChanges = lines.length;
    let additions = totalChanges;
    let deletions = 0;

    // Track cumulative file-length changes across commits.
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
      additions,
      deletions,
      // Keep the original lines for file visualization.
      lines: lines
    };
  });
}

// ---------- TIMELINE FILTERING (Step 1) ----------

// Called whenever the slider moves.
function updateTimeDisplay() {
  const timeSlider = document.getElementById('time-slider');
  commitProgress = Number(timeSlider.value);
  const selectedTime = timeScale.invert(commitProgress);
  document.getElementById('selectedTime').textContent = selectedTime.toLocaleString();
  filterCommitsByTime();
}

// Filter commits by the current maximum time.
function filterCommitsByTime() {
  const commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
  updateScatterplot(filteredCommits);
  displayCommitFiles(filteredCommits);
}

// ---------- BRUSH LOGIC (Step 0 cleanup) ----------

function brushed(event) {
  const brushSelection = event.selection; // or null if empty

  // Update the selectedCommits array based on brush.
  selectedCommits = !brushSelection
    ? []
    : commits.filter(commit => {
        const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown(selectedCommits);
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  // Update circle styles based on selection.
  d3.selectAll('circle')
    .classed('selected', d => isCommitSelected(d))
    .style('fill', d =>
      isCommitSelected(d)
        ? '#ff6b6b'
        : d.hourFrac < 6 || d.hourFrac >= 18
        ? '#4477AA'
        : '#DD7733'
    );
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  if (!countElement) return;
  countElement.textContent =
    selectedCommits.length === 0
      ? 'No commits selected'
      : `${selectedCommits.length} commits selected`;
}

function updateLanguageBreakdown(selectedCommits) {
  const container = document.getElementById('language-breakdown');
  if (!container) return;
  if (!selectedCommits || selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const selectedLines = data.filter(d =>
    selectedCommits.some(commit => commit.id === d.commit)
  );
  const breakdown = d3.rollup(selectedLines, v => v.length, d => d.type);
  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / selectedLines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
  }
  return breakdown;
}

// ---------- SCATTERPLOT (Updated to use filteredCommits) ----------

function updateScatterplot(filteredCommits) {
  d3.select('#chart svg').remove();

  const scatterWidth = 800;
  const scatterHeight = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const usableArea = {
    top: margin.top,
    right: scatterWidth - margin.right,
    bottom: scatterHeight - margin.bottom,
    left: margin.left,
    width: scatterWidth - margin.left - margin.right,
    height: scatterHeight - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${scatterWidth} ${scatterHeight}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime()
    .domain(d3.extent(filteredCommits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  yScale = d3.scaleLinear()
    .domain([24, 0])
    .range([usableArea.bottom, usableArea.top]);

  // Gridlines
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickSize(-usableArea.width).tickFormat(''))
    .style('color', '#ccc')
    .style('opacity', 0.3)
    .call(g => {
      g.selectAll('.domain').remove();
      g.selectAll('line').style('stroke-dasharray', '2,2');
    });

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => d === 24 ? '24' : String(d).padStart(2, '0') + ':00')
    .ticks(12);

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .select('.domain')
    .style('stroke', '#000');

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis)
    .select('.domain')
    .style('stroke', '#000');

  // Tooltip helper functions
  function updateTooltipContent(commit) {
    const tooltip = document.getElementById('commit-tooltip');
    const link = document.getElementById('commit-link');
    const dateEl = document.getElementById('commit-date');
    if (!commit || Object.keys(commit).length === 0) {
      if (tooltip) tooltip.hidden = true;
      return;
    }
    if (tooltip) tooltip.hidden = false;
    if (link) {
      link.href = commit.url;
      link.textContent = commit.id;function displayCommitFiles(filteredCommits) {
        // Extract all lines from the filtered commits
        const lines = filteredCommits.flatMap(d => d.lines);
        
        // Create an ordinal scale for file types (technologies)
        let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
        
        // Group lines by file and create an array of file objects
        let files = d3.groups(lines, d => d.file)
          .map(([name, lines]) => ({ name, lines }));
        
        // Sort files by number of lines (descending)
        files = d3.sort(files, d => -d.lines.length);
        
        // Clear any existing file visualization
        d3.select('.files').selectAll('div').remove();
        
        // Bind the files data to new container divs
        let filesContainer = d3.select('.files')
          .selectAll('div')
          .data(files)
          .enter()
          .append('div');
        
        // Append a <dt> for the file name and total lines.
        // We include a <small> element for the line count.
        filesContainer.append('dt')
          .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
        
        // Append a <dd> that will contain one dot per line.
        // Here we bind each line (data point) to a new <div class="line">
        filesContainer.append('dd')
          .selectAll('div')
          .data(d => d.lines)
          .enter()
          .append('div')
          .attr('class', 'line')
          .style('background', d => fileTypeColors(d.type));
      }
      
    }
    if (dateEl) {
      dateEl.textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
    }
  }
  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    if (!tooltip) return;
    if (isVisible) tooltip.classList.add('visible');
    else tooltip.classList.remove('visible');
  }
  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    if (!tooltip) return;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
  }

  // Circle radius scale
  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
  const sortedCommits = d3.sort(filteredCommits, d => -d.totalLines);
  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .style('fill', d =>
      d.hourFrac < 6 || d.hourFrac >= 18 ? '#4477AA' : '#DD7733'
    )
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, d) => {
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      d3.select(event.currentTarget).style('fill-opacity', 1);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      updateTooltipContent({});
      updateTooltipVisibility(false);
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
    });

  // Attach brush
  brushSelector(svg, usableArea);
}

function brushSelector(svg, usableArea) {
  const brush = d3.brush()
    .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
    .on('brush end', brushed);
  svg.append('g').attr('class', 'brush').call(brush);
}

function displayStats() {
  processCommits();
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.group(data, d => d.file).size);
}

// ---------- UNIT VISUALIZATION FOR FILES (Step 2) ----------
function displayCommitFiles(filteredCommits) {
  // Extract all lines from the filtered commits
  const lines = filteredCommits.flatMap(d => d.lines);
  
  // Create an ordinal scale for file types (technologies)
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  
  // Group lines by file and create an array of file objects
  let files = d3.groups(lines, d => d.file)
    .map(([name, lines]) => ({ name, lines }));
  
  // Sort files by number of lines (descending)
  files = d3.sort(files, d => -d.lines.length);
  
  // Clear any existing file visualization
  d3.select('.files').selectAll('div').remove();
  
  // Bind the files data to new container divs
  let filesContainer = d3.select('.files')
    .selectAll('div')
    .data(files)
    .enter()
    .append('div');
  
  // Append a <dt> for the file name and total lines.
  // We include a <small> element for the line count.
  filesContainer.append('dt')
    .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  
  // Append a <dd> that will contain one dot per line.
  // Here we bind each line (data point) to a new <div class="line">
  filesContainer.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}


// ---------- SCROLLY: Commits Over Time (Step 3) ----------

let ITEM_HEIGHT = 50;      // Height per commit item (adjust as needed)
let VISIBLE_COUNT = 10;    // Number of commit items visible at once

function initScrollytelling() {
  const scrollContainer = d3.select('#scroll-container');
  const spacer = d3.select('#spacer');
  spacer.style('height', `${(commits.length - 1) * ITEM_HEIGHT}px`);
  const itemsContainer = d3.select('#items-container');

  scrollContainer.on('scroll', () => {
    const scrollTop = scrollContainer.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    renderItems(startIndex);
  });
  renderItems(0);
}

function renderItems(startIndex) {
  const itemsContainer = d3.select('#items-container');
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);
  
  // Optionally, update the scatterplot to reflect only these commits:
  updateScatterplot(newCommitSlice);

  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .html((d, i) => {
      return `<p>
        On ${d.datetime.toLocaleString('en', { dateStyle: 'full', timeStyle: 'short' })}, I made 
        <a href="${d.url}" target="_blank">${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}</a>.
        I edited ${d.totalLines} lines.
      </p>`;
    })
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  document.getElementById('time-slider').addEventListener('input', updateTimeDisplay);
});
