// GiveForward — Navbar Component

import { navigate, getCurrentPath } from '../router.js';
import { getCurrentUser, logout, on } from '../store.js';

export function renderNavbar(container) {
  let isScrolled = false;
  
  const renderContent = () => {
    const currentPath = getCurrentPath();
    const user = getCurrentUser();

    container.innerHTML = `
      <nav class="navbar ${isScrolled ? 'scrolled' : ''}">
        <div class="navbar-inner container">
          <!-- Logo -->
          <a href="#/" class="navbar-brand">
            <span class="navbar-logo-icon">🌱</span>
            <span class="navbar-logo-text">GiveForward</span>
          </a>

          <!-- Desktop Links -->
          <div class="navbar-links hidden-mobile">
            <a href="#/" class="navbar-link ${currentPath === '/' ? 'active' : ''}">Home</a>
            <a href="#/explore" class="navbar-link ${currentPath === '/explore' ? 'active' : ''}">Explore</a>
            <a href="#/impact" class="navbar-link ${currentPath === '/impact' ? 'active' : ''}">Impact</a>
            <a href="#/about" class="navbar-link ${currentPath === '/about' ? 'active' : ''}">About</a>
          </div>

          <!-- Auth & Actions -->
          <div class="navbar-actions hidden-mobile">
            <button class="btn btn-primary btn-sm" id="nav-create-btn">
              <i data-lucide="plus" style="width:16px;height:16px;"></i>
              Give Forward
            </button>
            
            ${user ? `
              <div class="dropdown">
                <button class="avatar" style="background:${user.color}; border:none; cursor:pointer;" id="user-menu-btn">
                  ${user.initials}
                </button>
                <div class="dropdown-menu" id="user-menu" style="display:none; position:absolute; right:0; top:48px; background:var(--bg-surface); border:1px solid var(--border-subtle); padding:var(--space-2); border-radius:var(--radius-md); min-width:150px;">
                  <div style="padding:var(--space-2); font-weight:var(--font-semibold); border-bottom:1px solid var(--border-subtle);">${user.name}</div>
                  <button id="nav-logout-btn" style="width:100%; text-align:left; padding:var(--space-2); background:none; border:none; color:var(--text-primary); cursor:pointer;">Sign Out</button>
                </div>
              </div>
            ` : `
              <button class="btn btn-ghost btn-sm" id="nav-login-btn">
                Sign In
              </button>
            `}
          </div>

          <!-- Mobile Toggle -->
          <button class="navbar-mobile-toggle" aria-label="Menu" id="mobile-menu-btn">
            <i data-lucide="menu"></i>
          </button>
        </div>
        
        <!-- Mobile Menu -->
        <div class="navbar-mobile-menu" id="mobile-menu" style="display:none;">
           <a href="#/" class="navbar-link ${currentPath === '/' ? 'active' : ''}">Home</a>
           <a href="#/explore" class="navbar-link ${currentPath === '/explore' ? 'active' : ''}">Explore</a>
           <a href="#/impact" class="navbar-link ${currentPath === '/impact' ? 'active' : ''}">Impact</a>
           <a href="#/about" class="navbar-link ${currentPath === '/about' ? 'active' : ''}">About</a>
           
           <hr style="border-color:var(--border-subtle); margin:var(--space-4) 0;" />
           
           ${user ? `
             <div style="padding:var(--space-3) 0;">Signed in as <strong>${user.name}</strong></div>
             <button class="btn btn-primary btn-block" id="mobile-create-btn">Give Forward</button>
             <button class="btn btn-ghost btn-block" style="margin-top:var(--space-3);" id="mobile-logout-btn">Sign Out</button>
           ` : `
             <button class="btn btn-primary btn-block" id="mobile-create-btn">Give Forward</button>
             <button class="btn btn-ghost btn-block" style="margin-top:var(--space-3);" id="mobile-login-btn">Sign In</button>
           `}
        </div>
      </nav>
    `;

    // Re-initialize icons
    if (window.lucide) window.lucide.createIcons();
    attachEvents();
  };

  const attachEvents = () => {
    // Actions
    document.getElementById('nav-create-btn')?.addEventListener('click', () => {
      window.requireAuth(() => navigate('/create'));
    });
    document.getElementById('mobile-create-btn')?.addEventListener('click', () => {
      window.requireAuth(() => navigate('/create'));
    });

    document.getElementById('nav-login-btn')?.addEventListener('click', () => {
      window.requireAuth(() => {});
    });
    document.getElementById('mobile-login-btn')?.addEventListener('click', () => {
      window.requireAuth(() => {});
    });

    document.getElementById('nav-logout-btn')?.addEventListener('click', logout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', logout);

    // User Menu Toggle
    const userBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    if (userBtn && userMenu) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
      });
      document.addEventListener('click', () => {
        userMenu.style.display = 'none';
      });
    }

    // Mobile Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn?.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'flex' : 'none';
      }
    });
  };

  // Scroll effect
  const handleScroll = () => {
    const shouldBeScrolled = window.scrollY > 20;
    if (isScrolled !== shouldBeScrolled) {
      isScrolled = shouldBeScrolled;
      const nav = container.querySelector('.navbar');
      if (nav) {
        if (isScrolled) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll);

  // Initial render
  renderContent();

  // Re-render when auth changes
  const unsubscribe = on('auth:change', renderContent);

  return {
    unmount() {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    }
  };
}
