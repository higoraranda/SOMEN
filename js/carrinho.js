/* ============================================================
   SÔMEN — Carrinho
   ============================================================ */
const COUPONS = { PRUMO10: 0.1 }; // 10% off

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  const root = document.querySelector('[data-cart-root]');
  const subEl = document.querySelector('[data-cart-sub]');

  function appliedCoupon() {
    return localStorage.getItem('somen_coupon') || '';
  }

  function render() {
    const items = cartItemsDetailed();
    updateCartBadge();

    if (!items.length) {
      subEl.textContent = '';
      root.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 120 40"><path d="M60 15 C55 24 47 27 38 26 C27 25 19 20 13 12.5 C9 7.5 3 8.5 4 15.5 C6 27 19 35 34 33 C46 31 55 25 60 18.5 C65 25 74 31 86 33 C101 35 114 27 116 15.5 C117 8.5 111 7.5 107 12.5 C101 20 93 25 82 26 C73 27 65 24 60 15 Z"/></svg>
          <h2>Seu carrinho tá vazio</h2>
          <p>Bora montar a rotina? Começa pelo shampoo e segue a sequência.</p>
          <a href="index.html#loja" class="btn btn-amber btn-lg">Ver a linha</a>
        </div>`;
      return;
    }

    const count = items.reduce((n, i) => n + i.qty, 0);
    subEl.textContent = `${count} ${count === 1 ? 'item' : 'itens'} · Frete grátis acima de ${BRL(SOMEN.brand.freeShippingFrom)}`;

    const subtotal = cartSubtotal();
    const coupon = appliedCoupon();
    const discount = COUPONS[coupon] ? subtotal * COUPONS[coupon] : 0;
    const afterDisc = subtotal - discount;
    const shipping = shippingFor(afterDisc);
    const total = afterDisc + shipping;
    const missing = Math.max(0, SOMEN.brand.freeShippingFrom - afterDisc);
    const pct = Math.min(100, (afterDisc / SOMEN.brand.freeShippingFrom) * 100);

    root.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">
          ${items.map((i) => `
            <div class="cart-row" data-row="${i.id}">
              <a class="cart-thumb ${i.tone === 'dark' ? 'tone-dark' : ''}" href="produto.html?id=${i.id}"><img src="${i.img}" alt="${i.name}"/></a>
              <div class="cart-meta">
                <p class="cat">${i.category}</p>
                <a href="produto.html?id=${i.id}"><h3>${i.name}</h3></a>
                <p class="role">${i.role}</p>
                <button class="rm" data-remove="${i.id}">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/></svg>
                  Remover
                </button>
              </div>
              <div class="cart-right">
                <div class="qty">
                  <button data-dec="${i.id}" aria-label="Diminuir">−</button>
                  <span>${i.qty}</span>
                  <button data-inc="${i.id}" aria-label="Aumentar">+</button>
                </div>
                <span class="price">${BRL(i.lineTotal)}</span>
                <span class="unit">${BRL(i.price)} / un</span>
              </div>
            </div>`).join('')}
        </div>

        <aside class="cart-summary">
          <h3>Resumo</h3>

          <p class="ship-hint">${missing > 0 ? `Falta ${BRL(missing)} pro frete grátis` : '✓ Você ganhou frete grátis!'}</p>
          <div class="ship-bar"><i style="width:${pct}%"></i></div>

          <div class="coupon">
            <input type="text" placeholder="Cupom (ex: PRUMO10)" value="${coupon}" data-coupon-input />
            <button data-coupon-apply>Aplicar</button>
          </div>
          <p class="coupon-msg ${coupon ? (COUPONS[coupon] ? 'ok' : 'err') : ''}" data-coupon-msg>
            ${coupon ? (COUPONS[coupon] ? `Cupom ${coupon} aplicado (-${COUPONS[coupon] * 100}%)` : 'Cupom inválido') : ''}
          </p>

          <div class="sum-row"><span>Subtotal</span><span>${BRL(subtotal)}</span></div>
          ${discount > 0 ? `<div class="sum-row"><span>Desconto (${coupon})</span><span class="sum-free">− ${BRL(discount)}</span></div>` : ''}
          <div class="sum-row"><span>Frete</span><span class="${shipping === 0 ? 'sum-free' : ''}">${shipping === 0 ? 'Grátis' : BRL(shipping)}</span></div>
          <div class="sum-row total"><span>Total</span><span class="v">${BRL(total)}</span></div>

          <a href="checkout.html" class="btn btn-amber btn-block btn-lg" style="margin-top:18px">Finalizar compra</a>
          <a href="index.html#loja" class="btn btn-outline btn-block" style="margin-top:10px">Continuar comprando</a>
          <p class="pdp-note" style="margin-top:14px;justify-content:center">Pagamento seguro · Pix, cartão e boleto</p>
        </aside>
      </div>`;

    // eventos
    root.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => { const it = SOMEN.find(b.dataset.inc); const cur = getCart().find((x) => x.id === b.dataset.inc).qty; setQty(b.dataset.inc, cur + 1); render(); }));
    root.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const cur = getCart().find((x) => x.id === b.dataset.dec).qty; setQty(b.dataset.dec, cur - 1); render(); }));
    root.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => { removeItem(b.dataset.remove); render(); }));

    const applyBtn = root.querySelector('[data-coupon-apply]');
    const input = root.querySelector('[data-coupon-input]');
    applyBtn.addEventListener('click', () => {
      const code = input.value.trim().toUpperCase();
      if (!code) { localStorage.removeItem('somen_coupon'); render(); return; }
      localStorage.setItem('somen_coupon', code);
      render();
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyBtn.click(); });
  }

  render();
});
