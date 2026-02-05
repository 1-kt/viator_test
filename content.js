(() => {
  const PANEL_ID = 'viator-tools-panel';
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  const title = document.createElement('div');
  title.className = 'vtp-title';
  title.textContent = '工具箱';

  const extractBtn = document.createElement('button');
  extractBtn.type = 'button';
  extractBtn.id = 'vtp-extract-btn';
  extractBtn.className = 'vtp-btn';
  extractBtn.textContent = '提取';

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.id = 'vtp-export-btn';
  exportBtn.className = 'vtp-btn vtp-btn-secondary';
  exportBtn.textContent = '导出';

  const status = document.createElement('div');
  status.className = 'vtp-status';
  status.textContent = '就绪';

  panel.appendChild(title);
  panel.appendChild(extractBtn);
  panel.appendChild(exportBtn);
  panel.appendChild(status);
  document.body.appendChild(panel);

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle('vtp-status-error', isError);
  };

  const runExtractScript = () => new Promise((resolve, reject) => {
    if (!chrome?.runtime?.id) {
      reject(new Error('Extension context invalidated'));
      return;
    }
    chrome.runtime.sendMessage({ type: 'run-extract' }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || 'Unknown error'));
        return;
      }
      resolve();
    });
  });

  const runExportScript = () => new Promise((resolve, reject) => {
    if (!chrome?.runtime?.id) {
      reject(new Error('Extension context invalidated'));
      return;
    }
    chrome.runtime.sendMessage({ type: 'run-export' }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || 'Unknown error'));
        return;
      }
      resolve();
    });
  });

  extractBtn.addEventListener('click', async () => {
    try {
      await runExtractScript();
      setStatus('已执行提取脚本');
    } catch (err) {
      const message = err?.message || String(err);
      if (message.includes('Extension context invalidated')) {
        setStatus('插件已更新，请刷新页面', true);
      } else {
        setStatus('提取失败，请查看控制台', true);
      }
      console.error(err);
    }
  });

  exportBtn.addEventListener('click', () => {
    (async () => {
      try {
        await runExportScript();
        setStatus('已执行导出脚本');
      } catch (err) {
        const message = err?.message || String(err);
        if (message.includes('Extension context invalidated')) {
          setStatus('插件已更新，请刷新页面', true);
        } else {
          setStatus('导出失败，请查看控制台', true);
        }
        console.error(err);
      }
    })();
  });
})();
