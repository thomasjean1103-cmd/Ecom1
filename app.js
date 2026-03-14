// ===== DATA =====
const PRODUCTS = [
  { id: 1,  emoji: '🎧', name: 'Casque Audio Pro',          desc: 'Son immersif 360°, réduction de bruit active.',        price: 89.99 },
  { id: 2,  emoji: '⌚', name: 'Montre Connectée',           desc: 'Suivi santé, GPS intégré, autonomie 7 jours.',         price: 129.99 },
  { id: 3,  emoji: '💡', name: 'Lampe LED Intelligente',     desc: 'Contrôle vocal, 16M couleurs, économie d\'énergie.',    price: 34.99 },
  { id: 4,  emoji: '🎒', name: 'Sac à Dos Urbain',          desc: 'Anti-vol, port USB, imperméable 20L.',                 price: 59.99 },
  { id: 5,  emoji: '🖱️', name: 'Souris Ergonomique',        desc: 'Sans-fil, 3 mois autonomie, 6 boutons programmables.', price: 44.99 },
  { id: 6,  emoji: '📱', name: 'Support Téléphone',          desc: 'Rechargement sans fil Qi, rotation 360°.',             price: 24.99 },
  { id: 7,  emoji: '🌿', name: 'Diffuseur Aromathérapie',   desc: 'Ultra-silencieux, 400ml, LED ambiance.',               price: 39.99 },
  { id: 8,  emoji: '🏋️', name: 'Bande de Résistance Set',  desc: '5 niveaux, latex naturel, sac inclus.',                price: 19.99 },
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ===== DOM REFERENCES =====
const productGrid   = document.getElementById('product-grid');
const cartPanel     = document.getElementById('cart-panel');
const cartOverlay   = document.getElementById('cart-overlay');
const cartItemsList = document.getElementById('cart-items');
const cartEmptyEl   = document.getElementById('cart-empty');
const cartFooter    = document.getElementById('cart-footer');
const cartCountEl   = document.getElementById('cart-count');
const cartTotalEl   = document.getElementById('cart-total');
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn  = document.getElementById('close-cart');
const checkoutBtn   = document.getElementById('checkout-btn');
const modal         = document.getElementById('modal');
const modalClose    = document.getElementById('modal-close');

// ===== RENDER PRODUCTS =====
function renderProducts() {
  productGrid.innerHTML = '';
  PRODUCTS.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img" aria-hidden="true">${product.emoji}</div>
      <div class="product-body">
        <p class="product-name">${product.name}</p>
        <p class="product-desc">${product.desc}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="btn-add" data-id="${product.id}" aria-label="Ajouter ${product.name} au panier">
          Ajouter au panier
        </button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// ===== CART LOGIC =====
function getCartItem(id) {
  return cart.find(item => item.id === id);
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = getCartItem(productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  updateCartCount();
  flashAddButton(productId);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  updateCartCount();
}

function changeQty(productId, delta) {
  const item = getCartItem(productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getTotalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===== RENDER CART =====
function renderCart() {
  cartItemsList.innerHTML = '';

  const hasItems = cart.length > 0;
  cartEmptyEl.classList.toggle('hidden', hasItems);
  cartFooter.classList.toggle('hidden', !hasItems);

  if (!hasItems) return;

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.id = item.id;
    li.innerHTML = `
      <span class="cart-item-emoji" aria-hidden="true">${item.emoji}</span>
      <div class="cart-item-info">
        <p class="cart-item-name" title="${item.name}">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)} / unité</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuer la quantité">−</button>
        <span class="qty-value" aria-live="polite">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Augmenter la quantité">+</button>
        <button class="remove-btn" data-id="${item.id}" aria-label="Supprimer ${item.name}">🗑️</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  cartTotalEl.textContent = formatPrice(getTotal());
}

function updateCartCount() {
  const count = getTotalItems();
  cartCountEl.textContent = count;
  cartCountEl.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ===== UI HELPERS =====
function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function flashAddButton(productId) {
  const btn = productGrid.querySelector(`[data-id="${productId}"]`);
  if (!btn) return;
  btn.textContent = '✓ Ajouté !';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = 'Ajouter au panier';
    btn.classList.remove('added');
  }, 1200);
}

function openCart() {
  cartPanel.classList.remove('hidden');
  cartOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.add('hidden');
  cartOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

// ===== CHECKOUT =====
function checkout() {
  if (cart.length === 0) return;
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  closeCart();
  openModal();
}

// ===== EVENT DELEGATION =====
productGrid.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add');
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
  openCart();
});

cartItemsList.addEventListener('click', e => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains('remove-btn')) {
    removeFromCart(id);
  } else if (e.target.classList.contains('qty-btn')) {
    const action = e.target.dataset.action;
    changeQty(id, action === 'inc' ? 1 : -1);
  }
});

cartToggleBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', checkout);
modalClose.addEventListener('click', () => { closeModal(); });

// Close cart on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modal.classList.contains('hidden')) { closeModal(); return; }
    if (!cartPanel.classList.contains('hidden')) { closeCart(); }
  }
});

// ===== INIT =====
renderProducts();
renderCart();
updateCartCount();
