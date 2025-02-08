import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';

function renderPieChart(projectsList) {
    // Group projects by year
    const rolledData = d3.rollups(
        projectsList,
        (v) => v.length,
        (d) => d.year
    );

    // Transform data for D3
    const data = rolledData.map(([year, count]) => ({ label: year, value: count }));

    // Clear existing paths and legend
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // Generate pie slices
    const sliceGenerator = d3.pie().value(d => d.value);
    const arcData = sliceGenerator(data);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Draw paths for each slice
    arcData.forEach((d, idx) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('stroke-width', 2)
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .on('click', () => handleSliceClick(idx, data[idx].label, projectsList));
    });

    // Generate legend
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', `legend-item ${idx === selectedIndex ? 'selected' : ''}`)
            .attr('style', `--color:${colors(idx)}`)
            .html(`
                <span class="swatch"></span>
                ${d.label} <em>(${d.value})</em>
            `)
            .on('click', () => handleSliceClick(idx, d.label, projectsList));
    });
}

function handleSliceClick(index, label, projects) {
    // Toggle selection
    selectedIndex = selectedIndex === index ? -1 : index;

    // Filter projects based on both query and selected slice
    const filteredProjects = projects.filter(project => {
        const matchesQuery = Object.values(project).join(' ').toLowerCase().includes(query);
        const matchesYear = selectedIndex === -1 || project.year === label;
        return matchesQuery && matchesYear;
    });

    // Update both project list and chart state
    renderProjectsList(filteredProjects);
    updateChartSelectionState();
}

function updateChartSelectionState() {
    // Update path classes
    svg.selectAll('path').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

    // Update legend classes
    legend.selectAll('li').attr('class', (_, idx) => `legend-item ${idx === selectedIndex ? 'selected' : ''}`);
}
