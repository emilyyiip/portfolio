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
