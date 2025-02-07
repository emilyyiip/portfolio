import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedIndex = -1;

const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-plot');
const legend = d3.select('.legend');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

async function loadAndRenderProjects() {
    try {
        // Fetch project data from JSON
        const projects = await fetchJSON('./projects.json');

        if (!projects || projects.length === 0) {
            console.error('No project data found.');
            projectsTitle.textContent = '0 Projects';
            return;
        }

        // Update title with project count
        projectsTitle.textContent = `${projects.length} Projects`;

        // Render the initial projects and pie chart
        renderProjectsList(projects);
        renderPieChart(projects);

        // Set up search event listener
        searchInput.addEventListener('input', () => handleSearch(projects));
    } catch (error) {
        console.error('Error loading and rendering projects:', error);
    }
}

function handleSearch(projects) {
    query = searchInput.value.toLowerCase();

    // Filter projects by search query
    const filteredProjects = projects.filter(project => {
        const values = Object.values(project).join(' ').toLowerCase();
        return values.includes(query);
    });

    // Re-render the filtered projects and pie chart
    renderProjectsList(filteredProjects);
    renderPieChart(filteredProjects);
}

function renderProjectsList(projectsList) {
    if (!projectsContainer) {
        console.error('Projects container element is missing.');
        return;
    }

    // Clear previous projects
    projectsContainer.innerHTML = '';

    // Render each project using the provided `renderProjects` helper
    projectsList.forEach(project => {
        const projectArticle = renderProjects(project, 'h3');
        projectsContainer.appendChild(projectArticle);
    });
}

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
        const path = svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .on('click', () => handleSliceClick(idx, data[idx].label, projectsList))
            .on('mouseover', () => path.attr('opacity', 0.7))
            .on('mouseout', () => path.attr('opacity', 1));
    });

    // Generate legend
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', 'legend-item')
            .attr('style', `--color:${colors(idx)}`)
            .html(`
                <span class="swatch"></span>
                ${d.label} <em>(${d.value})</em>
            `)
            .on('click', () => handleSliceClick(idx, d.label, projectsList));
    });
}

function handleSliceClick(index, label, projects) {
    selectedIndex = selectedIndex === index ? -1 : index;

    // Filter projects by selected year and query
    let filteredProjects;
    if (selectedIndex !== -1) {
        filteredProjects = projects.filter(p => p.year === label);
    } else {
        filteredProjects = projects.filter(project => {
            const values = Object.values(project).join(' ').toLowerCase();
            return values.includes(query);
        });
    }

    renderProjectsList(filteredProjects);
    renderPieChart(filteredProjects);
}

// Load projects and render them when the DOM content is loaded
window.addEventListener('DOMContentLoaded', loadAndRenderProjects);
