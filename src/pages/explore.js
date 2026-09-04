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
          <div class="section-label">🔍 Discover</div>
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
              <option value="education">📚 Education</option>
              <option value="food">🍱 Food</option>
              <option value="tech">💻 Tech</option>
              <option value="time">🕐 Time</option>
              <option value="items">📦 Items</option>
              <option value="skills">🎯 Skills</option>
              <option value="health">🩺 Health</option>
              <option value="transport">🚗 Transport</option>
            </select>
          </div>
        </div>

        <!-- Two Columns -->
        <div class="explore-columns">
          <!-- Needs Column -->
          <div class="explore-column">
            <div class="explore-column-header">
              <span style="font-size:1.5rem;">❤️</span>
              <h2>People Who Need Help</h2>
              <span class="explore-column-count" id="needs-count">${needs.length}</span>
            </div>
            <div class="explore-card-list" id="needs-list"></div>
          </div>

          <!-- Offers Column -->
          <div class="explore-column">
            <div class="explore-column-header">
              <span style="font-size:1.5rem;">💚</span>
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
        <div class="empty-state-icon">🔍</div>
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
        <div class="empty-state-icon">🔍</div>
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
      showToast('Connection request sent! We\'ll notify you when matched.', 'success');
    });
  });

  // Re-init Lucide icons
  if (window.lucide) window.lucide.createIcons();
}
