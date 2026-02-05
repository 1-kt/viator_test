(() => {
  const products = Array.isArray(window.products) ? window.products : [];
  if (!products.length) {
    console.warn('没有可导出的产品数据，window.products 为空或不是数组');
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
  const rows = products
    .map(p => fields.map(f => escapeCsv(p[f.key])).join(','))
    .join('\n');

  const csvContent = '\ufeff' + header + '\n' + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const termEl = document.querySelector('.searchTerm__VriX.amp-mask');
  const rawName = termEl ? termEl.textContent.trim() : '';
  const safeName = (rawName)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  const filename = `${safeName}.csv`;
  console.log(`导出文件名: ${filename}`);

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
})();
