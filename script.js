/* ============================================================
   THE SAMPLE ONE — Ranchi | Main JS
   ============================================================ */

'use strict';

// ── GLOBALS ────────────────────────────────────────────────
const APP = {
  user: JSON.parse(localStorage.getItem('tso_user') || 'null'),
  cart: JSON.parse(localStorage.getItem('tso_cart') || '[]'),
  orders: JSON.parse(localStorage.getItem('tso_orders') || '[]'),
};

// ── HELPERS ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const uid = () => 'TSO' + Date.now().toString(36).toUpperCase();
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function toast(msg, type = 'info') {
  let cont = document.querySelector('.toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const icons = { success: '✅', error: '❌', info: '🔔' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span>
                  <span class="toast-msg">${msg}</span>`;
  cont.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(30px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ── NAVBAR ─────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
  }

  // Active link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  // User display
  if (APP.user) {
    $$('.nav-user-name').forEach(el => el.textContent = APP.user.name);
    $$('.nav-user').forEach(el => el.style.display = 'flex');
    $$('.nav-user-hidden').forEach(el => el.style.display = 'none');
  }
}

// ── BACK TO TOP ────────────────────────────────────────────
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
}

// ── CART SYSTEM ────────────────────────────────────────────
function saveCart() { save('tso_cart', APP.cart); }

function getCartTotal() {
  return APP.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart() {
  const listEl = $('cart-list');
  const totalEl = $('cart-total');
  const countEls = $$('.cart-count');
  if (!listEl) return;

  const count = APP.cart.reduce((s, i) => s + i.qty, 0);
  countEls.forEach(el => { el.textContent = count; el.style.display = count ? 'flex' : 'none'; });

  if (APP.cart.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:var(--muted);">
      <div style="font-size:3rem;margin-bottom:1rem;">🛒</div>
      <p>Your cart is empty</p>
    </div>`;
  } else {
    listEl.innerHTML = APP.cart.map((item, idx) => `
      <div class="cart-item">
        <span class="cart-item-icon">${item.icon}</span>
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <span>${fmt(item.price * item.qty)}</span>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
    `).join('');
  }
  if (totalEl) totalEl.textContent = fmt(getCartTotal());
}

function changeQty(idx, delta) {
  APP.cart[idx].qty += delta;
  if (APP.cart[idx].qty <= 0) APP.cart.splice(idx, 1);
  saveCart(); renderCart();
}

window.changeQty = changeQty;

function addToCart(item) {
  const ex = APP.cart.find(c => c.id === item.id);
  if (ex) ex.qty++;
  else APP.cart.push({ ...item, qty: 1 });
  saveCart(); renderCart();
  toast(`${item.name} added to cart!`, 'success');
}

window.addToCart = addToCart;

function openCart()  { $('cart-sidebar')?.classList.add('open'); $('cart-overlay')?.classList.add('open'); }
function closeCart() { $('cart-sidebar')?.classList.remove('open'); $('cart-overlay')?.classList.remove('open'); }

window.openCart  = openCart;
window.closeCart = closeCart;

function initCart() {
  const cartBtn = $('cart-btn');
  const closeBtn = $('cart-close-btn');
  const overlay = $('cart-overlay');
  if (cartBtn)   cartBtn.addEventListener('click', openCart);
  if (closeBtn)  closeBtn.addEventListener('click', closeCart);
  if (overlay)   overlay.addEventListener('click', closeCart);
  renderCart();
}

// ── CHECKOUT ───────────────────────────────────────────────
function checkout() {
  if (!APP.user) { toast('Please login first!', 'error'); setTimeout(() => location.href = 'login.html', 1000); return; }
  if (!APP.cart.length) { toast('Cart is empty!', 'error'); return; }
  const order = {
    id: uid(),
    items: [...APP.cart],
    total: getCartTotal(),
    date: new Date().toISOString(),
    status: 'placed',
    customer: APP.user,
    address: APP.user.address || 'Ranchi, Jharkhand',
  };
  APP.orders.push(order);
  APP.cart = [];
  save('tso_orders', APP.orders);
  saveCart();
  toast('Order placed! Redirecting to tracking…', 'success');
  setTimeout(() => { location.href = `tracking.html?id=${order.id}`; }, 1500);
}
window.checkout = checkout;

// ── MENU FILTERS ───────────────────────────────────────────
function initMenuFilters() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.menu-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? 'block' : 'none';
        if (show) card.style.animation = 'fadeUp 0.4s ease';
      });
    });
  });
}

// ── LAZY LOADING ───────────────────────────────────────────
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    $$('[data-lazy]').forEach(el => obs.observe(el));
  }
}

