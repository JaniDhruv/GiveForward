// GiveForward — AI Parser Component
// Sends text to Gemini API and displays structured result

export function createAIParser(options = {}) {
  const { onParsed = () => {} } = options;

  const container = document.createElement('div');
  container.className = 'ai-parser';
  container.innerHTML = `
    <button class="btn btn-primary ai-parse-btn" id="ai-parse-btn">
      <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
      <span>Understand with AI</span>
    </button>
    <div class="ai-result" id="ai-result" style="display:none;"></div>
  `;

  const parseBtn = container.querySelector('#ai-parse-btn');
  const resultDiv = container.querySelector('#ai-result');

  parseBtn.addEventListener('click', async () => {
    const textArea = document.getElementById('create-text');
    const text = textArea?.value?.trim();

    if (!text) return;

    // Show loading
    parseBtn.disabled = true;
    parseBtn.innerHTML = `
      <span class="spinner"></span>
      <span>Analyzing...</span>
    `;

    resultDiv.style.display = 'none';

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const { data } = await response.json();

      // Display parsed result
      renderResult(resultDiv, data);
      resultDiv.style.display = 'block';
      onParsed(data);
    } catch (error) {
      console.error('Parse error:', error);
      resultDiv.innerHTML = `
        <div class="ai-result-error">
          <span>❌</span>
          <span>Failed to parse. Please try again or fill in manually.</span>
        </div>
      `;
      resultDiv.style.display = 'block';
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = `
        <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
        <span>Understand with AI</span>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  return container;
}

function renderResult(container, data) {
  const CATEGORY_ICONS = {
    education: '📚', food: '🍱', tech: '💻', time: '🕐',
    items: '📦', skills: '🎯', health: '🩺', transport: '🚗',
    housing: '🏠', other: '✨',
  };

  const icon = CATEGORY_ICONS[data.category] || '✨';
  const typeLabel = data.type === 'need' ? 'Need' : 'Offer';
  const typeColor = data.type === 'need' ? 'var(--accent)' : 'var(--success)';

  container.innerHTML = `
    <div class="ai-result-card card animate-scale-in">
      <div class="ai-result-header">
        <span class="ai-result-badge" style="color:${typeColor};">✨ AI Parsed — ${typeLabel}</span>
        <button class="btn btn-ghost btn-sm ai-edit-btn" id="ai-edit-btn">
          <i data-lucide="pencil" style="width:14px;height:14px;"></i>
          Edit
        </button>
      </div>
      
      <h3 class="ai-result-title">${icon} ${data.title}</h3>
      <p class="ai-result-desc">${data.description}</p>
      
      <div class="ai-result-fields">
        <div class="ai-result-field">
          <span class="ai-result-field-label">Category</span>
          <span class="tag tag-${data.category}">${data.category}</span>
        </div>
        ${data.tags ? `
          <div class="ai-result-field">
            <span class="ai-result-field-label">Tags</span>
            <div class="flex flex-wrap gap-2">
              ${data.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${data.availability ? `
          <div class="ai-result-field">
            <span class="ai-result-field-label">Availability</span>
            <span style="color:var(--text-secondary);font-size:var(--text-sm);">${data.availability}</span>
          </div>
        ` : ''}
        ${data.location ? `
          <div class="ai-result-field">
            <span class="ai-result-field-label">Location</span>
            <span style="color:var(--text-secondary);font-size:var(--text-sm);">${data.location}</span>
          </div>
        ` : ''}
        ${data.estimatedTime ? `
          <div class="ai-result-field">
            <span class="ai-result-field-label">Time Estimate</span>
            <span style="color:var(--text-secondary);font-size:var(--text-sm);">${data.estimatedTime}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
