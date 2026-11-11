// ===== 귀인 보청기 — 동작 스크립트 =====
// 메뉴·히어로 슬라이드·둘러보기 갤러리 + (스타일 v9부터) 스크롤 등장, 사진 크게 보기, 맨 위로 버튼.
// 새 효과는 css/style.css 의 --ui 값이 9 이상일 때만 켠다(옛 스타일이 캐시된 화면에서 어긋나지 않게).
document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var UI = parseInt(getComputedStyle(root).getPropertyValue('--ui'), 10) || 0;
  var NEW = UI >= 9;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var isEn = (root.lang || '').toLowerCase().indexOf('en') === 0;
  if (NEW) root.classList.add('ui');

  /* ---------- 모바일 메뉴 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var gnb = document.querySelector('.gnb');
  var header = document.querySelector('.site-header');
  function setMenu(open) {
    gnb.classList.toggle('open', open);
    toggle.classList.toggle('x', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && gnb) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () { setMenu(!gnb.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gnb.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (gnb.classList.contains('open') && header && !header.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- 히어로 슬라이더 (페이드) ---------- */
  var slides = document.querySelectorAll('.hero-slides .slide');
  var dots = document.querySelectorAll('.hero-dots button');
  if (slides.length > 1) {
    var cur = 0, timer = null;
    var go = function (n) {
      slides[cur].classList.remove('on');
      if (dots[cur]) dots[cur].classList.remove('on');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('on');
      if (dots[cur]) dots[cur].classList.add('on');
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var play = function () { stop(); timer = setInterval(function () { go(cur + 1); }, 4500); };
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); play(); });
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
    play();
  }

  /* ---------- 둘러보기 갤러리 ---------- */
  var stageBox = document.querySelector('.gallery .stage');
  var stage = stageBox ? stageBox.querySelector('img') : null;
  var thumbs = document.querySelectorAll('.gallery .thumbs img');
  if (stage && thumbs.length) {
    var gi = 0, seq = 0;
    var full = function (t) { return t.getAttribute('data-full') || t.getAttribute('src'); };
    var show = function (n, animate) {
      gi = (n + thumbs.length) % thumbs.length;
      var src = full(thumbs[gi]), token = ++seq;
      thumbs.forEach(function (t) { t.classList.remove('on'); });
      thumbs[gi].classList.add('on');
      if (stage.getAttribute('src') === src) return;
      if (animate && NEW && !reduce) {
        stage.classList.add('swap');
        var pre = new Image();
        var done = function () {
          if (token !== seq) return;
          stage.src = src;
          requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.remove('swap'); }); });
        };
        pre.onload = pre.onerror = function () { setTimeout(done, 160); };
        pre.src = src;
      } else {
        stage.src = src;
      }
    };
    thumbs.forEach(function (t, i) {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'button');
      t.addEventListener('click', function () { show(i, true); });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i, true); } });
    });
    var prev = document.querySelector('.gallery .prev');
    var next = document.querySelector('.gallery .next');
    if (prev) prev.addEventListener('click', function () { show(gi - 1, true); });
    if (next) next.addEventListener('click', function () { show(gi + 1, true); });
    document.addEventListener('keydown', function (e) {
      if (document.querySelector('.lb')) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') show(gi - 1, true);
      else if (e.key === 'ArrowRight') show(gi + 1, true);
    });
    var tx = null;
    stageBox.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    stageBox.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 45) show(gi + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    show(0, false);
  }

  if (!NEW) return;   // 아래는 새 스타일(v9+)에서만

  /* ---------- 헤더 그림자 + 맨 위로 버튼 ---------- */
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'to-top';
  topBtn.setAttribute('aria-label', isEn ? 'Back to top' : '맨 위로');
  topBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(topBtn);
  var ticking = false;
  var onScroll = function () {
    var y = window.pageYOffset || root.scrollTop || 0;
    if (header) header.classList.toggle('scrolled', y > 8);
    topBtn.classList.toggle('show', y > 700);
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 사진 크게 보기 ---------- */
  var zoomables = document.querySelectorAll('.cert-grid img, .tour-grid img, .guide figure img');
  var openLB = function (img) {
    if (document.querySelector('.lb')) return;
    var box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', isEn ? 'Enlarged photo' : '사진 크게 보기');
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'lb-x'; x.innerHTML = '&times;';
    x.setAttribute('aria-label', isEn ? 'Close' : '닫기');
    var big = document.createElement('img');
    big.src = img.currentSrc || img.src; big.alt = img.alt || '';
    box.appendChild(big); box.appendChild(x);
    document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('on'); }); });
    var close = function () {
      document.removeEventListener('keydown', onKey);
      box.classList.remove('on');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, reduce ? 0 : 300);
      if (img.focus) img.focus({ preventScroll: true });
    };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    x.focus({ preventScroll: true });
  };
  zoomables.forEach(function (img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { openLB(img); });
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(img); } });
  });

  /* ---------- 스크롤 등장 ---------- */
  if (reduce || !('IntersectionObserver' in window)) return;
  var SEL = [
    '.sec-title', '.intro', '.usp .card', '.feature .txt', '.feature .img', '.profile .txt', '.profile .pic',
    '.gov .txt', '.gov .pic', '.steps h3', '.steps li', '.tour-grid img', '.tour-grid + .center', '.faq details',
    '.info-cols', '.info-cols + .center', '.member', '.cert-grid img', '.branch', '.gallery', '.contact-box',
    '.g-intro', '.g-list li', '.g-related h2', '.guide figure', '.guide .g-cta'
  ].join(',');
  var ZOOM = '.feature .img, .profile .pic, .gov .pic, .tour-grid img, .cert-grid img, .gallery, .guide figure';
  var vh = window.innerHeight || root.clientHeight;
  var targets = [];
  Array.prototype.forEach.call(document.querySelectorAll(SEL), function (el) {
    if (el.getBoundingClientRect().top < vh * 0.9) return;        // 처음부터 보이는 것은 그대로 둔다(깜빡임 방지)
    el.classList.add('rv');
    if (el.matches(ZOOM)) el.classList.add('rv-z');
    targets.push(el);
  });
  if (!targets.length) return;
  root.classList.add('anim');
  var pending = targets.slice();
  var finish = function (el) { el.classList.remove('rv', 'rv-z', 'in'); el.style.transitionDelay = ''; };
  var reveal = function (el, delay) {
    var i = pending.indexOf(el);
    if (i < 0) return;                       // 이미 처리함
    pending.splice(i, 1);
    io.unobserve(el);
    el.style.transitionDelay = delay + 'ms';
    el.classList.add('in');
    setTimeout(function () { finish(el); }, delay + 1000);
  };
  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (en) {
      if (en.isIntersecting) reveal(en.target, Math.min(n++, 6) * 85);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
  targets.forEach(function (el) { io.observe(el); });
  // 안전장치 1: 화면에 들어온 요소는 0.6초마다 직접 확인해 반드시 나타나게 한다(관찰자 신호가 늦거나 빠져도).
  //            이미 지나친(화면 위쪽) 요소는 움직임 없이 바로 보이게 한다.
  var sweep = setInterval(function () {
    if (!pending.length) { clearInterval(sweep); return; }
    var h = window.innerHeight || root.clientHeight, n = 0;
    pending.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom <= 0) { pending.splice(pending.indexOf(el), 1); io.unobserve(el); finish(el); }
      else if (r.top < h * 0.94) reveal(el, Math.min(n++, 6) * 85);
    });
  }, 600);
  // 안전장치 2: 인쇄할 때는 전부 보이게
  window.addEventListener('beforeprint', function () { pending.slice().forEach(finish); pending.length = 0; });
});
