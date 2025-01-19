document.addEventListener('DOMContentLoaded', function() {
  const extensionToggle = document.getElementById('extensionToggle');
  const modeSelect = document.getElementById('modeSelect');
  const modeDescription = document.getElementById('modeDescription');
  const apiKeyInput = document.getElementById('apiKeyInput'); // API Key input

  const modeDescriptions = {
    default: 'Transform ads with related content',
    vampire: 'Replace ads with spooky vampire content',
    exorcism: 'Completely remove ad elements'
  };

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'mode'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      return;
    }
    extensionToggle.checked = data.enabled ?? false;
    modeSelect.value = data.mode ?? 'default';
    updateModeDescription();
    updateSelectState();
  });

  // Handle API Key Submission
  apiKeyInput.addEventListener('blur', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      sendApiKeyToBackend(apiKey);
    }
  });

  // Save settings when changed
  extensionToggle.addEventListener('change', function() {
    const enabled = extensionToggle.checked;
    chrome.storage.sync.set({enabled: enabled}, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving extension state:', chrome.runtime.lastError);
        return;
      }
      console.log('Extension enabled:', enabled);
      updateSelectState();
      
      // Notify content script about the extension state change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
          console.error('Error querying tabs:', chrome.runtime.lastError);
          return;
        }
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "toggleExtension", enabled: enabled});
        }
      });
    });
  });

  modeSelect.addEventListener('change', function() {
    const selectedMode = modeSelect.value;
    chrome.storage.sync.set({mode: selectedMode}, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving mode:', chrome.runtime.lastError);
        return;
      }
      console.log('Mode saved:', selectedMode);
      updateModeDescription();
      
      // Notify content script about the mode change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
          console.error('Error querying tabs:', chrome.runtime.lastError);
          return;
        }
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "changeMode", mode: selectedMode});
        }
      });
    });
  });

  function sendApiKeyToBackend(apiKey) {
    fetch('http://localhost:3000/set-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey: apiKey })
    })
    .then(response => response.json())
    .then(data => {
      console.log('API Key Set Successfully:', data);
      alert('API Key Set Successfully');
    })
    .catch(error => {
      console.error('Error setting API Key:', error);
      alert('Failed to set API Key');
    });
  }

  function updateModeDescription() {
    modeDescription.textContent = modeDescriptions[modeSelect.value] || 'Unknown mode';
  }

  function updateSelectState() {
    modeSelect.disabled = !extensionToggle.checked;
    modeDescription.style.opacity = extensionToggle.checked ? '1' : '0.5';
  }

  updateModeDescription();
  updateSelectState();
});
