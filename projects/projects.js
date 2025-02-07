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

// Define the data for the pie chart
let data = [1, 2];

// Define a color scale for the slices
let colorScale = d3.scaleOrdinal()
  .domain(data)
  .range(["red", "blue"]);

// Calculate total sum of data values
let total = d3.sum(data);

// Generate arc data (start and end angles for each slice)
let angle = 0;
let arcData = data.map(d => {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  let arcSegment = { startAngle: angle, endAngle: endAngle };
  angle = endAngle;
  return arcSegment;
});

// Create an arc generator with D3
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// Select the SVG element and add paths for each arc segment
arcData.forEach((arcSegment, index) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arcGenerator(arcSegment))
    .attr('fill', colorScale(index));
});





