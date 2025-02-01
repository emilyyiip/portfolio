// Import the required functions from global.js
import { fetchJSON, renderProjects } from '../global.js';

async function loadAndRenderProjects() {
    try {
        // Fetch project data from the JSON file
        const projectData = await fetchJSON('./projects.json');

        // Check if data was successfully fetched
        if (!projectData || projectData.length === 0) {
            console.error('No project data found.');
            return;
        }

        // Find the container element where projects will be displayed
        const projectsContainer = document.querySelector('.projects');

        if (!projectsContainer) {
            console.error('Projects container element is missing.');
            return;
        }

        // Clear the container to prevent duplication
        projectsContainer.innerHTML = '';

        // Loop through each project and render it
        projectData.forEach(project => {
            const projectArticle = renderProjects(project, 'h3');
            projectsContainer.appendChild(projectArticle); // Append the project article to the container
        });
    } catch (error) {
        console.error('Error loading and rendering projects:', error);
    }
}

// Run the function when the DOM content is loaded
window.addEventListener('DOMContentLoaded', loadAndRenderProjects);

