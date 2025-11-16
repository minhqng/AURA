console.log('Mock Service background worker loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background received message', message);
  if (!message || !message.type) {
    sendResponse({ status: 'error', error: 'Missing message.type' });
    return; 
  }

  if (message.type === 'GET_AI_DESCRIPTION') {
    const delayMs = typeof message.delayMs === 'number' ? message.delayMs : 1000;
    setTimeout(() => {
      const fakeText = message.input ? `Mô tả giả về: ${message.input}` : 'Đây là mô tả giả: một con mèo';
      const response = { status: 'success', description: fakeText, timestamp: Date.now() };
      console.log('Sending mocked AI response', response);
      sendResponse(response);
    }, delayMs);

    return true; 
  }
  if (message.type === 'SPEAK_TEXT') {
    const text = message.text || '';
    if (!text) {
      sendResponse({ status: 'error', error: 'No text provided' });
      return;
    }
    const ttsOptions = message.ttsOptions || {
      rate: 1.0,
      pitch: 1.0,
      lang: 'vi-VN'
    };
    try {
      chrome.tts.speak(text, ttsOptions, () => {
        const err = chrome.runtime.lastError;
        if (err) {
          console.error('TTS error:', err);
          sendResponse({ status: 'error', error: err.message || String(err) });
        } else {
          console.log('TTS started for text:', text);
          sendResponse({ status: 'success', spokenText: text });
        }
      });
      return true;
    } catch (e) {
      console.error('Exception calling tts:', e);
      sendResponse({ status: 'error', error: e.message });
      return;
    }
  }
  sendResponse({ status: 'error', error: 'Unknown message.type' });
});