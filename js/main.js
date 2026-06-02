// ===== 귀인 보청기 — 동작 스크립트 =====
document.addEventListener('DOMContentLoaded', function () {

  /* 모바일 메뉴 토글 */
  var toggle = document.querySelector('.nav-toggle');
  var gnb = document.querySelector('.gnb');
  if (toggle && gnb) {
    toggle.addEventListener('click', function () {
      gnb.classList.toggle('open');
      toggle.classList.toggle('x');
    });
  }

  /* 히어로 슬라이더 (페이드) */
  var slides = document.querySelectorAll('.hero-slides .slide');
  var dots = document.querySelectorAll('.hero-dots button');
  if (slides.length > 1) {
    var cur = 0, timer;
    function go(n) {
      slides[cur].classList.remove('on');
      if (dots[cur]) dots[cur].classList.remove('on');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('on');
      if (dots[cur]) dots[cur].classList.add('on');
    }
    function play() { timer = setInterval(function () { go(cur + 1); }, 4500); }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(timer); go(i); play(); });
    });
    play();
  }

  /* 둘러보기 갤러리 슬라이더 */
  var stage = document.querySelector('.gallery .stage img');
  var thumbs = document.querySelectorAll('.gallery .thumbs img');
  if (stage && thumbs.length) {
    var gi = 0;
    function show(n) {
      gi = (n + thumbs.length) % thumbs.length;
      stage.src = thumbs[gi].dataset.full || thumbs[gi].src;
      thumbs.forEach(function (t) { t.classList.remove('on'); });
      thumbs[gi].classList.add('on');
      thumbs[gi].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    var prev = document.querySelector('.gallery .prev');
    var next = document.querySelector('.gallery .next');
    if (prev) prev.addEventListener('click', function () { show(gi - 1); });
    if (next) next.addEventListener('click', function () { show(gi + 1); });
    show(0);
  }
});
