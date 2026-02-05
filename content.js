(() => {
  const PANEL_ID = 'viator-tools-panel';
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  const title = document.createElement('div');
  title.className = 'vtp-title';
  title.textContent = '工具箱';

  const autoBtn = document.createElement('button');
  autoBtn.type = 'button';
  autoBtn.id = 'vtp-auto-btn';
  autoBtn.className = 'vtp-btn vtp-btn-primary';
  autoBtn.textContent = '自动化';

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
  panel.appendChild(autoBtn);
  panel.appendChild(extractBtn);
  panel.appendChild(exportBtn);
  panel.appendChild(status);
  document.body.appendChild(panel);

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle('vtp-status-error', isError);
  };

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const extractProducts = () => {
    window.products = Array.isArray(window.products) ? window.products : [];

    let elements = document.getElementsByClassName('imageHighlight__GwVM highlightImage__n6NH');
    let links = document.querySelectorAll('a.productListCardWrapper___oy3');

    if (links.length === 0) {
      links = document.getElementsByClassName(
        'productCard__A2Ct clickable__DG3l inspiration__n1kn productCardWithImageAnimation__UvbZ productCardWithExpandAnimation__k5jQ'
      );
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const product = {
        status: element.querySelector('[data-automation="srp-product-list-card-badge"] strong')?.textContent.trim() || '',
        rating: element.querySelector('[data-automation="srp-product-list-card-rating"] .rating__JCMy')?.textContent.trim() || '',
        comments: (element.querySelector('[data-automation="srp-product-list-card-rating"] .reviewCount__FJR8')?.textContent.trim() || '').replace(/[^\d]/g, ''),
        title: element.querySelector('[data-automation="srp-product-list-card-title"]')?.textContent.trim() || '',
        description: Array.from(
          element.querySelectorAll('[data-automation="srp-product-list-card-duration"], [data-automation="srp-product-list-card-free-cancellation"]')
        )
          .map(el => el.textContent.trim().replace(/\s+/g, ' '))
          .join('; '),
        price: (element.querySelector('[data-automation="srp-product-list-card-price"] [data-automation="current-price"]')?.textContent.trim().replace(/\D+/g, '') || ''),
        priceDescription: element.querySelector('[data-automation="srp-product-list-card-price"] [class*="tieredPricingLabel"]')?.textContent.trim() || '',
        link: links[i]?.href || ''
      };

      if (!window.products.some(p => p.link === product.link && product.link)) {
        window.products.push(product);
      }
    }
  };

  const exportProducts = () => {
    const products = Array.isArray(window.products) ? window.products : [];
    if (!products.length) {
      setStatus('没有可导出的产品数据', true);
      return;
    }

    const fields = [
      { key: 'status', label: '销售状态' },
      { key: 'rating', label: '评分' },
      { key: 'comments', label: '评论数' },
      { key: 'title', label: '标题' },
      { key: 'description', label: '产品描述' },
      { key: 'price', label: '价格' },
      { key: 'priceDescription', label: '价格说明' },
      { key: 'link', label: '链接' }
    ];

    const escapeCsv = (val) => {
      const str = val == null ? '' : String(val);
      const sanitized = str.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
      const escaped = sanitized.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const header = fields.map(f => escapeCsv(f.label)).join(',');
    const rows = products.map(p => fields.map(f => escapeCsv(p[f.key])).join(',')).join('\n');

    const csvContent = '\ufeff' + header + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const termEl = document.querySelector('.searchTerm__VriX.amp-mask');
    const rawName = termEl ? termEl.textContent.trim() : '';
    const safeName = (rawName || 'products')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    const filename = `${safeName}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);

    setStatus(`已导出 ${products.length} 条`);
  };

  const runAuto = async () => {
    try {
      let pageIndex = 1;
      setStatus('开始自动提取...');

      while (true) {
        if (pageIndex > 1) {
          setStatus(`等待页面加载（第 ${pageIndex} 页）...`);
          await sleep(10000);
        }

        extractProducts();
        setStatus('已执行提取脚本');
        await sleep(600);

        const next = document.querySelector('a[aria-label="Next"]');
        if (!next) break;
        next.click();
        pageIndex += 1;
        await sleep(1200);
      }

      exportProducts();
    } catch (err) {
      console.error(err);
      setStatus('自动流程失败', true);
    }
  };

  autoBtn.addEventListener('click', runAuto);

  extractBtn.addEventListener('click', () => {
    try {
      extractProducts();
      setStatus('已执行提取脚本');
    } catch (err) {
      console.error(err);
      setStatus('提取失败，请查看控制台', true);
    }
  });

  exportBtn.addEventListener('click', () => {
    try {
      exportProducts();
    } catch (err) {
      console.error(err);
      setStatus('导出失败，请查看控制台', true);
    }
  });
})();
