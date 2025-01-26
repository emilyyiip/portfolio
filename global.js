console.log("Hello, world!");

console.log('IT’S ALIVE!');

// Helper function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Get all navigation links
const navLinks = $$("nav a");

// Find the link that matches the current page
const currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

// Add the 'current' class to the current page link
currentLink?.classList.add('current');

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'resume/index.html', title: 'Resume' },
  { url: 'https://github.com/emilyyiip', title: 'Github' },
];

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
  a.href = p.url; // Set the href attribute
  a.textContent = p.title; // Set the text content
  li.appendChild(a); // Add <a> to <li>
  ul.appendChild(li); // Add <li> to <ul>
}
