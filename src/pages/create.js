// GiveForward — Create Page
// Post a need or offer with AI parsing + voice input

import { addEntry, getCurrentUser } from '../store.js';
import { createVoiceInput } from '../components/voice-input.js';
import { createAIParser } from '../components/ai-parser.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

let parsedData = null;

export function renderCreate(container) {
  const user = getCurrentUser();
  parsedData = null;

  container.innerHTML = `
    <div class="page">
      <div class="container container-sm" style="padding-top:var(--space-12);padding-bottom:var(--space-16);">
        <!-- Header -->
        <div class="section-header animate-fade-in-up" style="text-align:center;">
          <div class="section-label" style="justify-content:center;">✨ Create</div>
          <h1 class="section-title">Give Forward</h1>
          <p class="section-subtitle" style="margin:0 auto;">
            Tell us what you need or what you can offer. Speak naturally — our AI will understand.
          </p>
        </div>

        <!-- Type Toggle -->
        <div class="create-toggle animate-fade-in-up stagger-2">
            <div class="toggle-group" style="margin-bottom:var(--space-8);" id="type-toggle">
              <button class="toggle-option" data-type="offer" id="toggle-offer">
                <i data-lucide="hand-heart" style="width:16px;height:16px;vertical-align:middle;margin-right:8px;"></i> I Can Help
              </button>
              <button class="toggle-option active" data-type="need" id="toggle-need">
                <i data-lucide="heart" style="width:16px;height:16px;vertical-align:middle;margin-right:8px;"></i> I Need Help
              </button>
            </div>
        </div>

        <!-- Form -->
        <div class="create-form animate-fade-in-up stagger-3">
          <div class="create-input-area">
            <div class="create-textarea-wrapper">
              <textarea
                class="input textarea"
                id="create-text"
                placeholder="Describe what you can offer or what you need help with...&#10;&#10;Example: 'I have old engineering textbooks and free time on weekends. I'd love to help students who need tutoring in math or programming.'"
                rows="6"
              ></textarea>
              <div class="create-voice-container" id="voice-container"></div>
            </div>
            
            <div class="create-hint">
              <i data-lucide="info" style="width:14px;height:14px;"></i>
              <span>Speak naturally. You can mention what, when, where, and how long.</span>
            </div>
          </div>

          <!-- AI Parse -->
          <div class="create-ai-section" id="ai-section"></div>

          <!-- Manual Fields (shown after AI parse or for manual entry) -->
          <div class="create-manual-fields" id="manual-fields" style="display:none;">
            <div class="divider"></div>
            <h3 style="margin-bottom:var(--space-4);">Details</h3>
            
            <div class="create-field-row">
              <div class="input-group" style="flex:1;">
                <label class="create-label">Category</label>
                <select class="input" id="field-category">
                  <option value="">Select Category...</option>
                  <option value="education">Education</option>
                  <option value="food">Food</option>
                  <option value="tech">Tech</option>
                  <option value="time">Time</option>
                  <option value="items">Items</option>
                  <option value="skills">Skills</option>
                  <option value="health">Health</option>
                  <option value="transport">Transport</option>
                  <option value="housing">Housing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="input-group" style="flex:1;">
                <label class="create-label">Location (optional)</label>
                <input type="text" class="input" id="field-location" placeholder="City, area..." />
              </div>
            </div>

            <div class="create-field-row">
              <div class="input-group" style="flex:1;">
                <label class="create-label">Availability (optional)</label>
                <input type="text" class="input" id="field-availability" placeholder="Weekends, evenings..." />
              </div>
              <div class="input-group" style="flex:1;">
                <label class="create-label">Time Estimate (optional)</label>
                <input type="text" class="input" id="field-time" placeholder="2 hours, ongoing..." />
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="create-submit">
            <button class="btn btn-ghost" id="manual-toggle-btn">
              <i data-lucide="settings-2" style="width:16px;height:16px;"></i>
              Fill in manually
            </button>
            <button class="btn btn-primary btn-lg" id="submit-btn">
              <i data-lucide="send" style="width:18px;height:18px;"></i>
              Post & Give Forward
            </button>
          </div>

          <!-- ElevenLabs Confirmation -->
          <div class="create-confirmation" id="confirmation" style="display:none;">
            <div class="success-screen animate-fade-in-up" id="success-screen" style="text-align:center;padding:var(--space-12) 0;">
              <div style="margin-bottom:var(--space-4);"><i data-lucide="check-circle" style="width:64px;height:64px;color:var(--success);"></i></div>
              <h2 style="font-size:var(--text-3xl);margin-bottom:var(--space-2);">Action Posted!</h2>
              <p style="color:var(--text-muted);margin-bottom:var(--space-6);" id="confirmation-text"></p>
              <div class="flex gap-4 justify-center">
                <button class="btn btn-primary" id="view-explore-btn">View in Explore</button>
                <button class="btn btn-ghost" id="create-another-btn">Post Another</button>
              </div>
              <div id="audio-player" style="margin-top:var(--space-4);"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mount voice input
  const voiceContainer = document.getElementById('voice-container');
  const textArea = document.getElementById('create-text');
  
  if (voiceContainer) {
    const voiceInput = createVoiceInput({
      onResult: (transcript, isFinal) => {
        if (textArea) {
          textArea.value = transcript;
          textArea.style.height = 'auto';
          textArea.style.height = textArea.scrollHeight + 'px';
        }
      },
      onError: (error) => {
        showToast(`Voice input error: ${error}`, 'error');
      },
    });
    voiceContainer.appendChild(voiceInput);
  }

  // Mount AI parser
  const aiSection = document.getElementById('ai-section');
  if (aiSection) {
    const aiParser = createAIParser({
      onParsed: (data) => {
        parsedData = data;
        // Update toggle to match parsed type
        const toggleOffer = document.getElementById('toggle-offer');
        const toggleNeed = document.getElementById('toggle-need');
        if (data.type === 'need') {
          toggleNeed?.classList.add('active');
          toggleOffer?.classList.remove('active');
        } else {
          toggleOffer?.classList.add('active');
          toggleNeed?.classList.remove('active');
        }
        // Show manual fields pre-filled
        showManualFields(data);
      },
    });
    aiSection.appendChild(aiParser);
  }

  // Toggle type
  document.getElementById('type-toggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-option');
    if (!btn) return;
    document.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // Manual fields toggle
  document.getElementById('manual-toggle-btn')?.addEventListener('click', () => {
    const fields = document.getElementById('manual-fields');
    if (fields) {
      fields.style.display = fields.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Auto-resize textarea
  textArea?.addEventListener('input', () => {
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  });

  // Submit
  document.getElementById('submit-btn')?.addEventListener('click', handleSubmit);
  document.getElementById('view-explore-btn')?.addEventListener('click', () => navigate('/explore'));
  document.getElementById('create-another-btn')?.addEventListener('click', () => navigate('/create'));

  // Lucide icons
  if (window.lucide) window.lucide.createIcons();

  return {};
}

function showManualFields(data) {
  const fields = document.getElementById('manual-fields');
  if (!fields) return;
  fields.style.display = 'block';

  // Pre-fill
  const cat = document.getElementById('field-category');
  const loc = document.getElementById('field-location');
  const avail = document.getElementById('field-availability');
  const time = document.getElementById('field-time');

  if (cat && data.category) cat.value = data.category;
  if (loc && data.location) loc.value = data.location;
  if (avail && data.availability) avail.value = data.availability;
  if (time && data.estimatedTime) time.value = data.estimatedTime;
}

async function handleSubmit() {
  const textArea = document.getElementById('create-text');
  const text = textArea?.value?.trim();

  if (!text && !parsedData) {
    showToast('Please describe what you need or can offer.', 'error');
    return;
  }

  const activeToggle = document.querySelector('.toggle-option.active');
  const type = activeToggle?.dataset.type || 'offer';

  const category = document.getElementById('field-category')?.value || parsedData?.category || 'other';
  const location = document.getElementById('field-location')?.value || parsedData?.location || null;
  const availability = document.getElementById('field-availability')?.value || parsedData?.availability || null;
  const estimatedTime = document.getElementById('field-time')?.value || parsedData?.estimatedTime || null;

  const entry = {
    userId: 'u15', // Current user (Dhruv)
    type,
    title: parsedData?.title || text.slice(0, 60),
    description: parsedData?.description || text,
    category,
    tags: parsedData?.tags || [category],
    availability,
    location,
    estimatedTime,
  };

  // Add to store
  const saved = addEntry(entry);

  // Show confirmation
  const form = document.querySelector('.create-form');
  const confirmation = document.getElementById('confirmation');
  const confirmText = document.getElementById('confirmation-text');

  if (form && confirmation && confirmText) {
    // Hide form elements
    document.querySelector('.create-input-area').style.display = 'none';
    document.getElementById('ai-section').style.display = 'none';
    document.getElementById('manual-fields').style.display = 'none';
    document.querySelector('.create-submit').style.display = 'none';

    const typeLabel = type === 'need' ? 'request for help' : 'offer to help';
    confirmText.textContent = `Your ${typeLabel} has been posted. We'll match you with the right people.`;
    confirmation.style.display = 'block';

    // Try ElevenLabs TTS
    speakConfirmation(`Your ${typeLabel} has been posted on GiveForward. We found people who could use your help. Your generosity will ripple forward.`);
  }

  showToast('Posted successfully! 🌱', 'success');
}

async function speakConfirmation(text) {
  const audioPlayer = document.getElementById('audio-player');

  try {
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn('ElevenLabs TTS not available');
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (audioPlayer) {
      audioPlayer.innerHTML = `
        <div class="flex items-center gap-3 justify-center" style="margin-top:var(--space-4);">
          <span style="font-size:var(--text-xs);color:var(--text-muted);">🔊 Listen to confirmation</span>
          <audio controls autoplay style="height:32px;opacity:0.7;">
            <source src="${audioUrl}" type="audio/mpeg" />
          </audio>
        </div>
      `;
    }

    // Auto-play
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
      // Autoplay blocked — that's fine, user can use the controls
    });
  } catch (e) {
    console.warn('TTS failed:', e);
  }
}
