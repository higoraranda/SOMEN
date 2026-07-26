/* ============================================================
   SÔMEN — Loja: carrinho (localStorage), chrome compartilhado,
   toasts e helpers. Requer products.js carregado antes.
   ============================================================ */

const CART_KEY = 'somen_cart_v1';

/* ---------- Formatação ---------- */
const BRL = (v) =>
  'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ---------- Marca / SVGs ---------- */
// Bigode (o "til" do Õ) — assinatura simbólica da SÔMEN
const MOUSTACHE =
  'M60 15 C55 24 47 27 38 26 C27 25 19 20 13 12.5 C9 7.5 3 8.5 4 15.5 C6 27 19 35 34 33 C46 31 55 25 60 18.5 C65 25 74 31 86 33 C101 35 114 27 116 15.5 C117 8.5 111 7.5 107 12.5 C101 20 93 25 82 26 C73 27 65 24 60 15 Z';

function wordmark(size) {
  const cls = size ? ` wm-${size}` : '';
  return (
    `<span class="wordmark${cls}" aria-label="SÔMEN">S` +
    `<span class="wm-o">O<svg viewBox="0 0 120 40" class="wm-mo" aria-hidden="true"><path d="${MOUSTACHE}"/></svg></span>` +
    `MEN</span>`
  );
}

/* ---------- Estado do carrinho ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}
function cartItemsDetailed() {
  return getCart()
    .map((i) => {
      const p = SOMEN.find(i.id);
      return p ? { ...p, qty: i.qty, lineTotal: p.price * i.qty } : null;
    })
    .filter(Boolean);
}
function cartSubtotal() {
  return cartItemsDetailed().reduce((s, i) => s + i.lineTotal, 0);
}
function addToCart(id, qty = 1) {
  const cart = getCart();
  const found = cart.find((i) => i.id === id);
  if (found) found.qty += qty;
  else cart.push({ id, qty });
  saveCart(cart);
  const p = SOMEN.find(id);
  toast(`${p ? p.name : 'Produto'} no carrinho`, 'Continue no prumo — finalize quando quiser.');
}
function setQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter((i) => i.id !== id);
  else {
    const f = cart.find((i) => i.id === id);
    if (f) f.qty = qty;
  }
  saveCart(cart);
}
function removeItem(id) {
  saveCart(getCart().filter((i) => i.id !== id));
}

/* ---------- Frete / cupom ---------- */
function shippingFor(subtotal) {
  if (subtotal === 0) return 0;
  return subtotal >= SOMEN.brand.freeShippingFrom ? 0 : 24.9;
}

