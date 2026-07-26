/* ============================================================
   SÔMEN — Checkout (simulação — nenhum pagamento é processado)
   ============================================================ */
const COUPONS_CO = { PRUMO10: 0.1 };

document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  const root = document.querySelector('[data-checkout-root]');
  let items = cartItemsDetailed();

  if (!items.length) {
    root.innerHTML = `
      <div class="cart-empty" style="padding:100px 0">
        <svg viewBox="0 0 120 40"><path d="M60 15 C55 24 47 27 38 26 C27 25 19 20 13 12.5 C9 7.5 3 8.5 4 15.5 C6 27 19 35 34 33 C46 31 55 25 60 18.5 C65 25 74 31 86 33 C101 35 114 27 116 15.5 C117 8.5 111 7.5 107 12.5 C101 20 93 25 82 26 C73 27 65 24 60 15 Z"/></svg>
        <h2>Sem itens pra finalizar</h2>
        <p>Escolhe seus produtos e volta aqui pra fechar no prumo.</p>
        <a href="index.html#loja" class="btn btn-amber btn-lg">Ver a linha</a>
      </div>`;
    return;
  }

  let payMethod = 'pix';

  function money() {
    const subtotal = cartSubtotal();
    const coupon = localStorage.getItem('somen_coupon') || '';
    const couponDisc = COUPONS_CO[coupon] ? subtotal * COUPONS_CO[coupon] : 0;
    const afterCoupon = subtotal - couponDisc;
    const shipping = shippingFor(afterCoupon);
    const pixDisc = payMethod === 'pix' ? afterCoupon * 0.05 : 0;
    const total = afterCoupon + shipping - pixDisc;
    return { subtotal, coupon, couponDisc, shipping, pixDisc, total };
  }

  function summaryHTML() {
    const m = money();
    return `
      <h3>Seu pedido</h3>
      ${items.map((i) => `
        <div class="co-line">
          <div class="th ${i.tone === 'dark' ? 'tone-dark' : ''}"><img src="${i.img}" alt="${i.name}"/><span class="q">${i.qty}</span></div>
          <div class="nm"><b>${i.name}</b><br><span style="color:var(--text-mute);font-size:.72rem">${i.role}</span></div>
          <div class="pr">${BRL(i.lineTotal)}</div>
        </div>`).join('')}
      <div class="co-total">
        <div class="sum-row"><span>Subtotal</span><span>${BRL(m.subtotal)}</span></div>
        ${m.couponDisc > 0 ? `<div class="sum-row"><span>Cupom ${m.coupon}</span><span class="sum-free">− ${BRL(m.couponDisc)}</span></div>` : ''}
        <div class="sum-row"><span>Frete</span><span class="${m.shipping === 0 ? 'sum-free' : ''}">${m.shipping === 0 ? 'Grátis' : BRL(m.shipping)}</span></div>
        ${m.pixDisc > 0 ? `<div class="sum-row"><span>Desconto Pix (5%)</span><span class="sum-free">− ${BRL(m.pixDisc)}</span></div>` : ''}
        <div class="sum-row total"><span>Total</span><span class="v">${BRL(m.total)}</span></div>
      </div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="page-head"><h1>Finalizar compra</h1></div>
      <div class="steps-nav">
        <span class="step-chip done"><span class="n">✓</span>Sacola</span>
        <span class="step-sep"></span>
        <span class="step-chip done"><span class="n">2</span>Entrega &amp; Pagamento</span>
        <span class="step-sep"></span>
        <span class="step-chip"><span class="n">3</span>Confirmação</span>
      </div>

      <form class="checkout-layout" data-form novalidate>
        <div>
          <div class="co-block">
            <h3><span class="bn">1</span> Contato</h3>
            <div class="field-grid">
              <div class="field col-2"><label>Nome completo</label><input name="nome" required placeholder="Como no documento" /></div>
              <div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@email.com.br" /></div>
              <div class="field"><label>Celular / WhatsApp</label><input name="fone" required placeholder="(19) 99999-9999" /></div>
              <div class="field"><label>CPF</label><input name="cpf" required placeholder="000.000.000-00" /></div>
            </div>
          </div>

          <div class="co-block">
            <h3><span class="bn">2</span> Entrega</h3>
            <div class="field-grid">
              <div class="field"><label>CEP</label><input name="cep" required placeholder="00000-000" /></div>
              <div class="field"><label>Cidade / UF</label><input name="cidade" required placeholder="São Paulo / SP" /></div>
              <div class="field col-2"><label>Endereço</label><input name="endereco" required placeholder="Rua, avenida..." /></div>
              <div class="field"><label>Número</label><input name="numero" required placeholder="123" /></div>
              <div class="field"><label>Complemento</label><input name="compl" placeholder="Apto, bloco (opcional)" /></div>
              <div class="field col-2"><label>Bairro</label><input name="bairro" required placeholder="Seu bairro" /></div>
            </div>
          </div>

          <div class="co-block">
            <h3><span class="bn">3</span> Pagamento</h3>
            <div class="pay-options" data-pay>
              <label class="pay-opt active"><input type="radio" name="pay" value="pix" checked>
                <span><span class="lbl">Pix</span><br><span class="sub">Aprovação na hora</span></span><span class="tag">5% de desconto</span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="cartao">
                <span><span class="lbl">Cartão de crédito</span><br><span class="sub">Em até 3x sem juros</span></span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="boleto">
                <span><span class="lbl">Boleto bancário</span><br><span class="sub">Vence em 3 dias úteis</span></span></label>
            </div>
            <div class="pay-detail" data-pay-detail></div>
            <p class="pdp-note" style="margin-top:14px">Ambiente simulado — nenhum pagamento é processado de verdade.</p>
          </div>
        </div>

        <aside class="co-summary">
          <div data-summary>${summaryHTML()}</div>
          <button type="submit" class="btn btn-amber btn-block btn-lg" style="margin-top:16px">Finalizar pedido</button>
          <a href="carrinho.html" class="btn btn-outline btn-block" style="margin-top:10px">Voltar ao carrinho</a>
        </aside>
      </form>`;

    // payment selection
    const payWrap = root.querySelector('[data-pay]');
    const payDetail = root.querySelector('[data-pay-detail]');
    function renderPayDetail() {
      if (payMethod === 'cartao') {
        const m = money();
        payDetail.innerHTML = `
          <div class="field-grid" style="margin-top:14px">
            <div class="field col-2"><label>Número do cartão</label><input name="ccnum" placeholder="0000 0000 0000 0000" inputmode="numeric" /></div>
            <div class="field col-2"><label>Nome impresso no cartão</label><input name="ccname" placeholder="Nome como no cartão" /></div>
            <div class="field"><label>Validade</label><input name="ccexp" placeholder="MM/AA" /></div>
            <div class="field"><label>CVV</label><input name="cccvv" placeholder="000" inputmode="numeric" /></div>
            <div class="field col-2"><label>Parcelas</label><select name="parcelas">
              <option>1x de ${BRL(m.total)} sem juros</option>
              <option>2x de ${BRL(m.total / 2)} sem juros</option>
              <option>3x de ${BRL(m.total / 3)} sem juros</option>
            </select></div>
          </div>`;
      } else if (payMethod === 'pix') {
        payDetail.innerHTML = `<p style="color:var(--text-dim);font-size:.86rem;margin-top:14px">Ao finalizar, geramos um QR Code Pix. O pedido é confirmado assim que o pagamento cair — costuma ser na hora.</p>`;
      } else {
        payDetail.innerHTML = `<p style="color:var(--text-dim);font-size:.86rem;margin-top:14px">O boleto é gerado ao finalizar e enviado pro seu e-mail. O pedido é separado após a compensação.</p>`;
      }
    }
    renderPayDetail();

    payWrap.addEventListener('change', (e) => {
      payMethod = e.target.value;
      payWrap.querySelectorAll('.pay-opt').forEach((o) => o.classList.remove('active'));
      e.target.closest('.pay-opt').classList.add('active');
      root.querySelector('[data-summary]').innerHTML = summaryHTML();
      renderPayDetail();
    });

    // submit
    root.querySelector('[data-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      // validação simples dos obrigatórios
      const required = [...form.querySelectorAll('[required]')];
      const missing = required.filter((f) => !f.value.trim());
      if (missing.length) {
        missing[0].focus();
        missing.forEach((f) => (f.style.borderColor = '#c9704a'));
        toast('Faltou preencher', 'Confere os campos obrigatórios pra seguir.');
        return;
      }
      confirmOrder(form);
    });
  }

  function confirmOrder(form) {
    const m = money();
    const nome = form.nome.value.trim().split(' ')[0];
    const order = 'SM' + Date.now().toString().slice(-6);
    const methodLabel = { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' }[payMethod];

    // limpa carrinho
    localStorage.removeItem('somen_cart_v1');
    localStorage.removeItem('somen_coupon');
    updateCartBadge();

    root.innerHTML = `
      <div class="confirm">
        <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h1>Tá no prumo, ${nome}!</h1>
        <p>Recebemos seu pedido <span class="order-id">#${order}</span>.</p>
        <p>Pagamento por <b>${methodLabel}</b> · Total <b>${BRL(m.total)}</b>.</p>
        <p style="margin-top:14px">Mandamos a confirmação pro seu e-mail. Assim que sair da bancada, você recebe o código de rastreio.</p>
        <a href="index.html" class="btn btn-amber btn-lg">Voltar pra loja</a>
      </div>`;
    window.scrollTo(0, 0);
  }

  render();
});
