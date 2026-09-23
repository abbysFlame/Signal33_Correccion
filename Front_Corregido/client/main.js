/* client/main.js — lógica compartida entre páginas */

/* ── Header scroll ── */
(function () {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Carrito (localStorage) ── */
const Cart = (() => {
  const KEY = 'dj_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function add(item) {
    const items = load();
    // si ya existe mismo id + talla, aumenta cantidad
    const existing = items.find(i => i.id === item.id && i.size === item.size);
    if (existing) { existing.qty += 1; }
    else { items.push({ ...item, qty: 1 }); }
    save(items);
    renderCartPanel();
    updateCartCount();
  }

  function remove(id, size) {
    const items = load().filter(i => !(i.id === id && i.size === size));
    save(items);
    renderCartPanel();
    updateCartCount();
  }

  function total() {
    return load().reduce((acc, i) => acc + i.price * i.qty, 0);
  }

  function count() {
    return load().reduce((acc, i) => acc + i.qty, 0);
  }

  return { load, add, remove, total, count };
})();

/* ── Actualizar contador del header ── */
function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const n = Cart.count();
  el.textContent = n;
  el.classList.toggle('visible', n > 0);
}

/* ── Renderizar items del panel de carrito ── */
function renderCartPanel() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-val');
  if (!container) return;

  const items = Cart.load();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span style="font-size:2rem">🛒</span>
        <p>Tu carrito está vacío.</p>
      </div>`;
  } else {
    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.icon || '👕'}</div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Talla ${item.size} · Cant. ${item.qty}</div>
          <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size}">
            Eliminar
          </button>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-MX')}</div>
      </div>
    `).join('');

    // botones de eliminar
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.remove(btn.dataset.id, btn.dataset.size);
      });
    });
  }

  if (totalEl) totalEl.textContent = `$${Cart.total().toLocaleString('es-MX')}`;
}

/* ── Panel de carrito: abrir/cerrar ── */
function openCart() {
  renderCartPanel();
  document.getElementById('cart-panel')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cart-panel')?.classList.remove('open');
}

document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('cart-close')?.addEventListener('click', closeCart);

/* cerrar al hacer click fuera del panel */
document.addEventListener('click', e => {
  const panel = document.getElementById('cart-panel');
  if (panel?.classList.contains('open')
      && !panel.contains(e.target)
      && !document.getElementById('cart-btn')?.contains(e.target)) {
    closeCart();
  }
});

/* ── Toast ── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ── init ── */
updateCartCount();

/* ── Menú móvil ── */
(function () {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-nav');
  if (!toggle || !menu) return;

  function closeMenu() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  }

  function openMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
})();

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");

    mobileMenuBtn.setAttribute("aria-expanded", isOpen);
    mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.textContent = "☰";
    });
  });
}