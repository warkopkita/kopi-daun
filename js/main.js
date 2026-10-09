/* ====================================================
   KOPI & DAUN — JAVASCRIPT INTERACTIONS
   Complete logic for Mockup Switcher, Carousel,
   Ordering Cart, WhatsApp Reservation, and Lightbox
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════════════════
  // 1. TOP VIEW SWITCHER (Mockup, Fullscreen, Mobile)
  // ══════════════════════════════════════════════════════
  const switchButtons = document.querySelectorAll('.switch-btn');
  const body = document.body;

  switchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      
      // Update active button state
      switchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update body class
      body.classList.remove('mode-mockup', 'mode-fullscreen', 'mode-mobile');
      body.classList.add(mode);

      showToast(`Beralih ke: ${btn.querySelector('span').textContent}`);
    });
  });

  // ══════════════════════════════════════════════════════
  // 2. MOBILE CAROUSEL MENU FAVORIT
  // ══════════════════════════════════════════════════════
  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('#carousel-dots .dot');
  let currentSlide = 0;
  const totalSlides = dots.length;
  let autoSlideTimer = null;

  function updateCarousel(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    // Calculate slide percentage based on 2 cards visible (approx 50% width each card)
    const offset = currentSlide * 52; // 50% + gap percentage
    if (track) {
      track.style.transform = `translateX(-${offset}%)`;
    }

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
      updateCarousel(slideIndex);
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      updateCarousel(currentSlide + 1);
    }, 3800);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  if (track) {
    startAutoSlide();
    track.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    track.addEventListener('mouseleave', () => startAutoSlide());
  }

  // ══════════════════════════════════════════════════════
  // 3. CART & ORDERING SYSTEM (PESAN DI TEMPAT / TAKEAWAY)
  // ══════════════════════════════════════════════════════
  const cart = {};
  const orderModal = document.getElementById('order-modal');
  const btnCloseOrder = document.getElementById('btn-close-order');
  const openOrderButtons = document.querySelectorAll('.btn-open-order');
  const selectedItemsList = document.getElementById('selected-items-list');
  const orderGrandTotal = document.getElementById('order-grand-total');
  const dineInWrap = document.getElementById('dinein-field-wrap');
  const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
  const btnSubmitOrderWa = document.getElementById('btn-submit-order-wa');

  // Format currency
  function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  // Add Item to Order
  window.addToOrder = function (name, price) {
    if (cart[name]) {
      cart[name].qty += 1;
    } else {
      cart[name] = { price: price, qty: 1 };
    }
    renderCart();
    showToast(`🌿 1x ${name} ditambahkan!`);
  };

  // Change Quantity
  window.changeQty = function (name, delta) {
    if (!cart[name]) return;
    cart[name].qty += delta;
    if (cart[name].qty <= 0) {
      delete cart[name];
    }
    renderCart();
  };

  function renderCart() {
    if (!selectedItemsList || !orderGrandTotal) return;

    const keys = Object.keys(cart);
    if (keys.length === 0) {
      selectedItemsList.innerHTML = `
        <div style="text-align: center; padding: 16px; color: var(--c-text-sub); font-size: 0.82rem;">
          🛒 Belum ada item dipilih.<br>
          <span style="font-size: 0.76rem; opacity: 0.7;">Klik '+ Tambah' pada menu untuk memasukkan pesanan.</span>
        </div>
      `;
      orderGrandTotal.textContent = 'Rp 0';
      return;
    }

    let total = 0;
    let html = '';

    keys.forEach(name => {
      const item = cart[name];
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      html += `
        <div class="cart-item-row">
          <div>
            <div class="cart-item-name">${name}</div>
            <div class="cart-item-price">${formatRupiah(item.price)} × ${item.qty} = ${formatRupiah(itemTotal)}</div>
          </div>
          <div class="cart-item-qty">
            <button type="button" class="btn-qty" onclick="window.changeQty('${name}', -1)">-</button>
            <span style="font-weight: 700; font-size: 0.86rem; min-width: 16px; text-align: center;">${item.qty}</span>
            <button type="button" class="btn-qty" onclick="window.changeQty('${name}', 1)">+</button>
          </div>
        </div>
      `;
    });

    selectedItemsList.innerHTML = html;
    orderGrandTotal.textContent = formatRupiah(total);
  }

  // Open & Close Order Modal
  openOrderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // If empty, auto-add 1x Kopi Susu Aren as starter demo
      if (Object.keys(cart).length === 0) {
        cart['Kopi Susu Aren'] = { price: 20000, qty: 1 };
      }
      renderCart();
      orderModal?.classList.add('open');
    });
  });

  btnCloseOrder?.addEventListener('click', () => {
    orderModal?.classList.remove('open');
  });

  orderModal?.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      orderModal.classList.remove('open');
    }
  });

  // Switch Order Type (Dine-in vs Takeaway)
  orderTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (dineInWrap) {
        dineInWrap.style.display = radio.value === 'Dine-in' ? 'flex' : 'none';
      }
    });
  });

  // Submit Order via WhatsApp
  btnSubmitOrderWa?.addEventListener('click', () => {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      alert('Pilih minimal 1 menu terlebih dahulu!');
      return;
    }

    const buyerName = document.getElementById('buyer-name')?.value.trim();
    const buyerPhone = document.getElementById('buyer-phone')?.value.trim();
    const orderType = document.querySelector('input[name="order-type"]:checked')?.value || 'Dine-in';
    const tableNum = document.getElementById('table-num-input')?.value.trim();

    if (!buyerName || !buyerPhone) {
      alert('Mohon lengkapi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    let itemsText = '';
    let grandTotal = 0;
    keys.forEach((name, i) => {
      const item = cart[name];
      const sub = item.price * item.qty;
      grandTotal += sub;
      itemsText += `${i + 1}. ${name} (${item.qty}x) = ${formatRupiah(sub)}\n`;
    });

    const msg = `Halo Kasir *Kopi & Daun* 🌿☕\n\nSaya ingin memesan:\n${itemsText}\n*Total:* ${formatRupiah(grandTotal)}\n\n*Tipe Pesanan:* ${orderType} ${orderType === 'Dine-in' && tableNum ? '(' + tableNum + ')' : ''}\n*Nama Pemesan:* ${buyerName}\n*No. HP/WA:* ${buyerPhone}\n\nMohon diproses, terima kasih!`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/6281234567890?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  });

  // ══════════════════════════════════════════════════════
  // 4. RESERVASI MEJA VIA WHATSAPP
  // ══════════════════════════════════════════════════════
  const reserveButtons = document.querySelectorAll('.btn-open-reserve');
  const reserveForm = document.getElementById('main-reserve-form');

  reserveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Scroll to reservation section
      const target = document.getElementById('reservation');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Pulse effect
        target.style.transition = 'box-shadow 0.4s ease';
        target.style.boxShadow = '0 0 30px rgba(168, 86, 59, 0.4)';
        setTimeout(() => target.style.boxShadow = '', 1500);
      }
    });
  });

  reserveForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('res-name')?.value.trim();
    const phone = document.getElementById('res-phone')?.value.trim();
    const guests = document.getElementById('res-guests')?.value;
    const date = document.getElementById('res-date')?.value;
    const time = document.getElementById('res-time')?.value;
    const area = document.getElementById('res-area')?.value;
    const notes = document.getElementById('res-notes')?.value.trim();

    const msg = `Halo Tim Reservasi *Kopi & Daun* 🌿\n\nSaya ingin memesan meja dengan rincian berikut:\n- *Nama:* ${name}\n- *No. WhatsApp:* ${phone}\n- *Jumlah Tamu:* ${guests}\n- *Tanggal Kunjungan:* ${date}\n- *Jam Kedatangan:* ${time}\n- *Pilihan Area:* ${area}\n${notes ? '- *Catatan Tambahan:* ' + notes + '\n' : ''}\nMohon konfirmasi ketersediaan meja. Terima kasih!`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/6281234567890?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    showToast('Membuka WhatsApp untuk konfirmasi reservasi...');
  });

  // ══════════════════════════════════════════════════════
  // 5. PEMESANAN OJOL (GrabFood & ShopeeFood)
  // ══════════════════════════════════════════════════════
  window.openOjol = function (platform) {
    showToast(`🛵 Mengalihkan ke menu Kopi & Daun di ${platform}...`);
    setTimeout(() => {
      if (platform === 'GrabFood') {
        window.open('https://food.grab.com/id/id/restaurants', '_blank');
      } else {
        window.open('https://shopee.co.id/shopeefood', '_blank');
      }
    }, 600);
  };

  // ══════════════════════════════════════════════════════
  // 6. SOCIAL MEDIA FEED LIGHTBOX (@kopi.daun)
  // ══════════════════════════════════════════════════════
  const feedModal = document.getElementById('feed-modal');
  const btnCloseFeed = document.getElementById('btn-close-feed');
  const feedImg = document.getElementById('feed-media-img');
  const feedCaption = document.getElementById('feed-caption-text');

  const feedData = [
    {
      img: 'assets/images/menu/matcha-latte.jpg',
      caption: '🍃 Pure Ceremonial Matcha Latte Uji Jepang dinikmati di tengah rimbunnya tanaman Monstera. Suasana adem yang bikin betah berjam-jam!'
    },
    {
      img: 'assets/images/menu/kopi-susu-gula-aren.jpg',
      caption: '☕ Kopi Susu Aren favorit para penikmat kopi santai! Paduan creamy susu murni dan manis legit gula aren organik lokal.'
    },
    {
      img: 'assets/images/barista-about.jpg',
      caption: '👨‍🍳 Barista kami memastikan setiap ekstraksi biji kopi nusantara memiliki aroma dan rasa terbaik. Happy brewing!'
    },
    {
      img: 'assets/images/gallery/outdoor.jpg',
      caption: '🌿 Sudut outdoor botanical garden Kopi & Daun. Tempat favorit untuk ngobrol sore santai bareng teman dan keluarga.'
    }
  ];

  window.openFeedMedia = function (index) {
    const item = feedData[index] || feedData[0];
    if (feedImg) feedImg.src = item.img;
    if (feedCaption) feedCaption.textContent = item.caption;
    feedModal?.classList.add('open');
  };

  btnCloseFeed?.addEventListener('click', () => {
    feedModal?.classList.remove('open');
  });

  feedModal?.addEventListener('click', (e) => {
    if (e.target === feedModal) {
      feedModal.classList.remove('open');
    }
  });

  // ══════════════════════════════════════════════════════
  // 7. MENU FILTER TABS
  // ══════════════════════════════════════════════════════
  const filterBtns = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════
  // 8. MOBILE HAMBURGER & BOTTOM NAV ACTIVE
  // ══════════════════════════════════════════════════════
  const mobileHamburger = document.getElementById('mobile-hamburger');
  mobileHamburger?.addEventListener('click', () => {
    const target = document.getElementById('menu');
    target?.scrollIntoView({ behavior: 'smooth' });
    showToast('Membuka katalog menu lengkap...');
  });

  document.querySelectorAll('.btn-open-menu-drawer').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ══════════════════════════════════════════════════════
  // 9. TOAST NOTIFICATION HELPER
  // ══════════════════════════════════════════════════════
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

});
