// Log initialization messages
console.log("Hello, world!");
console.log("IT’S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
// Check if we are on the homepage
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Page links
const pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'resume/index.html', title: 'Resume' },
  { url: 'https://github.com/emilyyiip', title: 'GitHub' },
];

// Create the navigation menu
const nav = document.createElement('nav');
const ul = document.createElement('ul'); // Create a <ul> element
nav.appendChild(ul); // Add <ul> to <nav>
document.body.prepend(nav); // Add <nav> to the body

// Generate links
pages.forEach((page) => {
  const li = document.createElement('li'); // Create <li>
  const a = document.createElement('a'); // Create <a>

  // Adjust URL if not on homepage and it's not an absolute URL
  let url = page.url;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Set href and text
  a.href = url;
  a.textContent = page.title;

  // Highlight the current page
  if (location.pathname.endsWith(page.url)) {
    a.classList.add('current');
  }

  li.appendChild(a); // Append <a> to <li>
  ul.appendChild(li); // Append <li> to <ul>

  console.log(a)
  if(a.host != location.host){
    console.log("not same" + a.host)
    a.target = "_blank";
  }
});

console.log('Navigation menu created:', nav);

// Dropdown
// Insert the theme switcher at the top of the body
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-switcher">
      <option value="auto" selected>Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);
// Function to apply the theme
function applyTheme(theme) {
  const root = document.documentElement; // Reference to the <html> element

  // Remove existing theme classes
  root.classList.remove('light', 'dark');

  // Apply the selected theme
  if (theme === 'light') {
    root.classList.add('light');
  } else if (theme === 'dark') {
    root.classList.add('dark');
  }

  // Save the user preference in localStorage
  localStorage.setItem('colorScheme', theme);
}
// Detect the system theme and apply it (for "auto" mode)
function detectSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Initialize the theme based on the saved preference or system default
const savedTheme = localStorage.getItem('colorScheme') || 'auto';
applyTheme(savedTheme === 'auto' ? detectSystemTheme() : savedTheme);

// Update the dropdown to reflect the saved preference
const themeSwitcher = document.getElementById('theme-switcher');
themeSwitcher.value = savedTheme;

// Listen for dropdown changes
themeSwitcher.addEventListener('change', (event) => {
  const theme = event.target.value;
  applyTheme(theme === 'auto' ? detectSystemTheme() : theme);
});

// Select all articles inside the .projects div and map over them
document.querySelectorAll('.projects > article').forEach((a) => {
  // Extract project data
  const title = a.querySelector('h2')?.textContent.trim() || '';
  const image = a.querySelector('img')?.getAttribute('src') || '';
  const description = a.querySelector('p')?.textContent.trim() || '';

  console.log({ title, image, description });  // Log the result to the console
});

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(`Failed to fetch JSON data: ${response.statusText || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);  // Add a log to see the fetched data
      return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      return null;  // Return null to prevent further issues
  }
}


export function renderProjects(project, headingTag = 'h3') {
  // Create the project article element
  const article = document.createElement('article');

  // Add a title
  const title = document.createElement(headingTag);
  title.textContent = project.title;
  article.appendChild(title);

  // Add the year (new addition)
  const year = document.createElement('p');
  year.textContent = `Year: ${project.year}`;  // Display the year here
  article.appendChild(year);

  // Add a description
  const description = document.createElement('p');
  description.textContent = project.description;
  article.appendChild(description);

  // Add an image
  const image = document.createElement('img');
  image.src = project.image;
  image.alt = project.title || 'Project image';
  article.appendChild(image);

  return article;
}


