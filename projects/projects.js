// Import the required functions from global.js
import { fetchJSON, renderProjects } from '../global.js';

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



