import { createMockAnalysisEngine } from './analysis-engine/index.js';

const analysisEngine = createMockAnalysisEngine();
window.analysisEngine = analysisEngine;

// ===== PRODUCT DATA =====
const PRODUCT = {
  id: 1,
  name: 'VELIRA Cloud Hoodie',
  price: 44.99,
  colors: [
    { name: 'Midnight Black', hex: '#1a1a1a' },
    { name: 'Sand Beige',     hex: '#c8b49a' },
    { name: 'Ash Grey',       hex: '#8a8a8a' },
    { name: 'Vintage White',  hex: '#f5f0e8' },
    { name: 'Forest Olive',   hex: '#5a6642' },
    { name: 'Deep Bordeaux',  hex: '#6b2737' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};

const REVIEWS = [
  { name: 'Lucas M.', city: 'München', date: 'Feb 2026', stars: 5, text: 'Ich habe ihn jetzt 6 Wochen und mindestens 30x gewaschen. Noch genauso weich wie am ersten Tag. Bestes Geld das ich je ausgegeben habe.' },
  { name: 'Annika S.', city: 'Berlin', date: 'Jan 2026', stars: 5, text: 'Mein Freund hat ihn nach 2 Tagen geklaut. Musste mir sofort einen zweiten bestellen — in Beige diesmal. Absolut süchtig machend.' },
  { name: 'Jonas K.', city: 'Hamburg', date: 'Feb 2026', stars: 5, text: '380gsm ist kein Witz. Ich trage diesen Hoodie buchstäblich jeden Tag. Überraschend schnelle Lieferung auch.' },
  { name: 'Maria L.', city: 'Frankfurt', date: 'Jan 2026', stars: 5, text: 'Für €44,99 hätte ich nicht erwartet, dass die Qualität so gut ist. Besser als meine Hoodies von Zalando für €80.' },
  { name: 'Tim R.', city: 'Köln', date: 'Feb 2026', stars: 5, text: 'Oversized Fit ist perfekt. Nicht zu groß, nicht zu eng. Endlich ein Hoodie der versteht was ich will.' },
  { name: 'Sophie B.', city: 'Stuttgart', date: 'Mar 2026', stars: 5, text: 'Habe den Forest Olive und bin verliebt. Die Farbe ist noch schöner als auf dem Bild. Super Service auch.' },
];

const FAQS = [
  { q: 'Wie lange dauert die Lieferung nach Deutschland?', a: 'Wir liefern in 7–10 Werktagen nach Deutschland. Du erhältst einen Tracking-Link sobald dein Paket verschickt wurde.' },
  { q: 'Welche Größe soll ich wählen?', a: 'Der Cloud Hoodie hat einen Oversized Fit. Wenn du zwischen zwei Größen bist, empfehlen wir die kleinere Größe für einen normalen Fit oder die größere für den typischen Oversize-Look.' },
  { q: 'Kann ich den Hoodie in der Waschmaschine waschen?', a: 'Ja! Der Cloud Hoodie ist waschmaschinenfest bei 30°C. Wir empfehlen links waschen und nicht tumbler-trocknen, um die Qualität langfristig zu erhalten.' },
  { q: 'Was ist die Rückgabepolitik?', a: '30 Tage kostenlose Rückgabe. Wenn du nicht 100% zufrieden bist, schick ihn zurück und wir erstatten dir den vollen Betrag — kein Fragezeichen.' },
  { q: 'Welche Zahlungsmethoden akzeptiert ihr?', a: 'PayPal, Kreditkarte (Visa/Mastercard), Klarna (Ratenkauf & Rechnungskauf) und Apple Pay.' },
  { q: 'Kann ich mehrere Farben bestellen?', a: 'Ja, einfach für jede Farbe separat zum Warenkorb hinzufügen. Ab €69 ist der Versand kostenlos.' },
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('velira_cart') || '[]');
let selectedColor = PRODUCT.colors[0];
let selectedSize = 'M';

// ===== DOM =====
const cartBtn       = document.getElementById('cartBtn');
const cartCount     = document.getElementById('cartCount');
const cartDrawer    = document.getElementById('cartDrawer');
const cartClose     = document.getElementById('cartClose');
const overlay       = document.getElementById('overlay');
const cartItems     = document.getElementById('cartItems');
const cartEmpty     = document.getElementById('cartEmpty');
const cartFooter    = document.getElementById('cartFooter');
const cartTotal     = document.getElementById('cartTotal');
const checkoutBtn   = document.getElementById('checkoutBtn');
const modalOverlay  = document.getElementById('modalOverlay');
const modalClose    = document.getElementById('modalClose');
const addToCartBtn  = document.getElementById('addToCartBtn');
const buyNowBtn     = document.getElementById('buyNowBtn');
const colorName     = document.getElementById('colorName');
const sizeName      = document.getElementById('sizeName');
const imgBlock      = document.getElementById('imgBlock');
const reviewsGrid   = document.getElementById('reviewsGrid');
const faqList       = document.getElementById('faqList');
const freeShipping  = document.getElementById('freeShippingNote');

// ===== INIT =====
function init() {
  renderReviews();
  renderFAQ();
  syncColorThumbs();
  renderCart();
  updateCount();
}

// ===== COLOR SELECTION =====
document.getElementById('swatches').addEventListener('click', e => {
  const btn = e.target.closest('.swatch');
  if (!btn) return;
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  selectedColor = { name: btn.dataset.name, hex: btn.dataset.color };
  colorName.textContent = selectedColor.name;
  imgBlock.style.background = selectedColor.hex;
  syncColorThumbs();
});

function syncColorThumbs() {
  document.querySelectorAll('.thumb').forEach(t => {
    t.style.background = t.dataset.color;
    t.classList.toggle('active', t.dataset.color === selectedColor.hex);
    t.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => {
        if (s.dataset.color === t.dataset.color) s.click();
      });
    });
  });
}

