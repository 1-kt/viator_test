chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  (async () => {
    try {
      const tabId = message.tabId || sender?.tab?.id;
      if (!tabId) {
        sendResponse({ ok: false, error: 'No tab id' });
        return;
      }

      let file = null;
      if (message.type === 'run-extract') file = 'extract.js';
      if (message.type === 'run-export') file = 'export.js';
      if (message.type === 'run-auto') file = 'auto.js';

      if (!file) {
        sendResponse({ ok: false, error: 'Unknown message type' });
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId },
        files: [file]
      });

      sendResponse({ ok: true });
    } catch (err) {
      sendResponse({ ok: false, error: err?.message || String(err) });
    }
  })();

  return true;
});
