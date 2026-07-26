/* ============================================================
   SÔMEN — Página de produto (PDP), dirigida por ?id=
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const p = SOMEN.find(id) || SOMEN.products[0];
  document.title = `${p.name} — SÔMEN`;
  renderChrome(p.category);

  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : null;
  const toneClass = p.tone === 'dark' ? 'tone-dark' : '';

  // Galeria: kit mostra os componentes; demais só o principal
  let gallery = [{ img: p.img, tone: p.tone }];
  if (p.contains) gallery = gallery.concat(p.contains.map((cid) => {
    const c = SOMEN.find(cid);
    return { img: c.img, tone: c.tone };
  }));

  const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;

  const relateds = SOMEN.products.filter((x) => x.id !== p.id && x.category !== 'KITS').slice(0, 3);

  const el = document.querySelector('[data-pdp]');
  el.innerHTML = `
    <div class="wrap">
      <p class="breadcrumb"><a href="index.html">Início</a> / <a href="index.html#loja">${p.category}</a> / ${p.name}</p>
    </div>

    <section class="wrap pdp">
      <div class="pdp-gallery reveal">
        <div class="pdp-main ${toneClass}"><img data-main-img src="${p.img}" alt="${p.name} SÔMEN" /></div>
        ${gallery.length > 1 ? `<div class="pdp-thumbs">${gallery.map((g, i) =>
          `<button class="pdp-thumb ${g.tone === 'dark' ? 'tone-dark' : ''} ${i === 0 ? 'active' : ''}" data-thumb="${g.img}"><img src="${g.img}" alt=""/></button>`).join('')}</div>` : ''}
      </div>

      <div class="pdp-info reveal">
        <span class="eyebrow">${p.uses}</span>
        <p class="pdp-role" style="margin-top:12px">${p.role}</p>
        <h1>${p.name}</h1>
        <div class="pdp-rating">${stars(p.rating)}<span class="rc">${p.rating.toFixed(1)} · ${p.reviews} avaliações</span></div>
        <p class="pdp-desc">${p.desc}</p>

        <div class="pdp-price-row">
          <span class="now">${BRL(p.price)}</span>
          ${p.compareAt ? `<span class="was">${BRL(p.compareAt)}</span>` : ''}
          ${off ? `<span class="off">-${off}%</span>` : ''}
        </div>
        <p class="pdp-install">ou 3x de ${BRL(p.price / 3)} sem juros · à vista no Pix</p>

        <div class="pdp-meta">
          <div class="m"><p class="k">Conteúdo</p><p class="v">${p.size}</p></div>
          <div class="m"><p class="k">Uso</p><p class="v">${p.uses}</p></div>
          <div class="m"><p class="k">Categoria</p><p class="v">${p.category}</p></div>
        </div>

        <div class="pdp-buy">
          <div class="qty">
            <button data-qminus aria-label="Diminuir">−</button>
            <span data-qval>1</span>
            <button data-qplus aria-label="Aumentar">+</button>
          </div>
          <button class="btn btn-amber" data-add-pdp>Adicionar ao carrinho</button>
        </div>
        <button class="btn btn-outline btn-block" data-buy-now style="margin-bottom:14px">Comprar agora</button>
        <p class="pdp-note">${check.replace('stroke-width="2"','stroke-width="2" style="width:16px;height:16px"')} Frete grátis acima de R$ 199 · Retirada em barbearias parceiras</p>

        <ul class="pdp-benefits">
          ${p.benefits.map((b) => `<li>${check} <span>${b}</span></li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="section panel-ink-1" style="margin-top:40px">
      <div class="wrap reveal">
        <span class="eyebrow">Modo de uso</span>
        <div class="howto-grid" style="margin-top:26px">
          ${p.howto.map((h, i) => `<div class="howto-step"><span class="num">0${i + 1}</span><p>${h}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section panel-cream">
      <div class="wrap reveal">
        <div class="pdp-quote">
          <span class="mark">“</span>
          <blockquote style="color:var(--on-cream)">Uso na minha bancada. Cliente pergunta o que é, eu conto a história — e ele leva pra casa.</blockquote>
          <cite style="color:var(--on-cream-dim)">— Renan Alves, Studio Mineiros Barber · Itu/SP</cite>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="sec-head reveal"><h2>Complete a rotina</h2><span class="rule"></span>
          <a class="more" href="index.html#loja">VER TUDO</a></div>
        <div class="prod-grid" data-related></div>
      </div>
    </section>
  `;

  document.querySelector('[data-related]').innerHTML = relateds.map(productCardHTML).join('');
  wireAddButtons(document.querySelector('[data-related]'));
  el.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));

  /* Troca de imagem principal */
  const mainImg = el.querySelector('[data-main-img]');
  const mainWrap = el.querySelector('.pdp-main');
  el.querySelectorAll('[data-thumb]').forEach((t) =>
    t.addEventListener('click', () => {
      el.querySelectorAll('.pdp-thumb').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      mainImg.src = t.dataset.thumb;
      mainWrap.classList.toggle('tone-dark', t.classList.contains('tone-dark'));
    })
  );

  /* Quantidade */
  let qty = 1;
  const qval = el.querySelector('[data-qval]');
  el.querySelector('[data-qminus]').addEventListener('click', () => { qty = Math.max(1, qty - 1); qval.textContent = qty; });
  el.querySelector('[data-qplus]').addEventListener('click', () => { qty = Math.min(20, qty + 1); qval.textContent = qty; });

  /* Adicionar / comprar */
  const addBtn = el.querySelector('[data-add-pdp]');
  addBtn.addEventListener('click', () => {
    addToCart(p.id, qty);
    const t = addBtn.textContent;
    addBtn.textContent = '✓ Adicionado ao carrinho';
    setTimeout(() => (addBtn.textContent = t), 1500);
  });
  el.querySelector('[data-buy-now]').addEventListener('click', () => {
    addToCart(p.id, qty);
    location.href = 'checkout.html';
  });

  window.scrollTo(0, 0);
});
