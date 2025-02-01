import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
async function loadLatestProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);

    // Select the container for the latest projects
    const projectsContainer = document.querySelector('.projects');

    // Render the latest projects if the container exists
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

