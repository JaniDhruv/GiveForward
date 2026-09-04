// GiveForward — Toast Notification Component

const TOAST_DURATION = 4000;
let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info') {
  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: '💡',
  };

  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span>${icons[type] || '💡'}</span>
      <span>${message}</span>
    </div>
    <div class="toast-progress" style="animation-duration: ${TOAST_DURATION}ms;"></div>
  `;

  container.appendChild(toast);

  // Auto dismiss
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION);

  return toast;
}
