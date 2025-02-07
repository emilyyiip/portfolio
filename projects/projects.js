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


// Define the data with labels and values
let data = [
    { label: 'A', value: 1 },
    { label: 'B', value: 2 },
    { label: 'C', value: 3 },
    { label: 'D', value: 4 },
    { label: 'E', value: 5 },
    { label: 'F', value: 6 }
  ];
  
  // Create a pie slice generator
  let sliceGenerator = d3.pie()
    .value(d => d.value);  // Use the value property from data objects
  
  // Generate arc data
  let arcData = sliceGenerator(data);
  
  // Create an arc generator
  let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);
  
  // Define a color scale
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  // Select the SVG and append paths for each slice
  arcData.forEach((d, idx) => {
    d3.select('#projects-plot')
      .append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(idx))
      .attr('stroke-width', 2);
  });
  
  // Generate the legend
  let legend = d3.select('.legend');
  
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`
        <span class="swatch"></span>
        ${d.label} <em>(${d.value})</em>
      `);
  });
  