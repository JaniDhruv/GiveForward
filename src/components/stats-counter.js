// GiveForward — Stats Counter Component
// Animated count-up numbers with icons

export function createStatsCounter(stats, options = {}) {
  const { animate = true } = options;

  const container = document.createElement('div');
  container.className = 'stats-grid grid grid-4';

  const items = [
    { icon: '🤝', value: stats.actsCompleted || 0, label: 'Acts Completed', color: 'var(--primary)' },
    { icon: '👥', value: stats.peopleReached || 0, label: 'People Reached', color: 'var(--success)' },
    { icon: '🌱', value: stats.chainsStarted || 0, label: 'Chains Started', color: 'var(--accent)' },
    { icon: '🔗', value: stats.longestChain || 0, label: 'Longest Chain', color: 'var(--warning)' },
  ];

  container.innerHTML = items.map((item, i) => `
    <div class="stat-card card animate-fade-in-up stagger-${i + 1}">
      <div class="stat-card-icon">${item.icon}</div>
      <div class="stat-card-value" data-count="${item.value}" style="color:${item.color}">
        ${animate ? '0' : item.value}
      </div>
      <div class="stat-card-label">${item.label}</div>
    </div>
  `).join('');

  if (animate) {
    // Animate numbers when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const valueEls = container.querySelectorAll('.stat-card-value[data-count]');
          valueEls.forEach((el, i) => {
            setTimeout(() => {
              animateNumber(el, 0, parseInt(el.dataset.count), 1200);
            }, i * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // Observe after a tick (element needs to be in DOM)
    requestAnimationFrame(() => observer.observe(container));
  }

  return container;
}

function animateNumber(el, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + range * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
