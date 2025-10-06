/* ====== ضع رقمك هنا (بدون +) ====== */
const STORE_PHONE = '20XXXXXXXXXXX';
/* ================================= */

(function(){
  const SECTION_SIZES = {
    shirts: ['S','M','L'],
    pants: ['30','32','34'],
    shoes: ['40','41','42','43']
  };

  // DOM elements (مشتركة بين الصفحتين)
  const cartToggleBtn = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const clearCartBtn = document.getElementById('clearCart');
  const sendCartBtn = document.getElementById('sendCart');

  const imgModal = document.getElementById('imgModal');
  const imgModalImg = document.getElementById('imgModalImg');
  const closeImgModal = document.getElementById('closeImgModal');

  // Buy modal
  const buyModal = document.getElementById('buyModal');
  const closeBuyModal = document.getElementById('closeBuyModal');
  const buyForm = document.getElementById('buyForm');
  const buyCancel = document.getElementById('buyCancel');

  const formProdName = document.getElementById('modalProdName');
  const formProdPrice = document.getElementById('modalProdPrice');
  const formProdSize = document.getElementById('modalProdSize');
  const formSelectSize = document.getElementById('formSize');
  const formQty = document.getElementById('formQty');
  const formName = document.getElementById('formName');
  const formPhone = document.getElementById('formPhone');
  const formPhoneAlt = document.getElementById('formPhoneAlt');
  const formAddress = document.getElementById('formAddress');
  const formNotes = document.getElementById('formNotes');

  // Section page elements
  const sizesContainer = document.getElementById('sizesContainer');
  const productsList = document.getElementById('productsList');
  const productsHint = document.getElementById('productsHint');

  // nav links
  const navLinks = Array.from(document.querySelectorAll('.topnav .nav-link'));

  // cart in localStorage
  let cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');

  function saveCart(){ localStorage.setItem('shop_cart', JSON.stringify(cart)); }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderCart(){
    if(!cartItemsEl) return;
    if(cart.length === 0){
      cartItemsEl.innerHTML = 'العربة فارغة';
      if(cartTotalEl) cartTotalEl.innerText = 'الإجمالي: 0 ج.م';
      return;
    }
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((it, idx) => {
      total += (Number(it.price) || 0) * it.qty;
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.marginBottom = '10px';
      row.innerHTML = `
        <div>
          <div style="font-weight:700">${escapeHtml(it.name)}</div>
          <div style="color:#a8a8a8;font-size:13px">${escapeHtml(it.size)} • ${it.qty} × ${it.price} ج.م</div>
          ${it.notes ? `<div style="color:#a8a8a8;font-size:13px">ملاحظات: ${escapeHtml(it.notes)}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn" data-cart-action="inc" data-idx="${idx}">+</button>
          <button class="btn" data-cart-action="dec" data-idx="${idx}">-</button>
          <button class="btn" data-cart-action="rem" data-idx="${idx}">حذف</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    if(cartTotalEl) cartTotalEl.innerText = `الإجمالي: ${total} ج.م`;

    // bind cart controls
    cartItemsEl.querySelectorAll('[data-cart-action]').forEach(btn => {
      btn.addEventListener('click', function(){
        const idx = Number(this.dataset.idx);
        const act = this.dataset.cartAction;
        if(act === 'inc') cart[idx].qty++;
        else if(act === 'dec'){ if(cart[idx].qty>1) cart[idx].qty--; else cart.splice(idx,1); }
        else if(act === 'rem') cart.splice(idx,1);
        saveCart();
        renderCart();
      });
    });
  }

  function toggleCart(){ if(!cartDrawer) return; cartDrawer.classList.toggle('open'); cartDrawer.setAttribute('aria-hidden', !cartDrawer.classList.contains('open')); renderCart(); }
  function closeCart(){ if(!cartDrawer) return; cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); }

  if(cartToggleBtn) cartToggleBtn.addEventListener('click', toggleCart);
  if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if(clearCartBtn) clearCartBtn.addEventListener('click', function(){ if(confirm('تفريغ العربة؟')){ cart=[]; saveCart(); renderCart(); }});
  if(sendCartBtn) sendCartBtn.addEventListener('click', sendCartWhatsApp);

  /* ------------------ PRODUCT LIGHTBOX MODAL (عرض مربع المنتج بالكامل) ------------------ */

  // سننشئ مودال للمنتج ديناميكياً ونعيد استخدامه
  let productModalEl = null;
  function ensureProductModal(){
    if(productModalEl) return productModalEl;

    const wrapper = document.createElement('div');
    wrapper.id = 'productModal';
    wrapper.className = 'product-modal';
    wrapper.setAttribute('aria-hidden','true');
    wrapper.style.position = 'fixed';
    wrapper.style.inset = '0';
    wrapper.style.display = 'none';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'rgba(0,0,0,0.85)';
    wrapper.style.zIndex = 1200;
    wrapper.style.padding = '16px';

    // inner card (mimic product card but larger)
    wrapper.innerHTML = `
      <div class="product-modal-card" style="width:100%;max-width:760px;background:var(--card);border-radius:12px;padding:16px;position:relative;box-shadow:0 30px 60px rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.04);">
        <button class="product-modal-close" aria-label="إغلاق" style="position:absolute;left:12px;top:12px;background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer;">✕</button>
        <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">
          <div class="product-modal-thumb" style="flex:0 0 320px;max-width:45%;min-width:220px;border-radius:10px;overflow:hidden;background:#0b0b0b;display:grid;place-items:center;">
            <img src="" alt="" style="width:100%;height:100%;object-fit:contain;display:block;" />
          </div>
          <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:10px;">
            <h2 class="product-modal-title" style="margin:0;font-size:20px;font-weight:800;"></h2>
            <div class="product-modal-meta" style="color:var(--muted);font-size:14px;"></div>
            <div class="product-modal-price" style="margin-top:8px;font-weight:800;color:var(--gold);font-size:18px;"></div>
            <div class="product-modal-actions" style="margin-top:10px;">
              <button class="btn product-modal-buy" data-action="buy" style="padding:10px 14px;border-radius:10px;background:linear-gradient(90deg,var(--gold),#b78f3b);color:#070707;font-weight:700;border:0;cursor:pointer;">اشتري الآن</button>
              <button class="btn product-modal-close-alt" style="padding:10px 14px;border-radius:10px;margin-left:8px;border:0;cursor:pointer;background:transparent;color:var(--muted);">إغلاق</button>
            </div>
            <div class="product-modal-desc" style="color:var(--muted);font-size:13px;margin-top:8px;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
    productModalEl = wrapper;

    // عناصر داخل المودال
    const closeBtn = productModalEl.querySelector('.product-modal-close');
    const closeAlt = productModalEl.querySelector('.product-modal-close-alt');
    closeBtn && closeBtn.addEventListener('click', closeProductModal);
    closeAlt && closeAlt.addEventListener('click', closeProductModal);

    // close on backdrop click
    productModalEl.addEventListener('click', function(e){
      if(e.target === productModalEl) closeProductModal();
    });
    // close on esc
    window.addEventListener('keydown', function(e){
      if((e.key === 'Escape' || e.key === 'Esc') && productModalEl && productModalEl.classList.contains('open')) closeProductModal();
    });

    // buy button inside product modal should open buy modal prefilled
    const buyBtn = productModalEl.querySelector('.product-modal-buy');
    buyBtn && buyBtn.addEventListener('click', function(){
      // find the linked product card stored on modal
      const linkedCard = productModalEl._linkedCard;
      if(linkedCard) openBuyModalForCard(linkedCard);
      // close product modal (buy modal will open)
      closeProductModal();
    });

    return productModalEl;
  }

  function openProductModal(card){
    const modal = ensureProductModal();
    if(!modal) return;

    // fill data from card
    const imgEl = modal.querySelector('.product-modal-thumb img');
    const titleEl = modal.querySelector('.product-modal-title');
    const metaEl = modal.querySelector('.product-modal-meta');
    const priceEl = modal.querySelector('.product-modal-price');
    const descEl = modal.querySelector('.product-modal-desc');

    const imageSrc = card.dataset.image || (card.querySelector('img') && card.querySelector('img').src) || '';
    const name = card.dataset.name || (card.querySelector('h4') && card.querySelector('h4').innerText) || '';
    const price = card.dataset.price || '';
    const sizes = card.dataset.sizes || '';
    const metaText = sizes ? `مقاسات: ${sizes}` : (card.querySelector('.meta') ? card.querySelector('.meta').innerText : '');

    imgEl.src = imageSrc;
    imgEl.alt = name;
    titleEl.innerText = name;
    metaEl.innerText = metaText;
    priceEl.innerText = price ? `${price} ج.م` : '';
    descEl.innerText = card.querySelector('.meta') ? card.querySelector('.meta').innerText : '';

    // store reference to card so Buy button can use it
    modal._linkedCard = card;

    // show modal
    modal.style.display = 'flex';
    setTimeout(()=>{ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal(){
    if(!productModalEl) return;
    productModalEl.classList.remove('open');
    productModalEl.setAttribute('aria-hidden','true');
    productModalEl.style.display = 'none';
    productModalEl._linkedCard = null;
    document.body.style.overflow = '';
  }

  /* ------------------ adjust image click behavior:
       - rev-thumb => open image modal (full image)
       - clicking on product card or its image => open product modal (full card)
  ------------------------------------------------------------------ */

  // prevent duplicate handlers: remove any previous prod-img handler if existed by avoiding earlier direct binding
  // use a single document click listener to route events
  document.addEventListener('click', function(e){
    // if click on review thumbnail -> open image modal
    const revImg = e.target.closest('.rev-thumb');
    if(revImg){
      if(imgModal && imgModalImg){
        imgModalImg.src = revImg.src;
        imgModal.classList.add('open');
        imgModal.setAttribute('aria-hidden','false');
      }
      return;
    }

    // if click inside a product card BUT not clicking on buy button inside the card
    const clickedBuyBtn = e.target.closest('button') && e.target.closest('button').dataset && e.target.closest('button').dataset.action === 'buy';
    if(clickedBuyBtn){
      // let other handler manage buy click (below) — do not open product modal
      return;
    }

    const prodCard = e.target.closest('.product');
    if(prodCard){
      // show product modal
      openProductModal(prodCard);
      return;
    }

    // if click on standalone product image (prod-img) that is not wrapped into .product for some reason
    const prodImg = e.target.closest('.prod-img');
    if(prodImg){
      const card = prodImg.closest('.product');
      if(card){
        openProductModal(card);
      } else {
        // fallback: open image modal
        if(imgModal && imgModalImg){
          imgModalImg.src = prodImg.src;
          imgModal.classList.add('open');
          imgModal.setAttribute('aria-hidden','false');
        }
      }
      return;
    }
  });

  // existing reviews image modal close handlers (keep them)
  if(document.getElementById('reviews')){
    document.getElementById('reviews').addEventListener('click', function(e){
      const rev = e.target.closest('.rev-img');
      if(!rev) return;
      const img = rev.querySelector('img');
      if(img && imgModal && imgModalImg){
        imgModalImg.src = img.src;
        imgModal.classList.add('open');
        imgModal.setAttribute('aria-hidden','false');
      }
    });
  }
  if(closeImgModal) closeImgModal.addEventListener('click', function(){ if(imgModal){ imgModal.classList.remove('open'); imgModal.setAttribute('aria-hidden','true'); imgModalImg.src = ''; } });
  if(imgModal) imgModal.addEventListener('click', function(e){ if(e.target === imgModal){ imgModal.classList.remove('open'); imgModal.setAttribute('aria-hidden','true'); imgModalImg.src = ''; } });

  // buy modal handlers
  if(closeBuyModal) closeBuyModal.addEventListener('click', closeBuy);
  if(buyCancel) buyCancel.addEventListener('click', closeBuy);
  if(buyModal) buyModal.addEventListener('click', function(e){ if(e.target === buyModal) closeBuy(); });

  function openBuyModalForCard(card){
    if(!buyModal) return;
    const name = card.dataset.name || (card.querySelector('h4') && card.querySelector('h4').innerText) || '';
    const price = card.dataset.price || '';
    const sizes = (card.dataset.sizes || '').split(',').map(s => s.trim()).filter(Boolean);

    if(formProdName) formProdName.innerText = name;
    if(formProdPrice) formProdPrice.innerText = price;
    if(formProdSize) formProdSize.innerText = sizes.length ? sizes[0] : '-';

    if(formSelectSize){
      formSelectSize.innerHTML = '';
      sizes.forEach(sz => {
        const opt = document.createElement('option');
        opt.value = sz;
        opt.innerText = sz;
        formSelectSize.appendChild(opt);
      });
      if(window.__selectedSize && sizes.includes(window.__selectedSize)) formSelectSize.value = window.__selectedSize;
    }

    if(formQty) formQty.value = 1;
    if(formName) formName.value = '';
    if(formPhone) formPhone.value = '';
    if(formPhoneAlt) formPhoneAlt.value = '';
    if(formAddress) formAddress.value = '';
    if(formNotes) formNotes.value = '';

    if(buyForm){
      buyForm.dataset.prodName = name;
      buyForm.dataset.prodPrice = price;
    }

    buyModal.classList.add('open');
    buyModal.setAttribute('aria-hidden','false');
    setTimeout(()=>{ if(formName) formName.focus(); },150);
  }

  function closeBuy(){
    if(!buyModal) return;
    buyModal.classList.remove('open');
    buyModal.setAttribute('aria-hidden','true');
  }

  if(buyForm){
    buyForm.addEventListener('submit', function(ev){
      ev.preventDefault();
      const prodName = buyForm.dataset.prodName || 'منتج';
      const prodPrice = Number(buyForm.dataset.prodPrice || 0);
      const size = formSelectSize ? formSelectSize.value : (formProdSize ? formProdSize.innerText : '');
      const qty = formQty ? Math.max(1, Number(formQty.value || 1)) : 1;
      const name = formName ? sanitizeInput(formName.value) : '';
      const phone = formPhone ? sanitizeInput(formPhone.value) : '';
      const phoneAlt = formPhoneAlt ? sanitizeInput(formPhoneAlt.value) : '';
      const address = formAddress ? sanitizeInput(formAddress.value) : '';
      const notes = formNotes ? sanitizeInput(formNotes.value) : '';

      if(!name || !phone){
        alert('من فضلك املأ الاسم ورقم الهاتف.');
        return;
      }

      // add item with buyer info stored
      addToCart({
        name: prodName,
        price: prodPrice,
        size: size || '',
        qty: qty,
        notes: notes || '',
        buyerName: name,
        buyerPhone: phone,
        buyerPhoneAlt: phoneAlt,
        buyerAddress: address
      });

      closeBuy();
    });
  }

  // click handler — only BUY action (requires a selected size)
  document.addEventListener('click', function(e){
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;

    if(action === 'buy'){
      const card = btn.closest('.product');
      if(!card) return;

      const globalSize = window.__selectedSize || null;
      const cardSizes = (card.dataset.sizes || '').split(',').map(s=>s.trim()).filter(Boolean);

      if(!globalSize){
        alert('من فضلك اختَر المقاس أولاً من الأعلى ثم اضغط "اشتري الآن".');
        flashSizesContainer();
        const sc = document.querySelector('.sizes');
        if(sc) sc.scrollIntoView({behavior:'smooth', block:'center'});
        return;
      }

      if(cardSizes.length && !cardSizes.includes(globalSize)){
        alert('المقاس المختار غير متوفر لهذا المنتج. اختر مقاسًا آخر أو منتجًا آخر.');
        flashSizesContainer();
        return;
      }

      openBuyModalForCard(card);
      // modal will pick the global size if compatible
    }
  });

  function addToCart(item){
    const idx = cart.findIndex(i => i.name === item.name && i.size === item.size && (i.notes||'') === (item.notes||''));
    if(idx > -1) {
      cart[idx].qty += item.qty;
      if(!cart[idx].buyerName && item.buyerName) {
        cart[idx].buyerName = item.buyerName;
        cart[idx].buyerPhone = item.buyerPhone;
        cart[idx].buyerPhoneAlt = item.buyerPhoneAlt || '';
        cart[idx].buyerAddress = item.buyerAddress || '';
      }
    } else cart.push({...item});
    saveCart();
    renderCart();
    if(cartDrawer){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); }
  }

  function sendCartWhatsApp(){
    if(cart.length === 0){ alert('العربة فارغة — أضف منتجات أولاً.'); return; }

    const itemWithBuyer = cart.find(it => it.buyerName && it.buyerPhone);
    if(!itemWithBuyer){
      alert('يجب أن تضيف منتجًا عبر زر "اشتري الآن" أولاً حتى نملك بيانات العميل لإرسال الطلب.');
      return;
    }

    const buyerName = itemWithBuyer.buyerName;
    const buyerPhone = itemWithBuyer.buyerPhone;
    const buyerPhoneAlt = itemWithBuyer.buyerPhoneAlt || '';
    const buyerAddress = itemWithBuyer.buyerAddress || '';

    const lines = [];
    lines.push('طلب جديد من المتجر');
    lines.push('-------------------------');
    cart.forEach((it, idx)=>{
      lines.push(`${idx+1}. ${it.name} | مقاس: ${it.size || '-'} | كمية: ${it.qty} | سعر الوحدة: ${it.price} ج.م`);
      if(it.notes) lines.push(`ملاحظات المنتج: ${it.notes}`);
    });
    const total = cart.reduce((s,i)=> s + (Number(i.price)||0)*i.qty, 0);
    lines.push('-------------------------');
    lines.push(`الإجمالي: ${total} ج.م`);
    lines.push('');
    lines.push('--- بيانات العميل ---');
    lines.push(`الاسم: ${buyerName}`);
    lines.push(`الهاتف: ${buyerPhone}`);
    if(buyerPhoneAlt) lines.push(`هاتف احتياطي: ${buyerPhoneAlt}`);
    lines.push(`العنوان/ملاحظات: ${buyerAddress || '-'}`);

    const msg = encodeURIComponent(lines.join('\n'));
    const waUrl = `https://wa.me/${STORE_PHONE}?text=${msg}`;
    window.open(waUrl, '_blank');
  }

  // section page behavior: sizes, filtering
  if(sizesContainer && productsList){
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') || '';
    const titleEl = document.getElementById('sectionTitle');
    if(titleEl) titleEl.innerText = (section === 'shirts' ? 'قمصان' : section === 'pants' ? 'بناطيل' : section === 'shoes' ? 'أحذية' : 'القسم');

    const sizes = SECTION_SIZES[section] || getUniqueSizesFromProducts(section);
    renderSizes(sizes, section);
    window.__selectedSize = null;

    function renderSizes(list, sectionName){
      sizesContainer.innerHTML = '';
      if(!list || list.length === 0){
        sizesContainer.innerHTML = '<div class="note">لا توجد مقاسات لهذا القسم.</div>';
        return;
      }
      list.forEach(sz => {
        const b = document.createElement('button');
        b.className = 'size-chip';
        b.innerText = sz;
        b.addEventListener('click', function(){
          document.querySelectorAll('.size-chip').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          window.__selectedSize = sz;
          filterProducts(sectionName, sz);
        });
        sizesContainer.appendChild(b);
      });
    }

    function getUniqueSizesFromProducts(sectionName){
      const cards = Array.from(document.querySelectorAll('.product')).filter(c => c.dataset.section === sectionName);
      const s = new Set();
      cards.forEach(c => { (c.dataset.sizes || '').split(',').map(x=>x.trim()).filter(Boolean).forEach(z => s.add(z)); });
      return Array.from(s);
    }

    function filterProducts(sectionName, size){
      const cards = Array.from(document.querySelectorAll('.product'));
      let any = false;
      cards.forEach(c => {
        const sec = c.dataset.section;
        const sizes = (c.dataset.sizes||'').split(',').map(x=>x.trim()).filter(Boolean);
        if(sec === sectionName && sizes.includes(size)){
          c.style.display = '';
          any = true;
        } else c.style.display = 'none';
      });
      if(!any){
        productsList.classList.add('hidden');
        if(productsHint) productsHint.innerText = 'لا توجد منتجات للمقاس/القسم المختار — جرّب مقاساً آخراً.';
      } else {
        productsList.classList.remove('hidden');
        if(productsHint) productsHint.style.display = 'none';
      }
    }
  }

  // helper utilities
  function sanitizeInput(s){
    if(!s) return '';
    s = String(s).replace(/\r\n|\r/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/[\u0000-\u001F\u007F]/g,'');
    return s.slice(0,800);
  }

  function flashSizesContainer(){
    const sc = document.querySelector('.sizes');
    if(!sc) return;
    sc.style.transition = 'box-shadow 0.18s ease';
    sc.style.boxShadow = '0 0 0 6px rgba(200,162,74,0.12)';
    setTimeout(()=>{ sc.style.boxShadow = '0 0 0 0 rgba(0,0,0,0)'; }, 420);
  }

  // mark active nav link based on current location
  function setActiveNav(){
    try{
      const url = new URL(window.location.href);
      const page = url.pathname.split('/').pop() || 'index.html';
      const params = url.searchParams;
      navLinks.forEach(a => {
        a.classList.remove('active');
        const href = a.getAttribute('href') || '';
        // match homepage
        if((page === 'index.html' || page === '') && href.indexOf('index.html') !== -1) a.classList.add('active');
        // match sections by query param
        if(href.indexOf('?section=') !== -1 && params.get('section') && href.indexOf(params.get('section')) !== -1) a.classList.add('active');
        // direct match for static links
        if(href.endsWith(page)) a.classList.add('active');
      });
    }catch(e){}
  }

  // init
  (function init(){
    renderCart();
    setActiveNav();
  })();

})();
