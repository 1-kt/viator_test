// (() => {
//   const sleep = (ms) => new Promise(res => setTimeout(res, ms));

//   const setStatus = (text, isError = false) => {
//     const status = document.querySelector('.vtp-status');
//     if (!status) return;
//     status.textContent = text;
//     status.classList.toggle('vtp-status-error', isError);
//   };

//   (async () => {
//     try {
//       let pageIndex = 1;
//       setStatus('开始自动提取...');

//       while (true) {
//         if (pageIndex > 1) {
//           setStatus(`等待页面加载（第 ${pageIndex} 页）...`);
//           await sleep(500);
//         }

//         const extractBtn = document.getElementById('vtp-extract-btn');
//         if (extractBtn) extractBtn.click();
//         await sleep(600);

//         const next = document.querySelector('a[aria-label="Next"]');
//         if (!next){
//           const exportBtn = document.getElementById('vtp-export-btn');
//           if (exportBtn) exportBtn.click();
//           setStatus('已执行导出脚本');
//           return;
//         }

//         next.click();
//         pageIndex += 1;
//         await sleep(1200);
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus('自动流程失败', true);
//     }
//   })();
// })();


(() => {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const setStatus = (text, isError = false) => {
    const status = document.querySelector('.vtp-status');
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('vtp-status-error', isError);
  };

  // 可按需修改为更准确的列表根节点选择器
  const getListRoot = () =>
    document.querySelector('[data-automation="products-list"]') ||
    document.querySelector('main') ||
    document.body;

  // 获取列表的“关键值”，用于判断内容是否发生变化
  const getListKey = () => {
    const root = getListRoot();
    if (!root) return '';
    const items = root.querySelectorAll(':scope > *');
    const first = items[0];
    const txt = first?.textContent?.trim().slice(0, 80) || '';
    return `${items.length}|${txt}`;
  };

  // 等待列表内容变化（翻页渲染完成）
  const waitForListChange = (timeout = 15000) =>
    new Promise((resolve, reject) => {
      const root = getListRoot();
      if (!root) return resolve();
      const key0 = getListKey();
      const obs = new MutationObserver(() => {
        const k = getListKey();
        if (k && k !== key0) {
          clearTimeout(timer);
          obs.disconnect();
          resolve();
        }
      });
      obs.observe(root, { childList: true, subtree: true, characterData: true });
      const timer = setTimeout(() => {
        obs.disconnect();
        reject(new Error('waitForListChange timeout'));
      }, timeout);
    });

  (async () => {
    try {
      let pageIndex = 1;
      setStatus('开始自动提取...');

      while (true) {
        if (pageIndex > 1) {
          setStatus(`等待页面加载（第 ${pageIndex} 页）...`);
          // 等上一轮 Next 后内容真的变了；超时就兜底再等一下
          await waitForListChange().catch(() => sleep(700));
        }

        const extractBtn = document.getElementById('vtp-extract-btn');
        if (extractBtn) {
          extractBtn.click();
          // 让两帧过去，给事件处理/渲染一点时间
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        }

        // 仅选择可点击的 Next（排除禁用态）
        const next = document.querySelector('a[aria-label="Next"]:not([aria-disabled="true"])');
        if (!next) {
          const exportBtn = document.getElementById('vtp-export-btn');
          if (exportBtn) exportBtn.click();
          setStatus('已执行导出脚本');
          return;
        }

        next.click();
        pageIndex += 1;
        // 不在这里固定 sleep，下一轮循环开头会等待列表确实发生变化
      }
    } catch (err) {
      console.error(err);
      setStatus('自动流程失败', true);
    }
  })();
})();