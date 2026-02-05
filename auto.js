(() => {
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const setStatus = (text, isError = false) => {
    const status = document.querySelector('.vtp-status');
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('vtp-status-error', isError);
  };

  (async () => {
    try {
      let pageIndex = 1;
      setStatus('开始自动提取...');

      while (true) {
        if (pageIndex > 1) {
          setStatus(`等待页面加载（第 ${pageIndex} 页）...`);
          await sleep(500);
        }

        const extractBtn = document.getElementById('vtp-extract-btn');
        if (extractBtn) extractBtn.click();
        await sleep(600);

        const next = document.querySelector('a[aria-label="Next"]');
        if (!next) break;

        next.click();
        pageIndex += 1;
        await sleep(1200);
      }

      const exportBtn = document.getElementById('vtp-export-btn');
      if (exportBtn) exportBtn.click();

      setStatus('已执行导出脚本');
    } catch (err) {
      console.error(err);
      setStatus('自动流程失败', true);
    }
  })();
})();
