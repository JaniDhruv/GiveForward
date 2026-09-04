// GiveForward — Main Entry Point

import { initStore } from './store.js';
import { initRouter, registerRoute } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderHome } from './pages/home.js';
import { renderExplore } from './pages/explore.js';
import { renderCreate } from './pages/create.js';
import { renderImpact } from './pages/impact.js';
import { renderAbout } from './pages/about.js';

function init() {
  // Initialize state
  initStore();

  // Render navbar
  renderNavbar(document.getElementById('navbar'));

  // Register routes
  registerRoute('/', renderHome);
  registerRoute('/explore', renderExplore);
  registerRoute('/create', renderCreate);
  registerRoute('/impact', renderImpact);
  registerRoute('/about', renderAbout);

  // Start router
  initRouter();

  // Initialize Lucide icons (loaded via CDN)
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log('🌱 GiveForward — Generosity That Ripples');
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
