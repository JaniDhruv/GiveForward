// GiveForward — Classic Auth Modal Component (Email/Password)

import { showToast } from './toast.js';

export function createAuthModal(onSuccess) {
  const overlay = document.createElement('div');
  overlay.className = 'auth-modal-overlay animate-fade-in';
  
  let mode = 'login'; // 'login' or 'register'

  overlay.innerHTML = `
    <div class="auth-modal card animate-scale-in">
      <button class="auth-modal-close" aria-label="Close">✕</button>
      
      <div class="auth-modal-header">
        <div class="auth-modal-icon" style="color:var(--primary); margin-bottom:var(--space-4);">
          <i data-lucide="leaf" style="width:48px;height:48px;"></i>
        </div>
        <h2 id="auth-title">Sign In</h2>
        <p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-2);" id="auth-subtitle">
          Welcome back to GiveForward.
        </p>
      </div>

      <form id="auth-form" class="auth-modal-form">
        <div class="input-group" id="name-group" style="display:none;">
          <label class="create-label">Name</label>
          <input type="text" id="auth-name" class="input" placeholder="How should we call you?" />
        </div>
        
        <div class="input-group" style="margin-top:var(--space-4);">
          <label class="create-label">Email Address</label>
          <input type="email" id="auth-email" class="input" placeholder="you@example.com" required />
        </div>

        <div class="input-group" style="margin-top:var(--space-4);">
          <label class="create-label">Password</label>
          <input type="password" id="auth-password" class="input" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--space-6);" id="auth-submit">
          <span>Sign In</span>
        </button>
      </form>
      
      <div style="text-align:center;margin-top:var(--space-4);font-size:var(--text-sm);">
        <button id="auth-toggle" style="background:none;border:none;color:var(--primary);cursor:pointer;">
          Need an account? Sign up
        </button>
      </div>
    </div>
  `;

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
    .btn-block { width: 100%; }
    .animate-scale-in { animation: scaleIn var(--duration-normal) var(--ease-spring) both; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Toggle Mode
  const toggleBtn = overlay.querySelector('#auth-toggle');
  const title = overlay.querySelector('#auth-title');
  const subtitle = overlay.querySelector('#auth-subtitle');
  const nameGroup = overlay.querySelector('#name-group');
  const nameInput = overlay.querySelector('#auth-name');
  const submitBtn = overlay.querySelector('#auth-submit');

  toggleBtn.addEventListener('click', () => {
    if (mode === 'login') {
      mode = 'register';
      title.textContent = 'Create Account';
      subtitle.textContent = 'Join the chain of generosity.';
      nameGroup.style.display = 'block';
      nameInput.required = true;
      submitBtn.innerHTML = '<span>Sign Up</span>';
      toggleBtn.textContent = 'Already have an account? Sign in';
    } else {
      mode = 'login';
      title.textContent = 'Sign In';
      subtitle.textContent = 'Welcome back to GiveForward.';
      nameGroup.style.display = 'none';
      nameInput.required = false;
      submitBtn.innerHTML = '<span>Sign In</span>';
      toggleBtn.textContent = 'Need an account? Sign up';
    }
  });

  // Close Events
  const closeBtn = overlay.querySelector('.auth-modal-close');
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Submit
  const form = overlay.querySelector('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = overlay.querySelector('#auth-email').value.trim();
    const password = overlay.querySelector('#auth-password').value;
    const name = nameInput.value.trim();

    if (!email || !password) return;

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:8px;"></span> Wait...';
    submitBtn.disabled = true;

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      showToast(`Welcome, ${data.user.name}! 🌱`, 'success');
      
      // Trigger store refresh by firing global event
      import('../store.js').then(({ initStore }) => {
        initStore().then(() => {
          if (onSuccess) onSuccess();
          close();
        });
      });

    } catch (err) {
      showToast(err.message, 'error');
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

window.requireAuth = (callback) => {
  import('../store.js').then(({ getCurrentUser }) => {
    if (getCurrentUser()) {
      callback();
    } else {
      createAuthModal(callback);
    }
  });
};
