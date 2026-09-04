// GiveForward — Navbar Component

import { navigate, getCurrentPath } from '../router.js';

export function renderNavbar(container) {
  container.innerHTML = `
    <div class="navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand" id="nav-brand">
          <span class="navbar-brand-icon">🌱</span>
          <span class="navbar-brand-text">GiveForward</span>
        </a>
        
        <div class="navbar-nav" id="nav-links">
          <a href="#/" class="navbar-link" data-path="/">Home</a>
          <a href="#/explore" class="navbar-link" data-path="/explore">Explore</a>
          <a href="#/impact" class="navbar-link" data-path="/impact">Impact</a>
          <a href="#/about" class="navbar-link" data-path="/about">About</a>
          <a href="#/create" class="btn btn-primary btn-sm navbar-cta" id="nav-cta">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            Give Forward
          </a>
        </div>

        <button class="btn btn-ghost btn-icon navbar-menu-btn" id="nav-menu-btn" aria-label="Menu">
          <i data-lucide="menu" style="width:20px;height:20px;"></i>
        </button>
      </div>
    </div>
  `;

  // Mobile menu toggle
  const menuBtn = document.getElementById('nav-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('nav-mobile-open');
    });
  }

  // Close mobile menu on navigation
  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('navbar-link') || e.target.closest('.navbar-cta')) {
      navLinks.classList.remove('nav-mobile-open');
    }
  });

  // Set initial active state
  updateActive();

  // Listen for hash changes
  window.addEventListener('hashchange', updateActive);

  // Scroll effect — make navbar more opaque on scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const navbar = container.querySelector('.navbar');
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(5, 5, 16, 0.9)';
        } else {
          navbar.style.background = 'rgba(5, 5, 16, 0.7)';
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateActive() {
  const path = getCurrentPath();
  document.querySelectorAll('.navbar-link').forEach((link) => {
    const linkPath = link.getAttribute('data-path');
    link.classList.toggle('active', linkPath === path);
  });
}
