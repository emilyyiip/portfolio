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
});

console.log('Navigation menu created:', nav);
