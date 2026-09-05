// GiveForward — Explore Page
// Browse requests and offers with filtering

import { getEntries, getUserById } from '../store.js';
import { createCard } from '../components/card.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderExplore(container) {
  const allEntries = getEntries();
  const needs = allEntries.filter(e => e.type === 'need');
  const offers = allEntries.filter(e => e.type === 'offer');

  container.innerHTML = `
    <div class="page">
      <div class="container" style="padding-top:var(--space-12);">
        <!-- Header -->
        <div class="section-header animate-fade-in-up">
          <div class="section-label"><i data-lucide="compass" style="width:16px;height:16px;"></i> Discover</div>
          <h1 class="section-title">Explore Needs & Offers</h1>
          <p class="section-subtitle">Find someone to help — or find the help you need. Every connection starts a chain.</p>
        </div>

        <!-- Filters -->
        <div class="explore-header animate-fade-in-up stagger-2">
          <div class="explore-search">
            <span class="explore-search-icon">
              <i data-lucide="search" style="width:16px;height:16px;"></i>
            </span>
            <input type="text" class="input" id="explore-search" placeholder="Search needs, offers, skills, locations..." />
          </div>
          <div class="explore-filters">
            <select class="input" id="filter-category" style="width:auto;padding:var(--space-2) var(--space-4);font-size:var(--text-sm);">
              <option value="">All Categories</option>
              <option value="education">Education</option>
              <option value="food">Food</option>
              <option value="tech">Tech</option>
              <option value="time">Time</option>
              <option value="items">Items</option>
              <option value="skills">Skills</option>
              <option value="health">Health</option>
              <option value="transport">Transport</option>
            </select>
          </div>
        </div>

        <!-- Two Columns -->
        <div class="explore-columns">
          <!-- Needs Column -->
          <div class="explore-column">
            <div class="explore-column-header">
              <i data-lucide="heart" style="width:24px;height:24px;color:var(--accent);"></i>
              <h2>People Who Need Help</h2>
              <span class="explore-column-count" id="needs-count">${needs.length}</span>
            </div>
            <div class="explore-card-list" id="needs-list"></div>
          </div>

          <!-- Offers Column -->
          <div class="explore-column">
            <div class="explore-column-header">
              <i data-lucide="hand-heart" style="width:24px;height:24px;color:var(--success);"></i>
              <h2>People Ready to Help</h2>
              <span class="explore-column-count" id="offers-count">${offers.length}</span>
            </div>
            <div class="explore-card-list" id="offers-list"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render initial cards
  renderCards(needs, offers);

  // Search handler
  const searchInput = document.getElementById('explore-search');
  const categoryFilter = document.getElementById('filter-category');

  let searchTimeout;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => filterAndRender(), 200);
  });

  categoryFilter?.addEventListener('change', () => filterAndRender());

  function filterAndRender() {
    const search = searchInput?.value || '';
    const category = categoryFilter?.value || '';

    const filtered = getEntries({ search, category });
    const filteredNeeds = filtered.filter(e => e.type === 'need');
    const filteredOffers = filtered.filter(e => e.type === 'offer');

    renderCards(filteredNeeds, filteredOffers);
  }

  // Lucide icons
  if (window.lucide) window.lucide.createIcons();

  return {};
}

function renderCards(needs, offers) {
  const needsList = document.getElementById('needs-list');
  const offersList = document.getElementById('offers-list');
  const needsCount = document.getElementById('needs-count');
  const offersCount = document.getElementById('offers-count');

  if (!needsList || !offersList) return;

  // Update counts
  if (needsCount) needsCount.textContent = needs.length;
  if (offersCount) offersCount.textContent = offers.length;

  // Render needs
  needsList.innerHTML = '';
  if (needs.length === 0) {
    needsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="search" style="width:48px;height:48px;"></i></div>
        <div class="empty-state-title">No needs found</div>
        <div class="empty-state-description">Try adjusting your search or filters.</div>
      </div>
    `;
  } else {
    needs.forEach((entry, i) => {
      const card = createCard(entry);
      card.style.animationDelay = `${i * 0.05}s`;
      needsList.appendChild(card);
    });
  }

  // Render offers
  offersList.innerHTML = '';
  if (offers.length === 0) {
    offersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="search" style="width:48px;height:48px;"></i></div>
        <div class="empty-state-title">No offers found</div>
        <div class="empty-state-description">Try adjusting your search or filters.</div>
      </div>
    `;
  } else {
    offers.forEach((entry, i) => {
      const card = createCard(entry);
      card.style.animationDelay = `${i * 0.05}s`;
      offersList.appendChild(card);
    });
  }

  // Connect button handlers
  document.querySelectorAll('.entry-connect-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entryId = btn.dataset.id;
      
      // Global requireAuth helper
      window.requireAuth(() => {
        import('../store.js').then(({ getEntries, getCurrentUser, completeMatch }) => {
          const entry = getEntries().find(e => e._id === entryId || e.id === entryId);
          if (!entry) return;
          
          const currentUser = getCurrentUser();
          if (currentUser._id === entry.userId._id) {
            showToast("You can't connect with your own post!", 'error');
            return;
          }

          showConnectionModal(entry, currentUser, completeMatch);
        });
      });
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function showConnectionModal(entry, currentUser, completeMatch) {
  const overlay = document.createElement('div');
  overlay.className = 'auth-modal-overlay animate-fade-in';
  
  const targetUser = entry.userId;
  const isOffer = entry.type === 'offer';
  
  overlay.innerHTML = `
    <div class="auth-modal card animate-scale-in" style="max-width: 500px;">
      <button class="auth-modal-close" aria-label="Close">✕</button>
      
      <div class="auth-modal-header" style="margin-bottom:var(--space-4);">
        <div class="avatar" style="background:${targetUser.color}; width:64px; height:64px; font-size:24px; margin:0 auto var(--space-3);">
          ${targetUser.initials}
        </div>
        <h2>Connect with ${targetUser.name}</h2>
        <p style="color:var(--text-muted); margin-top:var(--space-2);">
          ${isOffer ? 'They are offering' : 'They need'}: <strong>${entry.title}</strong>
        </p>
      </div>

      <div style="background:var(--bg-card); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:var(--space-6);">
        <p style="font-size:var(--text-sm); color:var(--text-muted); margin-bottom:var(--space-2);">Contact Email:</p>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <strong style="font-size:1.1rem; color:var(--primary);">${targetUser.email || 'user@giveforward.app'}</strong>
          <a href="mailto:${targetUser.email || 'user@giveforward.app'}" class="btn btn-sm btn-ghost">Send Email</a>
        </div>
        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:var(--space-3);">
          Reach out to them directly to coordinate. Once the act of generosity is complete, log it below to grow the chain!
        </p>
      </div>

      <button id="log-act-btn" class="btn btn-primary btn-block">
        Log this Connection (Grow the Chain)
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.auth-modal-close');
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const logBtn = overlay.querySelector('#log-act-btn');
  logBtn.addEventListener('click', async () => {
    const originalText = logBtn.innerHTML;
    logBtn.innerHTML = 'Logging...';
    logBtn.disabled = true;

    try {
      // If it's an offer, the current user is receiving. If a need, current user is giving.
      const fromId = isOffer ? targetUser._id : currentUser._id;
      const toId = isOffer ? currentUser._id : targetUser._id;
      
      await completeMatch(fromId, toId, entry.title, entry.category);
      
      showToast('Connection logged! The Generosity Chain has grown. 🌱', 'success');
      close();
    } catch (err) {
      showToast('Failed to log connection.', 'error');
      logBtn.innerHTML = originalText;
      logBtn.disabled = false;
    }
  });

  function close() {
    overlay.classList.add('animate-fade-out');
    overlay.querySelector('.card').classList.add('animate-scale-out');
    setTimeout(() => overlay.remove(), 300);
  }
}