// ── SMOOTH SCROLL ──────────────────────────────────────────
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

// ── LOGIN SYSTEM ───────────────────────────────────────────
function initLogin() {
  const form = $('login-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim();
    const pass  = $('password').value;
    // Demo credentials
    if (email && pass.length >= 4) {
      const user = {
        name: email.split('@')[0].replace(/\b\w/g, c => c.toUpperCase()),
        email,
        address: 'Main Road, Ranchi, Jharkhand — 834001',
      };
      APP.user = user;
      save('tso_user', user);
      toast('Welcome back! 🎉', 'success');
      setTimeout(() => location.href = 'index.html', 1000);
    } else {
      toast('Invalid credentials. Try any email + 4+ chars password', 'error');
    }
  });
}

// ── ADMIN LOGIN ────────────────────────────────────────────
function initAdminLogin() {
  const form = $('admin-login-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('admin-email')?.value;
    const pass  = $('admin-pass')?.value;
    if (email === 'admin@thesampleone.com' && pass === 'admin123') {
      save('tso_admin', true);
      location.reload();
    } else {
      toast('Wrong credentials. Use admin@thesampleone.com / admin123', 'error');
    }
  });
}

// ── LOGOUT ─────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('tso_user');
  localStorage.removeItem('tso_admin');
  APP.user = null;
  toast('Logged out', 'info');
  setTimeout(() => location.href = 'index.html', 800);
}
window.logout = logout;

// ── CONTACT FORM ───────────────────────────────────────────
function initContact() {
  const form = $('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    toast('Message sent! We\'ll get back to you within 24 hrs.', 'success');
    form.reset();
  });
}

// ── REVIEW FORM ────────────────────────────────────────────
function initReviewForm() {
  const form = $('review-form');
  if (!form) return;
  let rating = 5;
  $$('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rating = parseInt(btn.dataset.val);
      $$('.star-btn').forEach((s, i) => s.textContent = i < rating ? '★' : '☆');
    });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    toast('Review submitted! Thank you ⭐', 'success');
    form.reset();
    $$('.star-btn').forEach((s, i) => s.textContent = i < 5 ? '★' : '☆');
  });
}

// ── TRACKING PAGE ──────────────────────────────────────────
const STATUSES = [
  { key: 'placed',    label: 'Order Placed',    icon: '📋', desc: 'Your order has been received', time: 0 },
  { key: 'preparing', label: 'Preparing',        icon: '👨‍🍳', desc: 'Chef is cooking your food',   time: 2 },
  { key: 'picked',    label: 'Picked Up',        icon: '✅', desc: 'Order packed & ready',        time: 5 },
  { key: 'delivery',  label: 'Out for Delivery', icon: '🚴', desc: 'On the way to you!',          time: 8 },
  { key: 'near',      label: 'Near You',          icon: '📍', desc: 'Almost there!',              time: 12 },
  { key: 'delivered', label: 'Delivered',         icon: '🎉', desc: 'Enjoy your meal!',           time: 15 },
];

let trackingInterval = null;
let etaInterval = null;
let currentStatusIdx = 0;
let etaSeconds = 15 * 60;
let deliveryMap = null;
let agentMarker = null;
let restaurantMarker = null;
let routeLine = null;

// Ranchi restaurant coords
const RESTAURANT = { lat: 23.3441, lng: 85.3096 };
const CUSTOMER   = { lat: 23.3600, lng: 85.3236 };

// Path waypoints restaurant → customer
const ROUTE = [
  { lat: 23.3441, lng: 85.3096 },
  { lat: 23.3460, lng: 85.3120 },
  { lat: 23.3490, lng: 85.3145 },
  { lat: 23.3520, lng: 85.3168 },
  { lat: 23.3548, lng: 85.3190 },
  { lat: 23.3570, lng: 85.3210 },
  { lat: 23.3590, lng: 85.3225 },
  { lat: 23.3600, lng: 85.3236 },
];

let agentRouteIdx = 0;
let agentSubIdx   = 0; // sub-step interpolation

