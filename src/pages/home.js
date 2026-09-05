// GiveForward — Home Page
// Full-viewport hero with animated generosity network

import { createNetworkGraph } from '../components/network-graph.js';
import { getNetworkData, getStats } from '../store.js';
import { navigate } from '../router.js';

let graph = null;

export function renderHome(container) {
  const stats = getStats();

  container.innerHTML = `
    <div class="page page-hero">
      <!-- Hero Section -->
      <section class="hero" id="hero-section">
        <div class="hero-graph" id="hero-graph"></div>
        <div class="hero-overlay">
          <div class="hero-content animate-fade-in-up">
            <div class="hero-badge">
              <span class="hero-badge-dot"></span>
              International Day of Charity · September 5
            </div>
            <h1 class="hero-title">
              One good act doesn't<br/>have to end with <span class="hero-highlight">you</span>
            </h1>
            <p class="hero-subtitle">
              GiveForward connects people who need help with people ready to give it.
              Every completed act creates a visible chain of generosity — watch your kindness ripple forward.
            </p>
            <div class="hero-actions">
              <button class="btn btn-accent btn-lg" id="hero-need-btn">
                <i data-lucide="heart" style="width:18px;height:18px;"></i>
                I Need Help
              </button>
              <button class="btn btn-success btn-lg" id="hero-offer-btn">
                <i data-lucide="hand-heart" style="width:18px;height:18px;"></i>
                I Can Help
              </button>
            </div>
          </div>

          <!-- Floating Stats -->
          <div class="hero-stats animate-fade-in-up stagger-3">
            <div class="hero-stat">
              <div class="hero-stat-value" data-count="${stats.totalActs}">${stats.totalActs}</div>
              <div class="hero-stat-label">Acts of Generosity</div>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <div class="hero-stat-value" data-count="${stats.peopleHelped}">${stats.peopleHelped}</div>
              <div class="hero-stat-label">People Connected</div>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <div class="hero-stat-value" data-count="${stats.hoursGiven}">${stats.hoursGiven}</div>
              <div class="hero-stat-label">Hours Given</div>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <div class="hero-stat-value" data-count="${stats.chainsStarted}">${stats.chainsStarted}</div>
              <div class="hero-stat-label">Chains Started</div>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="hero-scroll animate-fade-in stagger-5">
          <div class="hero-scroll-line"></div>
          <span>Scroll to learn more</span>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works page-section" id="how-it-works">
        <div class="container">
          <div class="section-header" style="text-align:center;">
            <div class="section-label" style="justify-content:center;"><i data-lucide="help-circle" style="width:16px;height:16px;"></i> How It Works</div>
            <h2 class="section-title">Generosity That Propagates</h2>
            <p class="section-subtitle" style="margin:0 auto;">
              Every act of kindness creates a chain. Your help inspires the person you helped to help someone else.
            </p>
          </div>

          <div class="steps-grid grid grid-3">
            <div class="step-card card animate-fade-in-up stagger-1" style="text-align:center;">
              <div class="step-icon" style="margin-bottom:var(--space-4);"><i data-lucide="handshake" style="width:32px;height:32px;color:var(--primary);"></i></div>
              <h3 class="step-title">1. Share Need or Offer</h3>
              <p class="step-desc">Tell us in your own words. No forms, no checkboxes.</p>
            </div>
            
            <div class="step-card card animate-fade-in-up stagger-3" style="text-align:center;">
              <div class="step-icon" style="margin-bottom:var(--space-4);"><i data-lucide="sparkles" style="width:32px;height:32px;color:var(--accent);"></i></div>
              <h3 class="step-title">2. Find Your Match</h3>
              <p class="step-desc">We connect needs and offers to find meaningful connections.</p>
            </div>
            
            <div class="step-card card animate-fade-in-up stagger-5" style="text-align:center;">
              <div class="step-icon" style="margin-bottom:var(--space-4);"><i data-lucide="leaf" style="width:32px;height:32px;color:var(--success);"></i></div>
              <h3 class="step-title">3. Watch It Grow</h3>
              <p class="step-desc">When you help someone, they're inspired to help another. Your single act ripples.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Chain Stories Section -->
      <section class="chain-stories page-section" id="chain-stories">
        <div class="container">
          <div class="section-header" style="text-align:center;">
            <div class="section-label" style="justify-content:center;"><i data-lucide="activity" style="width:16px;height:16px;"></i> Live Chains</div>
            <h2 class="section-title">Generosity In Action</h2>
            <p class="section-subtitle" style="margin:0 auto;">
              Real chains of kindness rippling through our community right now.
            </p>
          </div>

          <div class="chains-showcase" id="chains-showcase"></div>

          <div style="text-align:center;margin-top:var(--space-10);">
            <button class="btn btn-primary btn-lg" id="explore-btn">
              <i data-lucide="compass" style="width:18px;height:18px;"></i>
              Explore All Needs & Offers
            </button>
          </div>
        </div>
      </section>
    </div>
  `;

  // Initialize network graph
  initGraph();

  // Render chain stories
  renderChainStories();

  // Button handlers
  document.getElementById('hero-need-btn')?.addEventListener('click', () => navigate('/create'));
  document.getElementById('hero-offer-btn')?.addEventListener('click', () => navigate('/create'));
  document.getElementById('explore-btn')?.addEventListener('click', () => navigate('/explore'));

  // Animate stat counters
  animateCounters();

  // Re-init Lucide icons
  if (window.lucide) window.lucide.createIcons();

  return {
    unmount() {
      if (graph) {
        graph.destroy();
        graph = null;
      }
    },
  };
}

