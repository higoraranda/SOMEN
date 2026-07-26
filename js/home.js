/* ============================================================
   SÔMEN — Home
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderChrome('TODOS');

  /* ---- Hero carousel ---- */
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dotsWrap = document.querySelector('[data-hero-dots]');
  let idx = 0,
    timer;
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.children];
  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 6000);
  }
  document.querySelector('[data-hero-next]').addEventListener('click', () => go(idx + 1));
  document.querySelector('[data-hero-prev]').addEventListener('click', () => go(idx - 1));
  restart();

  /* ---- Categorias ---- */
  document.querySelector('[data-categories]').innerHTML = SOMEN.categories
    .map(
      (c) => `
      <a class="cat-card ${c.tone === 'cream' ? 'tone-cream' : ''}" href="index.html#loja" data-filter-jump="${c.label}">
        <img src="${c.img}" alt="${c.label}" />
        <div class="cat-body">
          <p class="d">${c.desc}</p>
          <h3>${c.label}</h3>
          <span class="go">Ver produtos
            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M1 8h11.8l-3.1-3.1.7-.7 4.3 4.3-4.3 4.3-.7-.7L12.8 9H1z"/></svg>
          </span>
        </div>
      </a>`
    )
    .join('');

  /* ---- Filtros ---- */
  const cats = ['TODOS', 'CABELO', 'BARBA', 'FINALIZAÇÃO', 'KITS'];
  const filtersEl = document.querySelector('[data-filters]');
  filtersEl.innerHTML = cats
    .map((c, i) => `<button class="filter ${i === 0 ? 'active' : ''}" data-filter="${c}">${c}</button>`)
    .join('');

  const grid = document.querySelector('[data-products]');
  function renderProducts(cat) {
    grid.innerHTML = SOMEN.byCategory(cat).map(productCardHTML).join('');
    wireAddButtons(grid);
    grid.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));
  }
  renderProducts('TODOS');

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter').forEach((f) => f.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });

  // categoria clicada rola pra loja e aplica filtro
  document.querySelectorAll('[data-filter-jump]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const cat = a.dataset.filterJump;
      const btn = filtersEl.querySelector(`[data-filter="${cat}"]`);
      if (btn) {
        e.preventDefault();
        filtersEl.querySelectorAll('.filter').forEach((f) => f.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(cat);
        document.getElementById('loja').scrollIntoView({ behavior: 'smooth' });
      }
    })
  );

  // nav do header (CABELO/BARBA/... ) aplica filtro ao chegar em #loja
  document.querySelectorAll('.nav-desktop a[data-cat], .nav-mobile a[data-cat]').forEach((a) =>
    a.addEventListener('click', () => {
      const cat = a.dataset.cat;
      const btn = filtersEl.querySelector(`[data-filter="${cat}"]`);
      if (btn) {
        setTimeout(() => {
          filtersEl.querySelectorAll('.filter').forEach((f) => f.classList.remove('active'));
          btn.classList.add('active');
          renderProducts(cat);
        }, 60);
      }
    })
  );

  /* ---- Depoimentos ---- */
  document.querySelector('[data-testimonials]').innerHTML = SOMEN.testimonials
    .map(
      (t) => `
      <div class="testi">
        ${stars(t.rating)}
        <p>“${t.text}”</p>
        <div class="testi-who">
          <span class="testi-ava">${t.name[0]}</span>
          <div>
            <p class="n">${t.name}</p>
            <p class="r">${t.role}</p>
            <p class="p">${t.place}</p>
          </div>
        </div>
      </div>`
    )
    .join('');

  /* ---- Newsletter ---- */
  const news = document.querySelector('[data-news]');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    news.innerHTML = '<span class="news-ok">✓ É da casa agora. Fica de olho no e-mail.</span>';
  });
});
