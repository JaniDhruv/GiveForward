// GiveForward — Impact Page
// Personal generosity chain visualization + stats

import { createNetworkGraph } from '../components/network-graph.js';
import { createStatsCounter } from '../components/stats-counter.js';
import { getNetworkData, getUserStats, getUserChains, getCurrentUser, getStats } from '../store.js';
import { navigate } from '../router.js';

let graph = null;

export function renderImpact(container) {
  const user = getCurrentUser();
  const userStats = getUserStats(user._id);
  const userChains = getUserChains(user._id);
  const globalStats = getStats();

  container.innerHTML = `
    <div class="page">
      <div class="container" style="padding-top:var(--space-12);padding-bottom:var(--space-16);">
        <!-- Header -->
        <div class="section-header animate-fade-in-up" style="text-align:center;">
          <div class="section-label" style="justify-content:center;"><i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i> Your Impact</div>
          <h1 class="section-title">Your Generosity Ripple</h1>
          <p class="section-subtitle" style="margin:0 auto;">
            See how your acts of kindness have rippled through the community.
          </p>
        </div>

        <!-- User Profile Card -->
        <div class="impact-profile card animate-fade-in-up stagger-2">
          <div class="impact-profile-inner">
            <div class="avatar avatar-xl" style="background:${user.color};">${user.initials}</div>
            <div class="impact-profile-info">
              <h2 class="impact-profile-name">${user.name}</h2>
              <p class="impact-profile-tagline">Your generosity has reached <strong style="color:var(--primary-light);">${userStats.peopleReached} people</strong></p>
            </div>
            <div class="impact-profile-badge animate-pulse-glow" style="display:flex;align-items:center;gap:12px;">
              <i data-lucide="leaf" style="width:32px;height:32px;color:var(--primary);"></i>
              <div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Chain Starter</div>
                <div style="font-size:var(--text-sm);font-weight:var(--font-bold);color:var(--success);">${userStats.chainsStarted} chain${userStats.chainsStarted !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Stats -->
        <div class="impact-stats animate-fade-in-up stagger-3" id="impact-stats"></div>

        <!-- Personal Network Graph -->
        <div class="impact-graph-section animate-fade-in-up stagger-4">
          <div class="section-header" style="text-align:center;">
            <div class="section-label" style="justify-content:center;"><i data-lucide="git-merge" style="width:16px;height:16px;"></i> Your Network</div>
            <h2 class="section-title" style="font-size:var(--text-2xl);">Your Generosity Chain</h2>
          </div>
          <div class="impact-graph card" id="impact-graph"></div>
        </div>

        <!-- Chain Stories -->
        <div class="impact-chains animate-fade-in-up stagger-5">
          <div class="section-header" style="text-align:center;">
            <div class="section-label" style="justify-content:center;"><i data-lucide="git-commit" style="width:16px;height:16px;"></i> Your Chains</div>
            <h2 class="section-title" style="font-size:var(--text-2xl);">Chains You're Part Of</h2>
          </div>
          <div class="impact-chain-list" id="chain-list"></div>
        </div>

        <!-- Global Impact -->
        <div class="impact-global animate-fade-in-up stagger-6">
          <div class="section-header" style="text-align:center;">
            <div class="section-label" style="justify-content:center;"><i data-lucide="globe" style="width:16px;height:16px;"></i> Community Impact</div>
            <h2 class="section-title" style="font-size:var(--text-2xl);">The Bigger Picture</h2>
          </div>
          <div class="impact-global-stats">
            <div class="impact-global-stat">
              <div class="impact-global-value">${globalStats.totalActs}</div>
              <div class="impact-global-label">Total Acts</div>
            </div>
            <div class="impact-global-stat">
              <div class="impact-global-value">${globalStats.peopleHelped}</div>
              <div class="impact-global-label">People Helped</div>
            </div>
            <div class="impact-global-stat">
              <div class="impact-global-value">${globalStats.hoursGiven}</div>
              <div class="impact-global-label">Hours Given</div>
            </div>
            <div class="impact-global-stat">
              <div class="impact-global-value">${globalStats.longestChain}</div>
              <div class="impact-global-label">Longest Chain</div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-top:var(--space-12);" class="animate-fade-in-up stagger-7">
          <p style="color:var(--text-muted);margin-bottom:var(--space-4);">Ready to extend your chain?</p>
          <button class="btn btn-primary btn-lg" id="impact-cta">
            <i data-lucide="plus" style="width:18px;height:18px;"></i>
            Give Forward Again
          </button>
        </div>
      </div>
    </div>
  `;

  // Render stats counter
  const statsContainer = document.getElementById('impact-stats');
  if (statsContainer) {
    statsContainer.appendChild(createStatsCounter(userStats));
  }

  // Render personal graph
  initPersonalGraph(user._id);

  // Render chain stories
  renderUserChains(userChains, user._id);

  // CTA
  document.getElementById('impact-cta')?.addEventListener('click', () => navigate('/create'));

  // Lucide icons
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

function initPersonalGraph(userId) {
  const graphContainer = document.getElementById('impact-graph');
  if (!graphContainer) return;

  const networkData = getNetworkData();

  graph = createNetworkGraph(graphContainer, networkData, {
    width: graphContainer.clientWidth || 800,
    height: 450,
    centerUserId: userId,
    interactive: true,
    showLabels: true,
    animate: true,
  });
}

function renderUserChains(chains, userId) {
  const list = document.getElementById('chain-list');
  if (!list) return;

  import('../store.js').then(({ getUserById }) => {
    if (chains.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌱</div>
          <div class="empty-state-title">No chains yet</div>
          <div class="empty-state-description">Start your first chain by helping someone!</div>
        </div>
      `;
      return;
    }

    list.innerHTML = chains.map((chain, idx) => `
      <div class="impact-chain-card card card-glow animate-fade-in-up stagger-${idx + 1}">
        <div class="flex items-center justify-between" style="margin-bottom:var(--space-4);">
          <h3>${chain.name}</h3>
          <span class="tag tag-primary">${chain.acts.length} acts</span>
        </div>
        <div class="impact-chain-timeline">
          ${chain.acts.map((act, i) => {
            const from = getUserById(act.from);
            const to = getUserById(act.to);
            const isUser = act.from === userId || act.to === userId;
            return `
              <div class="impact-chain-act ${isUser ? 'impact-chain-act-highlight' : ''}">
                <div class="impact-chain-dot" style="background:${from?.color || 'var(--primary)'}"></div>
                <div class="impact-chain-act-content">
                  <span class="impact-chain-from">${from?.name || 'Someone'}</span>
                  <span class="impact-chain-arrow">→</span>
                  <span class="impact-chain-action">${act.action}</span>
                  <span class="impact-chain-arrow">→</span>
                  <span class="impact-chain-to">${to?.name || 'Someone'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  });
}