function initTracking() {
  const mapEl = $('delivery-map');
  if (!mapEl) return;

  // Get order
  const params = new URLSearchParams(location.search);
  const orderId = params.get('id');
  const order = APP.orders.find(o => o.id === orderId) || {
    id: 'DEMO-ORDER',
    items: [{ name: 'Butter Chicken', price: 349, qty: 2, icon: '🍛' }, { name: 'Naan', price: 49, qty: 4, icon: '🫓' }],
    total: 894,
    date: new Date().toISOString(),
    status: 'placed',
    customer: { name: 'Demo User', address: 'Lalpur, Ranchi' },
  };

  // Set order info
  const orderIdEl = $('tracking-order-id');
  const customerEl = $('tracking-customer');
  const orderItemsEl = $('tracking-items');
  if (orderIdEl) orderIdEl.textContent = order.id;
  if (customerEl) customerEl.textContent = order.customer?.name || 'Guest';
  if (orderItemsEl) orderItemsEl.innerHTML = order.items.map(i => `
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <span>${i.icon} ${i.name} ×${i.qty}</span>
      <span style="color:var(--gold)">${fmt(i.price * i.qty)}</span>
    </div>
  `).join('') + `<div style="display:flex;justify-content:space-between;padding:.75rem 0;font-weight:700;color:var(--gold)"><span>Total</span><span>${fmt(order.total)}</span></div>`;

  // Hide loader after 1.5s
  setTimeout(() => {
    $('map-loader')?.classList.add('hidden');
    initLeafletMap();
    startTracking(order);
  }, 1800);

  // ETA countdown
  etaInterval = setInterval(() => {
    if (etaSeconds <= 0) { clearInterval(etaInterval); return; }
    etaSeconds--;
    updateETA();
  }, 1000);

  updateStatusUI(0);
  updateETA();
}

function updateETA() {
  const mins = Math.floor(etaSeconds / 60);
  const secs = etaSeconds % 60;
  const el = $('eta-time');
  if (el) el.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const distEl = $('dist-remaining');
  if (distEl) {
    const pct = 1 - (etaSeconds / (15 * 60));
    const dist = Math.max(0, (2.4 * (1 - pct))).toFixed(1);
    distEl.textContent = dist + ' km';
  }
}

function initLeafletMap() {
  if (typeof L === 'undefined') return;

  deliveryMap = L.map('delivery-map', {
    center: [23.352, 85.316],
    zoom: 14,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(deliveryMap);

  // Restaurant marker
  const restIcon = L.divIcon({
    html: `<div style="background:#f4b400;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:0 0 15px rgba(244,180,0,.6);border:2px solid #fff">🍽️</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], className: ''
  });
  restaurantMarker = L.marker([RESTAURANT.lat, RESTAURANT.lng], { icon: restIcon })
    .addTo(deliveryMap)
    .bindPopup('<b>THE SAMPLE ONE</b><br>Main Road, Ranchi');

  // Customer marker
  const custIcon = L.divIcon({
    html: `<div style="background:#4ade80;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 0 12px rgba(74,222,128,.6);border:2px solid #fff">🏠</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16], className: ''
  });
  L.marker([CUSTOMER.lat, CUSTOMER.lng], { icon: custIcon })
    .addTo(deliveryMap)
    .bindPopup('<b>Your Location</b>');

  // Agent marker (start at restaurant)
  const agentIcon = L.divIcon({
    html: `<div style="background:#60a5fa;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 0 15px rgba(96,165,250,.6);border:2px solid #fff;animation:none" id="agent-marker-el">🚴</div>`,
    iconSize: [34, 34], iconAnchor: [17, 17], className: ''
  });
  agentMarker = L.marker([RESTAURANT.lat, RESTAURANT.lng], { icon: agentIcon })
    .addTo(deliveryMap)
    .bindPopup('<b>Delivery Agent</b><br>Rajesh Kumar');

  // Route line
  const latlngs = ROUTE.map(p => [p.lat, p.lng]);
  routeLine = L.polyline(latlngs, {
    color: '#f4b400', weight: 3, opacity: 0.7,
    dashArray: '8 6'
  }).addTo(deliveryMap);

  deliveryMap.fitBounds([[RESTAURANT.lat, RESTAURANT.lng], [CUSTOMER.lat, CUSTOMER.lng]], { padding: [40, 40] });
}

function startTracking(order) {
  let statusAdvanceTime = [0, 25, 60, 100, 150, 200]; // seconds at which status advances
  let elapsed = 0;

  trackingInterval = setInterval(() => {
    elapsed++;

    // Advance status
    for (let i = 0; i < statusAdvanceTime.length; i++) {
      if (elapsed === statusAdvanceTime[i] && currentStatusIdx === i) {
        currentStatusIdx = i;
        updateStatusUI(i);
        if (i === STATUSES.length - 1) clearInterval(trackingInterval);
      }
    }
    if (elapsed > statusAdvanceTime[currentStatusIdx + 1] && currentStatusIdx < STATUSES.length - 1) {
      currentStatusIdx++;
      updateStatusUI(currentStatusIdx);
    }

    // Move agent along route
    moveAgent();

  }, 1000);
}

function moveAgent() {
  if (!agentMarker || agentRouteIdx >= ROUTE.length - 1) return;
  if (currentStatusIdx < 3) return; // only move when "out for delivery"

  agentSubIdx++;
  const stepsPerSegment = 12;
  if (agentSubIdx >= stepsPerSegment) {
    agentSubIdx = 0;
    agentRouteIdx = Math.min(agentRouteIdx + 1, ROUTE.length - 2);
  }

  const from = ROUTE[agentRouteIdx];
  const to   = ROUTE[agentRouteIdx + 1];
  const t    = agentSubIdx / stepsPerSegment;
  const lat  = from.lat + (to.lat - from.lat) * t;
  const lng  = from.lng + (to.lng - from.lng) * t;

  agentMarker.setLatLng([lat, lng]);

  // Pan map smoothly
  if (deliveryMap) {
    deliveryMap.panTo([lat, lng], { animate: true, duration: 0.8 });
  }
}

function updateStatusUI(idx) {
  const steps = $$('.status-step');
  steps.forEach((step, i) => {
    step.classList.remove('done', 'active');
    if (i < idx) step.classList.add('done');
    else if (i === idx) step.classList.add('active');
  });
  // Update label
  const labelEl = $('current-status-label');
  if (labelEl) labelEl.textContent = STATUSES[idx]?.label || '';
}

// ── ORDERS PAGE ────────────────────────────────────────────
function initOrders() {
  const tbody = $('orders-tbody');
  if (!tbody) return;

  const orders = [...APP.orders].reverse();
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:var(--muted)">No orders yet. <a href="menu.html" style="color:var(--gold)">Order now!</a></td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const statusMap = {
      placed: 'status-placed', preparing: 'status-preparing',
      picked: 'status-picked', delivery: 'status-delivery',
      near: 'status-near', delivered: 'status-delivered',
    };
    const label = STATUSES.find(s => s.key === o.status)?.label || o.status;
    return `
    <tr>
      <td><span style="font-family:var(--font-display);color:var(--gold)">${o.id}</span></td>
      <td>${new Date(o.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
      <td>${o.items?.length || 0} item${(o.items?.length || 0) !== 1 ? 's' : ''}</td>
      <td><strong style="color:var(--text)">${fmt(o.total)}</strong></td>
      <td><span class="status-badge ${statusMap[o.status] || 'status-placed'}">⬤ ${label}</span></td>
      <td>
        <a href="tracking.html?id=${o.id}" class="btn btn-sm btn-outline">Track</a>
        <a href="invoice.html?id=${o.id}" class="btn btn-sm btn-dark" style="margin-left:.5rem">Invoice</a>
      </td>
    </tr>`;
  }).join('');
}

