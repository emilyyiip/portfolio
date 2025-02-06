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

// Data for the pie chart
let data = [1, 2];  // Two data points for slices

// Colors for each slice
let colors = ['gold', 'purple'];

// Create an arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Calculate total and generate arc data
let total = data.reduce((acc, val) => acc + val, 0);
let angle = 0;
let arcData = [];

data.forEach((d) => {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
});

// Generate arcs and append them to the SVG element
arcData.forEach((arcData, idx) => {
  let pathData = arcGenerator(arcData);

  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', pathData)
    .attr('fill', colors[idx])
    .attr('stroke', 'white') // Optional: Add a border between slices
    .attr('stroke-width', 1);
});




