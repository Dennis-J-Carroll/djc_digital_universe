// ═══════════════════════════════════════════════════════════════
//  VOICE TO TEXT — Web Speech API Dictation
// ═══════════════════════════════════════════════════════════════

let recognition = null;
let isListening = false;
let editorTextarea = null;
let micBtn = null;

export function initVoiceToText() {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('[Voice] Speech recognition not supported in this browser');
    hideMicButton();
    return;
  }

  editorTextarea = document.getElementById('editor');
  micBtn = document.getElementById('btnVoice');
  if (!editorTextarea || !micBtn) return;

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    updateMicUI(true);
  };

  recognition.onend = () => {
    isListening = false;
    updateMicUI(false);
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      insertTextAtCursor(editorTextarea, finalTranscript + ' ');
      // Trigger auto-save, word count update, etc.
      editorTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  recognition.onerror = (event) => {
    console.error('[Voice] Error:', event.error);
    isListening = false;
    updateMicUI(false);
    if (event.error === 'not-allowed') {
      showToast('Microphone access denied. Please allow microphone access.');
    } else if (event.error === 'no-speech') {
      showToast('No speech detected. Try speaking louder.');
    } else if (event.error === 'audio-capture') {
      showToast('No microphone found. Check your audio settings.');
    } else if (event.error === 'network') {
      showToast('Network error. Check your connection.');
    }
  };

  micBtn.addEventListener('click', toggleListening);
}

function toggleListening() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (err) {
      console.error('[Voice] Failed to start recognition:', err);
    }
  }
}

function updateMicUI(listening) {
  if (!micBtn) return;
  if (listening) {
    micBtn.classList.add('listening');
    micBtn.setAttribute('title', 'Stop dictation');
    micBtn.setAttribute('aria-label', 'Stop dictation');
  } else {
    micBtn.classList.remove('listening');
    micBtn.setAttribute('title', 'Voice dictation');
    micBtn.setAttribute('aria-label', 'Voice dictation');
  }
}

function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  textarea.value = value.substring(0, start) + text + value.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
}

function hideMicButton() {
  const btn = document.getElementById('btnVoice');
  if (btn) btn.style.display = 'none';
}

function showToast(msg) {
  // Try to use the app's flashSave if available via global event
  const saveLabel = document.getElementById('saveLabel');
  const saveItem = document.getElementById('saveItem');
  if (saveLabel && saveItem) {
    saveLabel.textContent = msg;
    saveItem.className = 'item save-indicator unsaved';
    setTimeout(() => {
      saveItem.className = 'item save-indicator';
      saveLabel.textContent = 'Saved \u00b7 just now';
    }, 3000);
  } else {
    console.log('[Voice]', msg);
  }
}