function initGraph() {
  const graphContainer = document.getElementById('hero-graph');
  if (!graphContainer) return;

  const networkData = getNetworkData();

  graph = createNetworkGraph(graphContainer, networkData, {
    width: window.innerWidth,
    height: window.innerHeight,
    interactive: true,
    showLabels: true,
    animate: true,
  });

  // Resize handler
  const resizeHandler = () => {
    if (graph) {
      graph.resize(window.innerWidth, window.innerHeight);
    }
  };
  window.addEventListener('resize', resizeHandler);
}

function renderChainStories() {
  const showcase = document.getElementById('chains-showcase');
  if (!showcase) return;

  const { seedChains } = getNetworkData().links.length > 0
    ? { seedChains: null }
    : { seedChains: null };

  // Import chains from store
  import('../store.js').then(({ getChains, getUserById }) => {
    const chains = getChains();

    showcase.innerHTML = chains.slice(0, 3).map((chain, idx) => `
      <div class="chain-story card card-glow animate-fade-in-up stagger-${idx + 1}" data-chain="${chain.id}">
        <div class="chain-story-header">
          <h3 class="chain-story-name">${chain.name}</h3>
          <span class="tag tag-primary">${chain.acts.length} acts</span>
        </div>
        <div class="chain-story-flow">
          ${chain.acts.map((act, i) => {
            const fromUser = getUserById(act.from);
            const toUser = getUserById(act.to);
            return `
              <div class="chain-step">
                <div class="chain-step-avatar avatar avatar-sm" style="background:${fromUser?.color || '#6C5CE7'}">${fromUser?.initials || '??'}</div>
                <div class="chain-step-info">
                  <span class="chain-step-name">${fromUser?.name || 'Someone'}</span>
                  <span class="chain-step-action">${act.action}</span>
                </div>
                ${i < chain.acts.length - 1 ? '<div class="chain-step-arrow">→</div>' : `
                  <div class="chain-step-arrow">→</div>
                  <div class="chain-step-avatar avatar avatar-sm" style="background:${toUser?.color || '#6C5CE7'}">${toUser?.initials || '??'}</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Chain hover → highlight in graph
    showcase.querySelectorAll('.chain-story').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (graph) graph.highlightChain(el.dataset.chain);
      });
      el.addEventListener('mouseleave', () => {
        if (graph) graph.resetHighlight();
      });
    });
  });
}

function animateCounters() {
  const counters = document.querySelectorAll('.hero-stat-value[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateNumber(el, 0, target, 1500);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateNumber(el, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + range * eased);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
