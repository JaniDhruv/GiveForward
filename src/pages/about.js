// GiveForward — About Page

import { navigate } from '../router.js';

export function renderAbout(container) {
  container.innerHTML = `
    <div class="page">
      <div class="container container-sm" style="padding-top:var(--space-12);padding-bottom:var(--space-16);">
        <!-- Header -->
        <div class="section-header animate-fade-in-up" style="text-align:center;">
          <div class="section-label" style="justify-content:center;">💜 About</div>
          <h1 class="section-title">About GiveForward</h1>
          <p class="section-subtitle" style="margin:0 auto;">
            One good act doesn't have to end with you.
          </p>
        </div>

        <!-- Mission -->
        <div class="about-section card animate-fade-in-up stagger-2">
          <h2 style="margin-bottom:var(--space-4);">🌱 Our Mission</h2>
          <p style="color:var(--text-secondary);line-height:var(--leading-relaxed);margin-bottom:var(--space-4);">
            Generosity isn't measured in dollars — it's measured in <strong style="color:var(--primary-light);">chains of human connection</strong>.
          </p>
          <p style="color:var(--text-secondary);line-height:var(--leading-relaxed);margin-bottom:var(--space-4);">
            GiveForward was built for the <a href="https://dev.to/challenges/weekend-2026-09-03" target="_blank" rel="noopener">DEV Weekend Challenge: Generosity Edition</a>, 
            inspired by the International Day of Charity on September 5th.
          </p>
          <p style="color:var(--text-secondary);line-height:var(--leading-relaxed);">
            We believe that when you help someone, that person is inspired to help someone else. 
            One act of kindness can ripple through an entire community. GiveForward makes those ripples visible.
          </p>
        </div>

        <!-- How It Works -->
        <div class="about-section card animate-fade-in-up stagger-3">
          <h2 style="margin-bottom:var(--space-4);">🔗 How It Works</h2>
          <div class="about-steps">
            <div class="about-step">
              <span class="about-step-num">1</span>
              <div>
                <strong>Share what you need or can give</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Speak naturally or type — our AI understands both.</p>
              </div>
            </div>
            <div class="about-step">
              <span class="about-step-num">2</span>
              <div>
                <strong>AI finds your match</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Google Gemini analyzes context, not just keywords.</p>
              </div>
            </div>
            <div class="about-step">
              <span class="about-step-num">3</span>
              <div>
                <strong>Complete the act</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Connect, help, and mark it done.</p>
              </div>
            </div>
            <div class="about-step">
              <span class="about-step-num">4</span>
              <div>
                <strong>Watch the chain grow</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">The person you helped helps someone else. Your generosity ripples forward.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tech Stack -->
        <div class="about-section card animate-fade-in-up stagger-4">
          <h2 style="margin-bottom:var(--space-4);">⚡ Built With</h2>
          <div class="about-tech-grid">
            <div class="about-tech-item">
              <div class="about-tech-icon">🤖</div>
              <div>
                <strong>Google Gemini AI</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Natural language parsing and intelligent matching</p>
              </div>
            </div>
            <div class="about-tech-item">
              <div class="about-tech-icon">🔊</div>
              <div>
                <strong>ElevenLabs</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Voice-based accessibility and spoken confirmations</p>
              </div>
            </div>
            <div class="about-tech-item">
              <div class="about-tech-icon">📊</div>
              <div>
                <strong>D3.js</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Interactive force-directed generosity chain visualization</p>
              </div>
            </div>
            <div class="about-tech-item">
              <div class="about-tech-icon">⚡</div>
              <div>
                <strong>Vite + Vanilla JS</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Fast, zero-framework frontend</p>
              </div>
            </div>
            <div class="about-tech-item">
              <div class="about-tech-icon">▲</div>
              <div>
                <strong>Vercel</strong>
                <p style="color:var(--text-muted);font-size:var(--text-sm);">Serverless API routes and hosting</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Credits -->
        <div class="about-section card animate-fade-in-up stagger-5">
          <h2 style="margin-bottom:var(--space-4);">👤 Creator</h2>
          <div class="flex items-center gap-4">
            <div class="avatar avatar-lg" style="background:#6C5CE7;">DJ</div>
            <div>
              <strong style="font-size:var(--text-lg);">Dhruv Jani</strong>
              <p style="color:var(--text-muted);font-size:var(--text-sm);">Built with ❤️ for the DEV Weekend Challenge: Generosity Edition</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-top:var(--space-10);" class="animate-fade-in-up stagger-6">
          <button class="btn btn-primary btn-lg" id="about-cta">
            <i data-lucide="heart" style="width:18px;height:18px;"></i>
            Start Your Chain
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('about-cta')?.addEventListener('click', () => navigate('/create'));

  if (window.lucide) window.lucide.createIcons();

  return {};
}
