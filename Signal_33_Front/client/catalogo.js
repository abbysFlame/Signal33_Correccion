/* client/catalogo.js
   Lógica del catálogo de merch:
   - datos de productos
   - renderizado de tarjetas
   - filtros por categoría
   - selección de talla
   - modal de detalle
   - agregar al carrito (vía Cart en main.js)
*/

/* ── Datos de productos ─────────────────────────────────── */
const PRODUCTS = [
  {
    id: 'hoodie-001',
    name: 'Hoodie Oficial',
    cat: 'ropa',
    catLabel: 'Ropa',
    price: 750,
    desc: 'Hoodie de algodón pesado 320gsm. Bordado del logo en el pecho. Disponible en negro con detalles en tinto.',
    sizes: ['S','M','L','XL','XXL'],
    unavail: [],
    icon: '🧥',
    badge: 'NUEVO',
    badgeClass: '',
  },
  {
    id: 'tshirt-001',
    name: 'Playera Logo',
    cat: 'ropa',
    catLabel: 'Ropa',
    price: 380,
    desc: 'Playera 100% algodón con serigrafía del logo al frente. Corte unisex, lavado en frío.',
    sizes: ['XS','S','M','L','XL'],
    unavail: ['XS'],
    icon: '👕',
    badge: '',
    badgeClass: '',
  },
  {
    id: 'cap-001',
    name: 'Gorra Snapback',
    cat: 'accesorios',
    catLabel: 'Accesorios',
    price: 320,
    desc: 'Gorra negra con parche bordado. Ajuste snapback, talla única.',
    sizes: ['ÚNICA'],
    unavail: [],
    icon: '🧢',
    badge: '',
    badgeClass: '',
  },
  {
    id: 'tote-001',
    name: 'Tote Bag',
    cat: 'accesorios',
    catLabel: 'Accesorios',
    price: 220,
    desc: 'Bolsa de algodón natural 180gsm con serigrafía en negro. 42×38 cm, asas largas.',
    sizes: ['ÚNICA'],
    unavail: [],
    icon: '👜',
    badge: '',
    badgeClass: '',
  },
  {
    id: 'jacket-ed001',
    name: 'Jacket Ed. Limitada',
    cat: 'edicion',
    catLabel: 'Ed. Limitada',
    price: 1200,
    desc: 'Jacket de bomber con diseño exclusivo. Forro estampado, solo 50 piezas numeradas. Inluye certificado de autenticidad.',
    sizes: ['S','M','L','XL'],
    unavail: ['XL'],
    icon: '🧤',
    badge: 'LTD',
    badgeClass: '',
  },
  {
    id: 'vinyl-ed001',
    name: 'Vinilo Firmado',
    cat: 'edicion',
    catLabel: 'Ed. Limitada',
    price: 850,
    desc: 'Vinilo 12" de color tinto con el set grabado más reciente. Firmado a mano. Solo 30 copias disponibles.',
    sizes: ['ÚNICA'],
    unavail: [],
    icon: '💿',
    badge: 'AGOTÁNDOSE',
    badgeClass: '',
  },
  {
    id: 'tshirt-002',
    name: 'Playera Tour',
    cat: 'ropa',
    catLabel: 'Ropa',
    price: 420,
    desc: 'Edición de gira con las fechas al dorso. Serigrafía de alta definición, algodón 190gsm.',
    sizes: ['S','M','L','XL','XXL'],
    unavail: ['S'],
    icon: '👕',
    badge: '',
    badgeClass: '',
  },
  {
    id: 'sticker-pack',
    name: 'Pack de Stickers',
    cat: 'accesorios',
    catLabel: 'Accesorios',
    price: 80,
    desc: 'Pack de 6 stickers de vinilo resistente al agua. Tamaños variados. Acabado mate.',
    sizes: ['ÚNICA'],
    unavail: [],
    icon: '🏷️',
    badge: '',
    badgeClass: '',
  },
];

/* ── Estado local de la página ─────────────────────────── */
let currentFilter = 'all';
let currentProduct = null;
let selectedSize    = null;