// ===== SIZE SELECTION =====
document.getElementById('sizes').addEventListener('click', e => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  document.querySelectorAll('.size-btn').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = btn.dataset.size;
  sizeName.textContent = selectedSize;
});

// ===== CART LOGIC =====
function addToCart() {
  const key = `${PRODUCT.id}-${selectedColor.name}-${selectedSize}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: PRODUCT.id,
      name: PRODUCT.name,
      price: PRODUCT.price,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      qty: 1,
    });
  }
  saveCart();
  renderCart();
  updateCount();
}

function removeItem(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
  updateCount();
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeItem(key); return; }
  saveCart();
  renderCart();
  updateCount();
}

function saveCart() {
  localStorage.setItem('velira_cart', JSON.stringify(cart));
}

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function getTotalItems() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

// ===== RENDER CART =====
function renderCart() {
  const hasItems = cart.length > 0;
  cartEmpty.style.display = hasItems ? 'none' : 'block';
  cartFooter.style.display = hasItems ? 'flex' : 'none';

  const existing = cartItems.querySelectorAll('.cart-item');
  existing.forEach(el => el.remove());

  if (!hasItems) return;

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-swatch" style="background:${item.colorHex}"></div>
      <div class="cart-item-info">
        <p class="cart-item-name">Cloud Hoodie</p>
        <p class="cart-item-meta">${item.color} · ${item.size}</p>
        <p class="cart-item-price">${formatPrice(item.price * item.qty)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-key="${item.key}" data-delta="-1" aria-label="Weniger">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" data-key="${item.key}" data-delta="1" aria-label="Mehr">+</button>
        <button class="remove-btn" data-key="${item.key}" aria-label="Entfernen">🗑</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  const total = getTotal();
  cartTotal.textContent = formatPrice(total);

  if (total < 69) {
    freeShipping.textContent = `Noch ${formatPrice(69 - total)} bis zur kostenlosen Lieferung 🚀`;
  } else {
    freeShipping.textContent = '✅ Kostenlose Lieferung inklusive!';
  }
}

cartItems.addEventListener('click', e => {
  const key = e.target.dataset.key;
  if (!key) return;
  if (e.target.classList.contains('remove-btn')) removeItem(key);
  else if (e.target.classList.contains('qty-btn')) changeQty(key, Number(e.target.dataset.delta));
});

// ===== CART UI =====
function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function updateCount() {
  const n = getTotalItems();
  cartCount.textContent = n;
  cartCount.style.display = n > 0 ? 'inline-flex' : 'none';
}

// ===== CHECKOUT =====
function checkout() {
  if (cart.length === 0) return;
  cart = [];
  saveCart();
  renderCart();
  updateCount();
  closeCart();
  openModal();
}

function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== EVENTS =====
addToCartBtn.addEventListener('click', () => {
  addToCart();
  addToCartBtn.textContent = '✓ Hinzugefügt!';
  addToCartBtn.classList.add('added');
  setTimeout(() => {
    addToCartBtn.textContent = 'In den Warenkorb — €44,99';
    addToCartBtn.classList.remove('added');
  }, 1400);
  openCart();
});

buyNowBtn.addEventListener('click', () => {
  addToCart();
  checkout();
});

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', checkout);
modalClose.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('active')) { closeModal(); return; }
    if (cartDrawer.classList.contains('open')) closeCart();
  }
});

// ===== REVIEWS =====
function renderReviews() {
  REVIEWS.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-stars">${'★'.repeat(r.stars)}</div>
      <p class="review-text">"${r.text}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="review-author">${r.name}, ${r.city}</span>
        <span class="review-date">${r.date}</span>
      </div>
    `;
    reviewsGrid.appendChild(card);
  });
}

// ===== FAQ =====
function renderFAQ() {
  FAQS.forEach(f => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-q">
        <span>${f.q}</span>
        <span class="arrow">▼</span>
      </button>
      <div class="faq-a">${f.a}</div>
    `;
    item.querySelector('.faq-q').addEventListener('click', () => {
      item.classList.toggle('open');
    });
    faqList.appendChild(item);
  });
}

// ===== STOCK COUNTDOWN (cosmetic) =====
function initStockCountdown() {
  let stock = 47;
  const stockEls = document.querySelectorAll('#stockAnnounce, #stockLeft, #stockProof');
  setInterval(() => {
    if (Math.random() < 0.15 && stock > 30) {
      stock -= 1;
      stockEls.forEach(el => { if (el) el.textContent = stock; });
    }
  }, 8000);
}

// ===== FORMAT =====
function formatPrice(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// ===== RUN =====
init();
initStockCountdown();
