// GiveForward — Home Page (stub — built in Phase 4)

export function renderHome(container) {
  container.innerHTML = `
    <div class="page page-hero">
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
        <div class="animate-fade-in-up">
          <div style="font-size:4rem;margin-bottom:1.5rem;">🌱</div>
          <h1 style="margin-bottom:1rem;">GiveForward</h1>
          <p style="font-size:1.25rem;color:var(--text-muted);max-width:500px;margin:0 auto;">
            Generosity isn't measured in dollars — it's measured in chains of human connection.
          </p>
        </div>
      </div>
    </div>
  `;
  return {};
}
