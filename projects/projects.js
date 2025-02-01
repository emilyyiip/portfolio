// Import from the parent directory where global.js is located
import { fetchJSON, renderProjects } from '../global.js';

async function loadAndRenderProjects() {
    const projectData = await fetchJSON('./projects.json');
    const projectsContainer = document.querySelector('.projects');

    if (projectData && projectsContainer) {
        // Clear and render each project with a dynamic heading level
        projectsContainer.innerHTML = '';
        projectData.forEach(project => {
            renderProjects(project, projectsContainer, 'h3');
        });
    }
}

window.addEventListener('DOMContentLoaded', loadAndRenderProjects);


