// Log initialization messages
console.log("Hello, world!");
console.log("IT’S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Check if we are on the homepage
const IS_HOMEPAGE = document.documentElement.classList.contains('home');

// Page links
const pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'resume/index.html', title: 'Resume' },
  { url: 'https://github.com/emilyyiip', title: 'GitHub' },
];

console.log('Pages array:', pages);

// Create the navigation menu
const nav = document.createElement('nav');
const ul = document.createElement('ul'); // Create a <ul> element
nav.appendChild(ul); // Add <ul> to the <nav>
document.body.prepend(nav); // Add <nav> to the body

console.log('Nav element created:', nav);

// Create <li> and <a> elements for each page
pages.forEach((page) => {
  const li = document.createElement('li'); // Create a <li> element
  const a = document.createElement('a'); // Create an <a> element

  // Adjust the URL if not on the homepage and it's not an absolute URL
  let url = page.url;
  if (!IS_HOMEPAGE && !url.startsWith('http')) {
    url = './' + url; // Use relative paths starting with './' to avoid issues
  }

  a.href = url; // Set the href attribute
  a.textContent = page.title; // Set the text content

  // Add the 'current' class if this is the current page
  if (location.pathname.endsWith(page.url)) {
    a.classList.add('current');
  }

  li.appendChild(a); // Add <a> to <li>
  ul.appendChild(li); // Add <li> to <ul>
});

console.log('Navigation menu created successfully');