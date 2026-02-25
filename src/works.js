// テキストランダムフェード
function splitAndAnimate(el, startDelay, duration) {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  el.style.opacity = '1';
  const spans = [];
  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach(ch => {
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(s);
        spans.push(s);
      });
    } else if (node.nodeName === 'BR') {
      el.appendChild(document.createElement('br'));
    } else {
      el.appendChild(node.cloneNode(true));
    }
  });
  const count = spans.length;
  const delays = spans.map((_, i) => startDelay + (i / count) * duration);
  for (let i = delays.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [delays[i], delays[j]] = [delays[j], delays[i]];
  }
  spans.forEach((sp, i) => { sp.style.animationDelay = delays[i].toFixed(3) + 's'; });
}

// hero部分を隠し、テキストをフェードインする演出
function revealHeroContent() {
  const nav     = document.getElementById('main-nav');
  const title   = document.getElementById('works-hero-title');
  const divider = document.getElementById('hero-divider');
  const desc    = document.getElementById('works-hero-description');

  nav.classList.add('revealed');
  nav.addEventListener('animationend', () => {
    nav.style.animation = 'none'; nav.style.opacity = '1';
  }, { once: true });

  let t = 0.1;
  splitAndAnimate(title, t, 0.5); t += 0.35;
  divider.style.animation = 'fadeIn 0.5s ease forwards';
  divider.style.animationDelay = t + 's';
  divider.addEventListener('animationend', () => {
    divider.style.animation = 'none'; divider.style.opacity = '1';
  }, { once: true });
  t += 0.2;
  splitAndAnimate(desc, t, 0.6);
}