// ── INVOICE PAGE ───────────────────────────────────────────
function initInvoice() {
  const wrap = $('invoice-content');
  if (!wrap) return;
  const params = new URLSearchParams(location.search);
  const orderId = params.get('id');
  const order = APP.orders.find(o => o.id === orderId) || {
    id: 'DEMO-INVOICE',
    items: [
      { name: 'Butter Chicken', price: 349, qty: 2, icon: '🍛' },
      { name: 'Naan', price: 49, qty: 4, icon: '🫓' },
      { name: 'Lassi', price: 89, qty: 2, icon: '🥛' },
    ],
    total: 1022,
    date: new Date().toISOString(),
    customer: { name: 'Demo User', email: 'demo@example.com', address: 'Main Road, Ranchi, Jharkhand' },
  };
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const gst      = Math.round(subtotal * 0.05);
  const delivery = 40;
  const grand    = subtotal + gst + delivery;

  wrap.innerHTML = `
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <div class="invoice-logo">
        <div style="font-family:var(--font-display);font-size:1.8rem;color:var(--gold);font-weight:900">THE SAMPLE ONE</div>
        <p>Premium Dining Experience • Ranchi, Jharkhand</p>
        <p style="font-size:.8rem;color:var(--muted)">📍 Main Road, Ranchi — 834001 | ☎ +91 98765 43210</p>
      </div>
      <div class="invoice-meta">
        <h2 style="color:var(--gold)">INVOICE</h2>
        <p style="color:var(--muted)">#${order.id}</p>
        <p style="color:var(--muted);margin-top:.5rem">${new Date(order.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
        <p style="color:var(--muted);font-size:.8rem">GSTIN: 20AABCS1429B1ZM</p>
      </div>
    </div>
    <div class="invoice-body">
      <div class="invoice-parties">
        <div class="invoice-party">
          <h5>Billed To</h5>
          <p>${order.customer?.name || 'Customer'}<br>${order.customer?.email || ''}<br>${order.customer?.address || 'Ranchi, Jharkhand'}</p>
        </div>
        <div class="invoice-party">
          <h5>Payment Details</h5>
          <p>Status: <span style="color:#4ade80">✓ Paid</span><br>
          Method: Online Payment<br>
          Date: ${new Date(order.date).toLocaleDateString('en-IN')}</p>
        </div>
      </div>
      <table class="invoice-items">
        <thead>
          <tr>
            <th>Item</th><th>Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(i => `
          <tr>
            <td>${i.icon} ${i.name}</td>
            <td>${i.qty}</td>
            <td style="text-align:right">${fmt(i.price)}</td>
            <td style="text-align:right;color:var(--text)">${fmt(i.price * i.qty)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="invoice-totals">
        <div class="total-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        <div class="total-row"><span>GST (5%)</span><span>${fmt(gst)}</span></div>
        <div class="total-row"><span>Delivery Charge</span><span>${fmt(delivery)}</span></div>
        <div class="total-row"><span>Grand Total</span><span>${fmt(grand)}</span></div>
      </div>
    </div>
    <div class="invoice-footer">
      <p>Thank you for dining with THE SAMPLE ONE! 🙏<br>
      <span style="font-size:.75rem;color:var(--muted)">For support: support@thesampleone.com</span></p>
      <div style="text-align:right">
        <p style="font-size:.8rem;color:var(--muted)">Authorised Signatory</p>
        <p style="font-family:var(--font-display);font-size:1.2rem;color:var(--gold);margin-top:.25rem;font-style:italic">The Sample One</p>
      </div>
    </div>
  </div>
  <div class="invoice-actions">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print Invoice</button>
    <button class="btn btn-outline" onclick="history.back()">← Back</button>
  </div>`;
}

// ── ADMIN PANEL ────────────────────────────────────────────
function initAdmin() {
  const loginForm = $('admin-login-section');
  const dashboard = $('admin-dashboard');
  const isAdmin = localStorage.getItem('tso_admin');

  if (!isAdmin) {
    if (loginForm) loginForm.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    initAdminLogin();
    return;
  }
  if (loginForm) loginForm.style.display = 'none';
  if (dashboard) dashboard.style.display = 'grid';

  // Render orders in admin
  const tbody = $('admin-orders-tbody');
  if (tbody) {
    const allOrders = [...APP.orders].reverse();
    if (!allOrders.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">No orders yet</td></tr>`;
    } else {
      tbody.innerHTML = allOrders.map(o => `
        <tr>
          <td style="color:var(--gold)">${o.id}</td>
          <td>${o.customer?.name || 'Guest'}</td>
          <td>${o.items?.map(i => i.name).join(', ')}</td>
          <td><strong style="color:var(--text)">${fmt(o.total)}</strong></td>
          <td>
            <select onchange="updateOrderStatus('${o.id}', this.value)" style="background:var(--dark3);color:var(--text);border:1px solid rgba(255,255,255,.1);padding:6px;border-radius:6px">
              ${STATUSES.map(s => `<option value="${s.key}" ${o.status===s.key?'selected':''}>${s.label}</option>`).join('')}
            </select>
          </td>
          <td><a href="tracking.html?id=${o.id}" class="btn btn-sm btn-outline">Track</a></td>
          <td><a href="invoice.html?id=${o.id}" class="btn btn-sm btn-dark">Invoice</a></td>
        </tr>
      `).join('');
    }
  }

  // Mini chart
  renderMiniChart();
}

function updateOrderStatus(orderId, status) {
  const ord = APP.orders.find(o => o.id === orderId);
  if (ord) { ord.status = status; save('tso_orders', APP.orders); toast('Status updated!', 'success'); }
}
window.updateOrderStatus = updateOrderStatus;

function renderMiniChart() {
  const chart = $('mini-chart');
  if (!chart) return;
  const vals = [40, 65, 50, 80, 60, 90, 75];
  const max  = Math.max(...vals);
  chart.innerHTML = vals.map((v, i) => `
    <div class="mini-bar ${i === 6 ? 'active' : ''}"
         style="height:${(v/max)*100}%"
         title="Day ${i+1}: ${v} orders">
    </div>`).join('');
}

// ── ADMIN NAV ──────────────────────────────────────────────
function initAdminNav() {
  $$('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      $$('.admin-section').forEach(s => s.style.display = s.id === section ? 'block' : 'none');
    });
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBackToTop();
  initCart();
  initMenuFilters();
  initLazyLoad();
  initSmoothScroll();
  initLogin();
  initContact();
  initReviewForm();
  initOrders();
  initInvoice();
  initAdmin();
  initAdminNav();
  initTracking();
});