/* ── Render de tarjeta ────────────────────────────────── */
function buildCard(p, index) {
  const num = String(index + 1).padStart(2, '0');

  const sizeBtns = p.sizes.map(s => {
    const ua = p.unavail.includes(s);
    return `<button class="size-btn${ua ? ' unavail' : ''}" data-size="${s}"
              ${ua ? 'disabled title="Sin stock"' : ''}>${s}</button>`;
  }).join('');

  return `
  <article class="prod-card" data-id="${p.id}" data-cat="${p.cat}">

    ${p.badge
      ? `<span class="prod-badge${p.badgeClass ? ' ' + p.badgeClass : ''}">${p.badge}</span>`
      : ''}

    <!-- área de imagen: fondo por categoría via data-cat, número decorativo, ícono, overlay -->
    <div class="prod-img" data-cat="${p.cat}">
      <span class="prod-num">${num}</span>
      <span class="prod-icon">${p.icon}</span>
      <div class="prod-hover">
        <button class="quick-view-btn" data-id="${p.id}">Ver detalle</button>
      </div>
    </div>

    <!-- cuerpo -->
    <div class="prod-body">
      <div class="prod-top">
        <span class="prod-cat">${p.catLabel}</span>
      </div>
      <h3 class="prod-name">${p.name}</h3>
      <p class="prod-desc">${p.desc.slice(0, 80)}${p.desc.length > 80 ? '…' : ''}</p>

      <div class="sizes">${sizeBtns}</div>

      <div class="prod-foot">
        <div class="prod-price-row">
          <span class="prod-price">
            $${p.price.toLocaleString('es-MX')}
            <small>MXN</small>
          </span>
        </div>
        <button class="add-btn" data-id="${p.id}">+ Agregar al carrito</button>
      </div>
    </div>

  </article>`;
}

/* ── Render del grid ──────────────────────────────────── */
function renderGrid(filter = 'all') {
  const grid = document.getElementById('merch-grid');
  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = list.map((p, i) => buildCard(p, i)).join('');
  attachCardListeners();
}

/* ── Listeners de tarjeta ─────────────────────────────── */
function attachCardListeners() {
  /* tallas en tarjeta */
  document.querySelectorAll('.prod-card .size-btn:not(.unavail)').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = btn.closest('.prod-card');
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      e.stopPropagation();
    });
  });

  /* quick view */
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    });
  });

  /* agregar al carrito */
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('.prod-card');
      const id   = btn.dataset.id;
      const p    = PRODUCTS.find(x => x.id === id);

      // necesita talla seleccionada si hay más de una opción real
      const activeSize = card.querySelector('.size-btn.active');

      if (!activeSize && p.sizes.length > 1 && !(p.sizes.length === 1 && p.sizes[0] === 'ÚNICA')) {
        // resaltar tallas para avisar
        card.querySelectorAll('.size-btn').forEach(b => {
          b.style.borderColor = 'var(--tinto-lt)';
          setTimeout(() => b.style.borderColor = '', 1200);
        });
        showToast('Elige una talla primero');
        return;
      }

      const size = activeSize ? activeSize.dataset.size : p.sizes[0];
      Cart.add({ id: p.id, name: p.name, price: p.price, size, icon: p.icon });
      showToast(`${p.name} (${size}) agregado al carrito`);
    });
  });
}

/* ── Filtros ──────────────────────────────────────────── */
document.getElementById('filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentFilter = chip.dataset.cat;
  renderGrid(currentFilter);
});

/* ── Modal ────────────────────────────────────────────── */
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  selectedSize   = null;

  document.getElementById('modal-cat').textContent   = p.catLabel;
  document.getElementById('modal-name').textContent  = p.name;
  document.getElementById('modal-price').textContent = `$${p.price.toLocaleString('es-MX')}`;
  document.getElementById('modal-desc').textContent  = p.desc;
  document.getElementById('modal-img').textContent   = p.icon;

  const sizesEl = document.getElementById('modal-sizes');
  sizesEl.innerHTML = p.sizes.map(s => {
    const unavail = p.unavail.includes(s) ? ' unavail' : '';
    return `<button class="size-btn${unavail}" data-size="${s}" ${unavail ? 'disabled' : ''}>${s}</button>`;
  }).join('');

  sizesEl.querySelectorAll('.size-btn:not(.unavail)').forEach(btn => {
    btn.addEventListener('click', () => {
      sizesEl.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  // Si solo hay una talla, se selecciona sola
  if (p.sizes.length === 1) {
    selectedSize = p.sizes[0];
    sizesEl.querySelector('.size-btn')?.classList.add('active');
  }

  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
  selectedSize   = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-backdrop')) closeModal();
});

document.getElementById('modal-add-btn').addEventListener('click', () => {
  if (!currentProduct) return;

  const needsSize = currentProduct.sizes.length > 1 && currentProduct.sizes[0] !== 'ÚNICA';
  if (needsSize && !selectedSize) {
    document.getElementById('modal-sizes').querySelectorAll('.size-btn').forEach(b => {
      b.style.borderColor = 'var(--tinto-lt)';
      setTimeout(() => b.style.borderColor = '', 1200);
    });
    showToast('Elige una talla primero');
    return;
  }

  const size = selectedSize || currentProduct.sizes[0];
  Cart.add({
    id:    currentProduct.id,
    name:  currentProduct.name,
    price: currentProduct.price,
    size,
    icon:  currentProduct.icon,
  });
  showToast(`${currentProduct.name} (${size}) agregado`);
  closeModal();
});

/* tecla Escape cierra modal */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Init ─────────────────────────────────────────────── */
renderGrid();