/* ---------- Badge do carrinho ---------- */
function updateCartBadge() {
  const n = cartCount();
  document.querySelectorAll('[data-cart-badge]').forEach((el) => {
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(title, sub) {
  let t = document.getElementById('somen-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'somen-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML =
    `<span class="toast-mark"><svg viewBox="0 0 120 40"><path d="${MOUSTACHE}"/></svg></span>` +
    `<div><p class="toast-title">${title}</p>${sub ? `<p class="toast-sub">${sub}</p>` : ''}</div>` +
    `<a class="toast-cta" href="carrinho.html">Ver carrinho</a>`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
}

/* ---------- Chrome: topbar + header + footer ---------- */
function renderChrome(active) {
  const b = SOMEN.brand;
  const nav = [
    { label: 'CABELO', href: 'index.html#loja', cat: 'CABELO' },
    { label: 'BARBA', href: 'index.html#loja', cat: 'BARBA' },
    { label: 'FINALIZAÇÃO', href: 'index.html#loja', cat: 'FINALIZAÇÃO' },
    { label: 'KITS', href: 'index.html#loja', cat: 'KITS' },
    { label: 'TODOS OS PRODUTOS', href: 'index.html#loja', cat: 'TODOS' },
  ];

  /* Topbar */
  const topbar = document.querySelector('[data-topbar]');
  if (topbar) {
    topbar.innerHTML =
      `FRETE GRÁTIS PRA TODO O BRASIL ACIMA DE ${BRL(b.freeShippingFrom)} &nbsp;·&nbsp; USE O CÓDIGO <strong>${b.coupon}</strong>`;
  }

  /* Header */
  const header = document.querySelector('[data-header]');
  if (header) {
    header.innerHTML = `
      <div class="wrap header-inner">
        <button class="nav-toggle" data-menu-toggle aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
        </button>
        <a href="index.html" class="logo">${wordmark()}</a>
        <nav class="nav-desktop">
          ${nav.map((n) => `<a href="${n.href}" data-cat="${n.cat}" class="${active === n.cat ? 'is-active' : ''}">${n.label}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <span class="header-phone">${b.phone}</span>
          <button class="icon-btn" aria-label="Buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <a class="icon-btn cart-btn" href="carrinho.html" aria-label="Carrinho">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.1a2 2 0 0 0 2-1.6L21 7H6"/></svg>
            <span class="cart-badge" data-cart-badge>0</span>
          </a>
        </div>
      </div>
      <div class="nav-mobile" data-menu>
        ${nav.map((n) => `<a href="${n.href}" data-cat="${n.cat}">${n.label}</a>`).join('')}
      </div>`;

    // sticky solid on scroll
    const onScroll = () => header.classList.toggle('solid', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // mobile menu
    const toggle = header.querySelector('[data-menu-toggle]');
    const menu = header.querySelector('[data-menu]');
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('open')));
  }

  /* Footer */
  const footer = document.querySelector('[data-footer]');
  if (footer) {
    const col = (title, links) =>
      `<div class="foot-col"><h4>${title}</h4><ul>${links
        .map((l) => `<li><a href="${l[1]}">${l[0]}</a></li>`)
        .join('')}</ul></div>`;
    footer.innerHTML = `
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-brand">
            <a href="index.html" class="logo">${wordmark()}</a>
            <p>Cuidado masculino pra homem se sentir resolvido. Feito e testado por quem vive a barbearia todo dia.</p>
            <p class="foot-manifesto">“${b.manifesto}”</p>
            <div class="foot-social">
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.2-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8Zm0 10.5a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2Zm6.6-10.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12ZM9.7 15.3V8.7l6.2 3.3-6.2 3.3Z"/></svg></a>
            </div>
          </div>
          ${col('Loja', [['Cabelo', 'index.html#loja'], ['Barba', 'index.html#loja'], ['Finalização', 'index.html#loja'], ['Kits & Rotinas', 'index.html#loja']])}
          ${col('A Marca', [['O Manifesto', 'index.html#marca'], ['O Fundador', 'index.html#marca'], ['Barbeiros Parceiros', 'index.html#comunidade'], ['O Método', 'index.html#marca']])}
          ${col('Atendimento', [['Central de Ajuda', '#'], ['Envio e Prazos', '#'], ['Trocas e Devoluções', '#'], ['Fale Conosco', '#']])}
          <div class="foot-col">
            <h4>Contato</h4>
            <ul class="foot-contact">
              <li>${b.phone}</li>
              <li>${b.email}</li>
              <li>${b.instagram}</li>
              <li class="foot-hours">Seg–Sex 9h–18h · Sáb 9h–13h</li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} SÔMEN® — ${b.place}</span>
          <div class="pay">
            <span class="pay-label">PAGAMENTO:</span>
            ${['VISA', 'MASTER', 'ELO', 'PIX', 'BOLETO', 'AMEX'].map((p) => `<span class="pay-chip">${p}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  updateCartBadge();

  /* Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in'));
  }
}

/* Product card markup (reutilizado em home e PDP relacionados) */
function productCardHTML(p) {
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : null;
  return `
    <article class="prod-card reveal" data-cat="${p.cats.join(' ')}">
      <a class="prod-media ${p.tone === 'dark' ? 'tone-dark' : ''}" href="produto.html?id=${p.id}">
        ${p.badge ? `<span class="prod-badge">${p.badge}</span>` : ''}
        <img src="${p.img}" alt="${p.name} SÔMEN" loading="lazy" />
      </a>
      <button class="prod-add" data-add="${p.id}">Adicionar ao carrinho</button>
      <div class="prod-info">
        <p class="prod-cat">${p.category}</p>
        <a href="produto.html?id=${p.id}"><h3 class="prod-name">${p.name}</h3></a>
        <p class="prod-role">${p.role}</p>
        <div class="prod-rating">${stars(p.rating)}<span class="rc">(${p.reviews})</span></div>
        <div class="prod-price">
          <span class="now">${BRL(p.price)}</span>
          ${p.compareAt ? `<span class="was">${BRL(p.compareAt)}</span>` : ''}
        </div>
        <p class="prod-install">ou 3x de ${BRL(p.price / 3)} sem juros</p>
        ${off ? `<p class="prod-save">Economize ${off}%</p>` : ''}
      </div>
    </article>`;
}

/* Liga os botões "Adicionar ao carrinho" dentro de um container */
function wireAddButtons(scope) {
  (scope || document).querySelectorAll('[data-add]').forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(btn.dataset.add, 1);
      const label = btn.textContent;
      btn.textContent = '✓ Adicionado';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('added');
      }, 1400);
    });
  });
}

/* star rating markup */
function stars(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.round(rating) ? 'var(--amber)' : 'none';
    s += `<svg viewBox="0 0 20 20" fill="${fill}" stroke="var(--amber)" stroke-width="1"><path d="M10 1.6l2.5 5.1 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z"/></svg>`;
  }
  return `<span class="stars">${s}</span>`;
}
