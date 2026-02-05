const statusEl = document.getElementById('status');
const runBtn = document.getElementById('runBtn');

function setStatus(msg) {
  statusEl.textContent = msg;
}

runBtn.addEventListener('click', async () => {
  runBtn.disabled = true;
  setStatus('发送指令中...');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !tab.url.includes('viator.com')) {
    setStatus('请先打开 viator.com 结果页');
    runBtn.disabled = false;
    return;
  }

  chrome.runtime.sendMessage(
    { type: 'run-auto', tabId: tab.id },
    (response) => {
      if (chrome.runtime.lastError) {
        setStatus('无法发送指令，请刷新页面后重试');
      } else if (response && response.ok) {
        setStatus('已开始执行，请保持页面打开');
      } else {
        setStatus('执行失败，请查看页面状态');
      }
      runBtn.disabled = false;
    }
  );
});
