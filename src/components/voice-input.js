// GiveForward — Voice Input Component
// Web Speech API for speech-to-text with visual feedback

export function createVoiceInput(options = {}) {
  const { onResult = () => {}, onError = () => {} } = options;

  const container = document.createElement('div');
  container.className = 'voice-input-wrapper';

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  if (!isSupported) {
    container.innerHTML = `
      <button class="btn btn-ghost btn-icon voice-btn" disabled title="Speech recognition not supported in this browser">
        <i data-lucide="mic-off" style="width:20px;height:20px;"></i>
      </button>
    `;
    return container;
  }

  let recognition = null;
  let isListening = false;

  container.innerHTML = `
    <button class="btn btn-ghost btn-icon voice-btn" id="voice-toggle" title="Click to speak your request">
      <i data-lucide="mic" style="width:20px;height:20px;"></i>
      <span class="voice-pulse-ring"></span>
      <span class="voice-pulse-ring voice-pulse-ring-2"></span>
    </button>
  `;

  const btn = container.querySelector('#voice-toggle');
  const rings = container.querySelectorAll('.voice-pulse-ring');

  btn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  function startListening() {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      btn.classList.add('voice-active');
      rings.forEach(r => r.style.display = 'block');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      onResult(transcript, isFinal);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        onError(event.error);
      }
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      onError('Failed to start voice input');
    }
  }

  function stopListening() {
    isListening = false;
    btn.classList.remove('voice-active');
    rings.forEach(r => r.style.display = 'none');

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Already stopped
      }
      recognition = null;
    }
  }

  return container;
}
