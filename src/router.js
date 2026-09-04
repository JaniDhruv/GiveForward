// GiveForward — Hash-based SPA Router

const routes = {};
let currentPage = null;
let pageContainer = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentPath() {
  return window.location.hash.slice(1) || '/';
}

async function handleRoute() {
  const path = getCurrentPath();
  const handler = routes[path] || routes['/'];

  if (!handler) {
    console.error(`No route handler for: ${path}`);
    return;
  }

  if (!pageContainer) {
    pageContainer = document.getElementById('page-container');
  }

  // Unmount current page
  if (currentPage && currentPage.unmount) {
    currentPage.unmount();
  }

  // Transition out
  pageContainer.style.opacity = '0';
  pageContainer.style.transform = 'translateY(8px)';

  await new Promise((r) => setTimeout(r, 150));

  // Clear and mount new page
  pageContainer.innerHTML = '';
  currentPage = await handler(pageContainer);

  // Transition in
  requestAnimationFrame(() => {
    pageContainer.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    pageContainer.style.opacity = '1';
    pageContainer.style.transform = 'translateY(0)';
  });

  // Update active nav link
  updateNavActive(path);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function updateNavActive(path) {
  document.querySelectorAll('.navbar-link').forEach((link) => {
    const href = link.getAttribute('href')?.replace('#', '') || '/';
    link.classList.toggle('active', href === path);
  });
}

export function initRouter() {
  pageContainer = document.getElementById('page-container');

  // Set initial transition style
  pageContainer.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  window.addEventListener('hashchange', handleRoute);

  // Handle initial load
  if (!window.location.hash) {
    window.location.hash = '/';
  } else {
    handleRoute();
  }
}
