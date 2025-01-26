console.log("Hello, world!");
console.log('IT’S ALIVE!');

// Helper function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Check if we are on the homepage
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Get all navigation links
const navLinks = $$("nav a");

// Find the link that matches the current page
const currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

// Add the 'current' class to the current page link
currentLink?.classList.add('current');

// Page links
let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'portfolio/projects/index.html', title: 'Projects' },
  { url: 'portfolio/contact/index.html', title: 'Contact' },
  { url: 'portfolio/resume/index.html', title: 'Resume' },
  { url: 'https://github.com/emilyyiip', title: 'Github' },
];

// Create the navigation menu
let nav = document.createElement('nav');
let ul = document.createElement('ul'); // Create a <ul> element
nav.appendChild(ul); // Add <ul> to the <nav>
document.body.prepend(nav); // Add <nav> to the body

console.log('Nav element:', nav);
console.log('Pages array:', pages);

// Create <li> and <a> elements for each page
for (let p of pages) {
  let li = document.createElement('li'); // Create a <li> element
  let a = document.createElement('a'); // Create an <a> element

  // Adjust the URL if not on the homepage and it's not an absolute URL
  let url = p.url;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  a.href = url; // Set the href attribute
  a.textContent = p.title; // Set the text content
  li.appendChild(a); // Add <a> to <li>
  ul.appendChild(li); // Add <li> to <ul>
}