// インクキャンバス
(function() {
  const circle = document.getElementById('hero-circle');
  const cv     = document.getElementById('ink-canvas');
  const ctx    = cv.getContext('2d');
  const COVER  = 'rgba(255,255,255,1)';

  // サイズ指定
  function setSize() {
    cv.width  = circle.offsetWidth  || 300;
    cv.height = circle.offsetHeight || 300;
  }

  class InkDrop {
    constructor(x, y, delay) {
      const W = cv.width, H = cv.height;
      this.x = x; this.y = y; this.r = 0;
      this.maxR  = Math.sqrt(W*W + H*H) * (0.30 + Math.random() * 0.45);
      this.speed = 10 + Math.random() * 10;
      this.delay = delay; this.age = 0;
      this.wb  = Math.random() * Math.PI * 2;
      this.wbS = 0.018 + Math.random() * 0.03;
      this.sx  = 0.78 + Math.random() * 0.44;
      this.sy  = 0.78 + Math.random() * 0.44;
      this.ang = Math.random() * Math.PI * 2;
      this.done = false;
      this.sats = Array.from({ length: 4 + Math.floor(Math.random() * 4) }, () => ({
        a: Math.random() * Math.PI * 2,
        d: 0.5  + Math.random() * 0.45,
        r: 0.20 + Math.random() * 0.32,
      }));
    }
    update() {
      this.age++;
      if (this.age < this.delay) return;
      this.wb += this.wbS;
      if (this.r < this.maxR) {
        this.r += this.speed * (1 - this.r / this.maxR * 0.6);
      } else { this.done = true; }
    }
    get progress() { return this.age < this.delay ? 0 : Math.min(1, this.r / this.maxR); }
    drawHole(c) {
      if (this.age < this.delay || this.r <= 0) return;
      const p = this.progress;
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.ang + Math.sin(this.wb) * 0.05);
      c.scale(this.sx, this.sy);
      c.globalAlpha = Math.min(1, p * 4);
      c.beginPath();
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const n = 1
          + Math.sin(a * 3  + this.wb) * 0.10
          + Math.sin(a * 7  + 1.3)     * 0.06
          + Math.sin(a * 13)            * 0.03;
        c.lineTo(Math.cos(a) * this.r * n, Math.sin(a) * this.r * n);
      }
      c.closePath();
      const g = c.createRadialGradient(0, 0, this.r * 0.15, 0, 0, this.r * 1.1);
      g.addColorStop(0,    'rgba(0,0,0,1)');
      g.addColorStop(0.7,  'rgba(0,0,0,1)');
      g.addColorStop(0.92, 'rgba(0,0,0,0.5)');
      g.addColorStop(1,    'rgba(0,0,0,0)');
      c.fillStyle = g; c.fill();
      this.sats.forEach(s => {
        const sr = this.r * s.d;
        const sx = Math.cos(s.a) * sr, sy = Math.sin(s.a) * sr;
        const sR = this.r * s.r * p;
        if (sR < 1) return;
        const sg = c.createRadialGradient(sx, sy, 0, sx, sy, sR);
        sg.addColorStop(0, 'rgba(0,0,0,0.9)');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sg;
        c.beginPath(); c.arc(sx, sy, sR, 0, Math.PI * 2); c.fill();
      });
      c.restore();
    }
  }

  function makeDrops() {
    const W = cv.width, H = cv.height;
    const O = [
      {x:W*.5, y:H*.5, d:0}, {x:W*.25,y:H*.30,d:4}, {x:W*.75,y:H*.65,d:6},
      {x:W*.12,y:H*.75,d:8}, {x:W*.88,y:H*.20,d:7}, {x:W*.5, y:H*.10,d:10},
      {x:W*.5, y:H*.90,d:11},
    ];
    const drops = O.map(o => new InkDrop(o.x, o.y, o.d));
    for (let i = 0; i < 16; i++)
      drops.push(new InkDrop(Math.random()*W, Math.random()*H, 2+Math.random()*22));
    return drops;
  }

  function startInk() {
    setSize();
    const drops = makeDrops();
    // 全面を覆う
    ctx.fillStyle = COVER;
    ctx.fillRect(0, 0, cv.width, cv.height);

    function frame() {
      ctx.fillStyle = COVER;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'destination-out';
      drops.forEach(d => { d.update(); d.drawHole(ctx); });
      ctx.globalCompositeOperation = 'source-over';
      if (!drops.every(d => d.done)) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cv.width, cv.height);
      }
    }
    requestAnimationFrame(frame);
  }

  // 初期化
  function init() {
    setSize();
    // 初期：全面覆う
    ctx.fillStyle = COVER;
    ctx.fillRect(0, 0, cv.width, cv.height);
    // 円フェードイン
    circle.style.transition = 'opacity 0.5s ease 0.1s';
    circle.style.opacity = '1';
    // インク開始
    setTimeout(startInk, 300);
    // テキスト reveal（独立タイマーで確実に発火）
    setTimeout(revealHeroContent, 600);
  }

  // DOMContentLoaded / load どちらか先に来た方で起動（確実性を高める）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 横スクロール + カードフェードイン
(function() {
  const wrapper      = document.getElementById('hScrollWrapper');
  const track        = document.getElementById('hScrollTrack');
  const progressFill = document.getElementById('progressFill');
  const progressNum  = document.getElementById('progressNum');
  const progressBar  = document.getElementById('scrollProgress');
  const cards        = Array.from(track.querySelectorAll('.card'));
  const TOTAL        = cards.length;
  let cfg = { scrollDist: 0 };

  function setup() {
    const scrollDist = Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.12);
    wrapper.style.height = (window.innerHeight + scrollDist) + 'px';
    cfg = { scrollDist };
  }
  setup();
  window.addEventListener('resize', setup);

  function onScroll() {
    const wrapTop  = wrapper.getBoundingClientRect().top + window.scrollY;
    const scrolled = window.scrollY - wrapTop;
    const progress = Math.max(0, Math.min(1, scrolled / cfg.scrollDist));

    track.style.transform = `translateX(${-progress * cfg.scrollDist}px)`;
    progressFill.style.width = (progress * 100) + '%';
    const idx = Math.min(TOTAL, Math.ceil(progress * TOTAL) + 1);
    progressNum.textContent = '0' + Math.min(idx, TOTAL) + ' / 0' + TOTAL;

    const inSection = scrolled > -window.innerHeight * 0.3 && scrolled < cfg.scrollDist + window.innerHeight * 0.3;
    progressBar.classList.toggle('visible', inSection);

    cards.forEach(card => {
      if (card.getBoundingClientRect().left < window.innerWidth * 0.95)
        card.classList.add('card-visible');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
