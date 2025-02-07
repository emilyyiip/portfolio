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
let data = [1, 2];  // Two slices: one 33% and one 66%

// Calculate the total sum of the data values
let total = d3.sum(data);

// Calculate the start and end angles for each slice
let angle = 0;
let arcData = [];
for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

// Create an arc generator
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);  // Adjust as needed for size

// Generate the arcs (SVG path data)
let arcs = arcData.map((d) => arcGenerator(d));

// Define colors for the slices
let colors = ['gold', 'purple'];

// Select the SVG and append paths for each slice
arcs.forEach((arc, idx) => {
  d3.select('#projects-plot')  // Ensure this matches the ID in your HTML
    .append('path')
    .attr('d', arc)            // Set the arc path
    .attr('fill', colors[idx]) // Set the color
    .attr('stroke', 'white')   // Optional: Add stroke for better visibility
    .attr('stroke-width', 2);
});



