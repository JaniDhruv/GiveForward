// GiveForward — Card Component
// Renders a need/offer card

import { getUserById } from '../store.js';

const CATEGORY_ICONS = {
  education: '📚',
  food: '🍱',
  tech: '💻',
  time: '🕐',
  items: '📦',
  skills: '🎯',
  health: '🩺',
  transport: '🚗',
  housing: '🏠',
  other: '✨',
};

export function createCard(entry, options = {}) {
  const { showActions = true, compact = false } = options;
  const user = getUserById(entry.userId);

  const card = document.createElement('div');
  card.className = `entry-card card card-glow animate-fade-in-up ${compact ? 'entry-card-compact' : ''}`;
  card.dataset.id = entry.id;
  card.dataset.type = entry.type;

  const typeLabel = entry.type === 'need' ? 'Needs Help' : 'Can Help';
  const typeClass = entry.type === 'need' ? 'tag-accent' : 'tag-success';
  const icon = CATEGORY_ICONS[entry.category] || '✨';

  card.innerHTML = `
    <div class="entry-card-header">
      <div class="flex items-center gap-3">
        <div class="avatar" style="background:${user?.color || '#6C5CE7'}">
          ${user?.initials || '??'}
        </div>
        <div>
          <div class="entry-card-name">${user?.name || 'Anonymous'}</div>
          <div class="entry-card-time">${getTimeAgo(entry.createdAt)}</div>
        </div>
      </div>
      <span class="tag ${typeClass}">${typeLabel}</span>
    </div>

    <h3 class="entry-card-title">${icon} ${entry.title}</h3>
    <p class="entry-card-desc">${entry.description}</p>

    <div class="entry-card-tags">
      ${entry.tags.map(tag => `<span class="tag tag-${entry.category}">${tag}</span>`).join('')}
    </div>

    <div class="entry-card-meta">
      ${entry.location ? `<span class="entry-card-meta-item"><i data-lucide="map-pin" style="width:14px;height:14px;"></i> ${entry.location}</span>` : ''}
      ${entry.availability ? `<span class="entry-card-meta-item"><i data-lucide="clock" style="width:14px;height:14px;"></i> ${entry.availability}</span>` : ''}
      ${entry.estimatedTime ? `<span class="entry-card-meta-item"><i data-lucide="timer" style="width:14px;height:14px;"></i> ${entry.estimatedTime}</span>` : ''}
    </div>

    ${showActions ? `
      <div class="entry-card-actions">
        <button class="btn btn-${entry.type === 'need' ? 'accent' : 'success'} btn-sm entry-connect-btn" data-id="${entry.id}">
          <i data-lucide="link" style="width:14px;height:14px;"></i>
          Connect
        </button>
      </div>
    ` : ''}
  `;

  return card;
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
