// GiveForward — Auth Modal Component
// Magic Link login UI

import { showToast } from './toast.js';

export function createAuthModal(onSuccess) {
  const overlay = document.createElement('div');
  overlay.className = 'auth-modal-overlay animate-fade-in';
  
  overlay.innerHTML = `
    <div class="auth-modal card animate-scale-in">
      <button class="auth-modal-close" aria-label="Close">✕</button>
      
      <div class="auth-modal-header">
        <div class="auth-modal-icon">🌱</div>
        <h2>Sign In to GiveForward</h2>
        <p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-2);">
          Enter your email to receive a secure magic link. No passwords required.
        </p>
      </div>

      <form id="auth-form" class="auth-modal-form">
        <div class="input-group">
          <label class="create-label">Name</label>
          <input type="text" id="auth-name" class="input" placeholder="How should we call you?" required />
        </div>
        
        <div class="input-group" style="margin-top:var(--space-4);">
          <label class="create-label">Email Address</label>
          <input type="email" id="auth-email" class="input" placeholder="you@example.com" required />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--space-6);" id="auth-submit">
          <span>Send Magic Link</span>
        </button>
      </form>

      <div id="auth-success" class="auth-modal-success" style="display:none;">
        <div style="font-size:3rem;margin-bottom:var(--space-4);">✉️</div>
        <h3>Check your email</h3>
        <p style="color:var(--text-muted);margin-top:var(--space-2);">
          We sent a magic link to <strong id="success-email" style="color:var(--text-primary);"></strong>. Click the link to securely sign in.
        </p>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-4);">
          You can close this window.
        </p>
      </div>
    </div>
  `;

  // Styles (we inject them directly for simplicity or they could go in a css file)
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .auth-modal {
      width: 100%; max-width: 400px;
      position: relative;
      background: var(--bg-surface);
    }
    .auth-modal-close {
      position: absolute; top: var(--space-4); right: var(--space-4);
      background: none; border: none; color: var(--text-muted);
      font-size: 1.2rem; cursor: pointer;
    }
    .auth-modal-close:hover { color: var(--text-primary); }
    .auth-modal-header { text-align: center; margin-bottom: var(--space-6); }
    .auth-modal-icon { font-size: 2.5rem; margin-bottom: var(--space-3); }
    .auth-modal-success { text-align: center; padding: var(--space-4) 0; }
    .btn-block { width: 100%; }
    .animate-scale-in { animation: scaleIn var(--duration-normal) var(--ease-spring) both; }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  // Events
  const closeBtn = overlay.querySelector('.auth-modal-close');
  closeBtn.addEventListener('click', close);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const form = overlay.querySelector('#auth-form');
  const submitBtn = overlay.querySelector('#auth-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = overlay.querySelector('#auth-name').value.trim();
    const email = overlay.querySelector('#auth-email').value.trim();

    if (!email) return;

    // Loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:8px;"></span> Sending...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      if (!res.ok) throw new Error('Failed to send magic link');

      form.style.display = 'none';
      overlay.querySelector('#success-email').textContent = email;
      overlay.querySelector('#auth-success').style.display = 'block';
      
      showToast('Magic link sent!', 'success');
      
      if (onSuccess) onSuccess();

    } catch (err) {
      showToast('Failed to send magic link. Try again.', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  function close() {
    overlay.classList.remove('animate-fade-in');
    overlay.classList.add('animate-fade-out');
    overlay.querySelector('.auth-modal').classList.remove('animate-scale-in');
    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 300);
  }

  return { close };
}

// Global helper to trigger auth flow
window.requireAuth = (callback) => {
  import('../store.js').then(({ getCurrentUser }) => {
    if (getCurrentUser()) {
      callback();
    } else {
      createAuthModal();
    }
  });
};
