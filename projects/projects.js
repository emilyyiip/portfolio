// Import the required functions from global.js
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadAndRenderProjects() {
    try {
        // Fetch project data from JSON
        const projectData = await fetchJSON('./projects.json');

        // Get the projects container and title element
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (!projectData || projectData.length === 0) {
            console.error('No project data found.');
            projectsTitle.textContent = '0 Projects';
            return;
        }

        if (!projectsContainer) {
            console.error('Projects container element is missing.');
            return;
        }

        // Clear the container to prevent duplication
        projectsContainer.innerHTML = '';

        // Update the title to display the count before the word "Projects"
        projectsTitle.textContent = `${projectData.length} Projects`;

        // Loop through each project and render it
        projectData.forEach(project => {
            const projectArticle = renderProjects(project, 'h3');
            projectsContainer.appendChild(projectArticle);
        });

    } catch (error) {
        console.error('Error loading and rendering projects:', error);
    }
}

// Run the function when the DOM content is loaded
window.addEventListener('DOMContentLoaded', loadAndRenderProjects);

let query = '';
let selectedIndex = -1;

const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-plot');
const legend = d3.select('.legend');

// Fetch projects from JSON
d3.json('projects.json').then((projects) => {
  // Initial render
  renderPieChart(projects);

  // Event listener for search
  searchInput.addEventListener('input', () => handleSearch(projects));
});

function handleSearch(projects) {
  query = searchInput.value.toLowerCase();

  // Filter projects by search query
  let filteredProjects = projects.filter(project => {
    let values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query);
  });

  // Re-render projects and pie chart with filtered data
  renderProjects(filteredProjects);
  renderPieChart(filteredProjects);
}

function renderProject(projectsList) {
  console.log('Rendering projects:', projectsList);
  // Implement this to display projects in the DOM
}

function renderPieChart(projectsList) {
  // Group projects by year
  let rolledData = d3.rollups(
    projectsList,
    (v) => v.length,
    (d) => d.year
  );

  // Transform data for D3
  let data = rolledData.map(([year, count]) => ({ label: year, value: count }));

  // Clear existing paths and legend
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // Generate pie slices
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw paths for each slice
  arcData.forEach((d, idx) => {
    let path = svg.append('path')
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

  // Filter projects based on selection and query
  let filteredProjects;
  if (selectedIndex !== -1) {
    filteredProjects = projects.filter(p => p.year === label);
  } else {
    filteredProjects = projects.filter(project => {
      let values = Object.values(project).join(' ').toLowerCase();
      return values.includes(query);
    });
  }

  renderProject(filteredProjects);
  renderPieChart(filteredProjects);
}
