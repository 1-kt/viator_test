(() => {
  // 确保全局产品数组存在
  window.products = Array.isArray(window.products) ? window.products : [];

  // 注意：避免用单独的 links 列表按索引对应，尽量在每个卡片内找链接
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

    // 按链接去重，避免重复数据
    if (!window.products.some(p => p.link === product.link && product.link)) {
      window.products.push(product);
      console.log(product);
    }
  }

  console.log('累计产品数量:', window.products.length);
  console.log(window.products);
})();
