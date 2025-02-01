import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
async function loadLatestProjects() {
    const projects = await fetchJSON('./projects/projects.json');

    if (!projects) {
        console.error('Failed to load project data.');
        return;  // Stop execution if data is not available
    }

    if (!Array.isArray(projects)) {
        console.error('Invalid project data format. Expected an array.');
        return;
    }

    const latestProjects = projects.slice(0, 3);

    const projectsContainer = document.querySelector('.projects');

    if (projectsContainer) {
        latestProjects.forEach(project => {
            const projectElement = renderProjects(project, 'h2');
            projectsContainer.appendChild(projectElement);
        });
    }
}
window.addEventListener('DOMContentLoaded', loadLatestProjects);

async function loadGitHubProfile() {
    const githubData = await fetchGitHubData('emilyyiip');

    // Select the HTML element where the data will be displayed
    const profileStats = document.querySelector('#profile-stats');

    // Display the data dynamically if the element exists
    if (profileStats) {
        profileStats.innerHTML = `
            <dl>
                <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                <dt>Followers:</dt><dd>${githubData.followers}</dd>
                <dt>Following:</dt><dd>${githubData.following}</dd>
            </dl>
        `;
    }
}

window.addEventListener('DOMContentLoaded', loadGitHubProfile);

