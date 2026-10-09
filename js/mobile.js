/* ====================================================
   KOPI & DAUN — MOBILE APP LOGIC
   Search System, Carousel, WhatsApp Cart & Reservation
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Database Menu untuk Pencarian Cepat di HP ──
  const menuCatalog = [
    { name: 'Kopi Susu Aren', price: 20000, cat: 'kopi', img: 'assets/images/menu/kopi-susu-gula-aren.jpg', desc: 'Espresso arabika blend, susu segar, gula aren organik.' },
    { name: 'Croissant Almond', price: 30000, cat: 'pastry', img: 'assets/images/menu/croissant-almond.jpg', desc: 'Pastry butter Prancis dengan isian krim almond manis.' },
    { name: 'Matcha Latte', price: 25000, cat: 'non-kopi', img: 'assets/images/menu/matcha-latte.jpg', desc: 'Pure ceremonial matcha Uji Jepang dengan susu lembut.' },
    { name: 'Classic Cappuccino', price: 28000, cat: 'kopi', img: 'assets/images/menu/cappuccino.jpg', desc: 'Double espresso, steamed milk, dan foam tebal latte art.' },
    { name: 'Chicken Katsu Donburi', price: 42000, cat: 'makanan', img: 'assets/images/menu/chicken-katsu.jpg', desc: 'Ayam katsu renyah saus gurih, telur, dan nasi Jepang.' },
    { name: 'Nasi Goreng Kopi & Daun', price: 38000, cat: 'makanan', img: 'assets/images/menu/nasi-goreng.jpg', desc: 'Nasi rempah Nusantara dengan sate ayam & telur mata sapi.' },
    { name: 'Authentic Thai Tea', price: 22000, cat: 'non-kopi', img: 'assets/images/menu/thai-tea.jpg', desc: 'Daun teh merah Thailand pekat dengan susu evaporasi.' },
    { name: 'Tiramisu Classic', price: 35000, cat: 'pastry', img: 'assets/images/menu/tiramisu.jpg', desc: 'Ladyfingers espresso, mascarpone lembut, bubuk kakao.' }
  ];

  // ══════════════════════════════════════════════════════
  // 1. SISTEM PENCARIAN DI HP (LIVE SEARCH & FILTER TAGS)
  // ══════════════════════════════════════════════════════
  const searchInput = document.getElementById('mobile-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const searchOverlay = document.getElementById('search-results-overlay');
  const resultsList = document.getElementById('results-list');
  const resultsCount = document.getElementById('results-count');
  const btnCloseResults = document.getElementById('btn-close-results');
  const tagChips = document.querySelectorAll('.tag-chip');

  function renderSearchResults(items, query = '') {
    if (!resultsList) return;

    if (items.length === 0) {
      resultsList.innerHTML = `
        <div style="text-align: center; padding: 20px 10px; color: var(--c-sub); font-size: 0.8rem;">
          🔍 Tidak ditemukan menu untuk "<strong>${query}</strong>".<br>
          <span style="font-size: 0.72rem; opacity: 0.7;">Coba kata kunci: kopi, aren, matcha, katsu, croissant</span>
        </div>
      `;
      if (resultsCount) resultsCount.textContent = '0 Hasil Ditemukan';
    } else {
      let html = '';
      items.forEach(item => {
        html += `
          <div class="result-card-item">
            <div class="result-card-left">
              <img src="${item.img}" alt="${item.name}" class="result-thumb">
              <div>
                <h4 class="result-title">${item.name}</h4>
                <span class="result-price">Rp ${item.price.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button type="button" class="btn-mini-add" onclick="window.addMobileCart('${item.name}', ${item.price})">
              + Tambah
            </button>
          </div>
        `;
      });
      resultsList.innerHTML = html;
      if (resultsCount) resultsCount.textContent = `${items.length} Menu Ditemukan`;
    }

    searchOverlay?.classList.add('active');
  }

  // Live Input Event
  searchInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();

    if (val.length > 0) {
      if (btnClearSearch) btnClearSearch.style.display = 'block';

      const filtered = menuCatalog.filter(item => 
        item.name.toLowerCase().includes(val) ||
        item.desc.toLowerCase().includes(val) ||
        item.cat.toLowerCase().includes(val)
      );

      renderSearchResults(filtered, val);
    } else {
      if (btnClearSearch) btnClearSearch.style.display = 'none';
      searchOverlay?.classList.remove('active');
    }
  });

  // Clear search
  btnClearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    btnClearSearch.style.display = 'none';
    searchOverlay?.classList.remove('active');
    searchInput?.focus();
  });

  btnCloseResults?.addEventListener('click', () => {
    searchOverlay?.classList.remove('active');
  });

  // Filter Chips Click
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      tagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const tag = chip.getAttribute('data-tag');
      window.filterByTag(tag);
    });
  });

  window.filterByTag = function (tag) {
    if (tag === 'all') {
      renderSearchResults(menuCatalog, 'Semua Menu');
    } else {
      const filtered = menuCatalog.filter(item => item.cat === tag);
      renderSearchResults(filtered, tag);
    }
  };

  // Nav Button "Cari Menu" in bottom bar
  const navBtnSearch = document.getElementById('nav-btn-search');
  navBtnSearch?.addEventListener('click', () => {
    searchInput?.focus();
    searchInput?.scrollIntoView({ behavior: 'smooth' });
    showToast('Ketik nama menu di kotak pencarian 🔍');
  });

  // ══════════════════════════════════════════════════════
  // 2. CAROUSEL MENU FAVORIT (HP)
  // ══════════════════════════════════════════════════════
  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('#carousel-dots .c-dot');
  let currentSlide = 0;
  const totalSlides = dots.length;
  let timer = null;

  function updateCarousel(idx) {
    currentSlide = (idx + totalSlides) % totalSlides;
    const offset = currentSlide * 52; // width percent approx
    if (track) track.style.transform = `translateX(-${offset}%)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const s = parseInt(dot.getAttribute('data-slide'), 10);
      updateCarousel(s);
      resetAuto();
    });
  });

  function startAuto() {
    timer = setInterval(() => {
      updateCarousel(currentSlide + 1);
    }, 3500);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  if (track) startAuto();

  // ══════════════════════════════════════════════════════
  // 3. KERANJANG BELANJA MOBILE & CHECKOUT WHATSAPP
  // ══════════════════════════════════════════════════════
  const cart = {};
  const cartCounter = document.getElementById('cart-counter');
  const modalCart = document.getElementById('modal-cart');
  const btnOpenCart = document.getElementById('btn-open-cart');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const btnTriggerOrder = document.getElementById('btn-trigger-order');
  const mobileCartItems = document.getElementById('mobile-cart-items');
  const mobileGrandTotal = document.getElementById('mobile-grand-total');
  const btnCheckoutMobileWa = document.getElementById('btn-checkout-mobile-wa');
  const mobileTypeRadios = document.querySelectorAll('input[name="mobile-order-type"]');
  const mobileTableField = document.getElementById('mobile-table-field');

  function updateCartBadge() {
    const totalCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    if (cartCounter) cartCounter.textContent = totalCount;
  }

  window.addMobileCart = function (name, price) {
    if (cart[name]) {
      cart[name].qty += 1;
    } else {
      cart[name] = { price: price, qty: 1 };
    }
    updateCartBadge();
    renderMobileCart();
    showToast(`🛒 1x ${name} dimasukkan ke keranjang`);
  };

  window.changeMobileQty = function (name, delta) {
    if (!cart[name]) return;
    cart[name].qty += delta;
    if (cart[name].qty <= 0) {
      delete cart[name];
    }
    updateCartBadge();
    renderMobileCart();
  };

  function renderMobileCart() {
    if (!mobileCartItems || !mobileGrandTotal) return;

    const keys = Object.keys(cart);
    if (keys.length === 0) {
      mobileCartItems.innerHTML = `
        <div style="text-align: center; padding: 14px; color: var(--c-sub); font-size: 0.78rem;">
          🛒 Keranjang masih kosong.<br>
          <span style="opacity: 0.7; font-size: 0.72rem;">Klik '+ Tambah' pada menu di atas.</span>
        </div>
      `;
      mobileGrandTotal.textContent = 'Rp 0';
      return;
    }

    let total = 0;
    let html = '';

    keys.forEach(name => {
      const item = cart[name];
      const sub = item.price * item.qty;
      total += sub;

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 0.82rem; font-weight: 600; color: #ffffff;">${name}</div>
            <div style="font-size: 0.74rem; color: var(--c-gold);">Rp ${item.price.toLocaleString('id-ID')} × ${item.qty}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" style="width:24px; height:24px; border-radius:6px; background:#233524; color:#fff; border:none; cursor:pointer;" onclick="window.changeMobileQty('${name}', -1)">-</button>
            <span style="font-size:0.84rem; font-weight:700;">${item.qty}</span>
            <button type="button" style="width:24px; height:24px; border-radius:6px; background:#233524; color:#fff; border:none; cursor:pointer;" onclick="window.changeMobileQty('${name}', 1)">+</button>
          </div>
        </div>
      `;
    });

    mobileCartItems.innerHTML = html;
    mobileGrandTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
  }

  // Open Drawer Cart
  function openCartDrawer() {
    if (Object.keys(cart).length === 0) {
      cart['Kopi Susu Aren'] = { price: 20000, qty: 1 };
      updateCartBadge();
    }
    renderMobileCart();
    modalCart?.classList.add('open');
  }

  btnOpenCart?.addEventListener('click', openCartDrawer);
  btnTriggerOrder?.addEventListener('click', openCartDrawer);

  btnCloseCart?.addEventListener('click', () => {
    modalCart?.classList.remove('open');
  });

  modalCart?.addEventListener('click', (e) => {
    if (e.target === modalCart) modalCart.classList.remove('open');
  });

  // Switch Dine-in / Takeaway
  mobileTypeRadios.forEach(r => {
    r.addEventListener('change', () => {
      if (mobileTableField) {
        mobileTableField.style.display = r.value === 'Dine-in' ? 'flex' : 'none';
      }
    });
  });

  // Checkout to WhatsApp
  btnCheckoutMobileWa?.addEventListener('click', () => {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      alert('Pilih minimal 1 menu!');
      return;
    }

    const name = document.getElementById('m-buyer-name')?.value.trim();
    const phone = document.getElementById('m-buyer-phone')?.value.trim();
    const type = document.querySelector('input[name="mobile-order-type"]:checked')?.value || 'Dine-in';
    const table = document.getElementById('m-table-num')?.value.trim();

    if (!name || !phone) {
      alert('Mohon isi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    let itemsStr = '';
    let total = 0;
    keys.forEach((k, i) => {
      const itm = cart[k];
      const sub = itm.price * itm.qty;
      total += sub;
      itemsStr += `${i + 1}. ${k} (${itm.qty}x) = Rp ${sub.toLocaleString('id-ID')}\n`;
    });

    const msg = `Halo Kasir *Kopi & Daun* 🌿☕\n(Pesanan via Mobile Web)\n\nSaya ingin memesan:\n${itemsStr}\n*Total:* Rp ${total.toLocaleString('id-ID')}\n\n*Tipe:* ${type} ${type === 'Dine-in' && table ? '(' + table + ')' : ''}\n*Nama:* ${name}\n*No. WA:* ${phone}\n\nMohon diproses, terima kasih!`;

    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });

  // ══════════════════════════════════════════════════════
  // 4. RESERVASI MEJA MOBILE
  // ══════════════════════════════════════════════════════
  const modalReserve = document.getElementById('modal-reserve');
  const btnCloseReserve = document.getElementById('btn-close-reserve');
  const btnTriggerReserve = document.getElementById('btn-trigger-reserve');
  const navBtnReserve = document.getElementById('nav-btn-reserve');
  const formMobileReserve = document.getElementById('form-mobile-reserve');

  function openReserveDrawer() {
    modalReserve?.classList.add('open');
  }

  btnTriggerReserve?.addEventListener('click', openReserveDrawer);
  navBtnReserve?.addEventListener('click', openReserveDrawer);

  btnCloseReserve?.addEventListener('click', () => {
    modalReserve?.classList.remove('open');
  });

  modalReserve?.addEventListener('click', (e) => {
    if (e.target === modalReserve) modalReserve.classList.remove('open');
  });

  formMobileReserve?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('m-name')?.value.trim();
    const phone = document.getElementById('m-phone')?.value.trim();
    const guests = document.getElementById('m-guests')?.value;
    const date = document.getElementById('m-date')?.value;
    const time = document.getElementById('m-time')?.value;
    const area = document.getElementById('m-area')?.value;
    const notes = document.getElementById('m-notes')?.value.trim();

    const msg = `Halo Tim *Kopi & Daun* 🌿\n(Reservasi Meja via HP)\n\n- *Nama:* ${name}\n- *No. WA:* ${phone}\n- *Tamu:* ${guests}\n- *Tanggal:* ${date}\n- *Jam:* ${time}\n- *Pilihan Area:* ${area}\n${notes ? '- *Catatan:* ' + notes + '\n' : ''}\nMohon konfirmasi meja kami, terima kasih!`;

    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    showToast('Membuka WhatsApp untuk reservasi...');
  });

  // ══════════════════════════════════════════════════════
  // 5. OJOL DELIVERY HANDLER
  // ══════════════════════════════════════════════════════
  window.openOjolDelivery = function (platform) {
    showToast(`🛵 Membuka menu Kopi & Daun di ${platform}...`);
    setTimeout(() => {
      if (platform === 'GrabFood') {
        window.open('https://food.grab.com/id/id/restaurants', '_blank');
      } else {
        window.open('https://shopee.co.id/shopeefood', '_blank');
      }
    }, 500);
  };

  // ══════════════════════════════════════════════════════
  // 6. TOAST NOTIFICATION
  // ══════════════════════════════════════════════════════
  function showToast(text) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = text;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

});
