/*
 * TOP ページの小さな動き（スクロールで表示・期限表示の例）。
 *
 * プログレッシブエンハンスメント：
 * - このスクリプトが動いて初めて <html> に「reveal-on」を付け、そのときだけ CSS が要素を隠す。
 *   読み込みに失敗しても、JavaScript が無効でも、すべての内容は最初から表示されたまま。
 * - 「動きを減らす」設定（prefers-reduced-motion）のときは何もしない。
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // ---- スクロールで表示（一度表示したら、戻っても再アニメーションしない） ----
  var targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && targets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    // 最初から画面内にある要素は隠さない（読み込み直後のちらつきを防ぐ）
    var viewH = window.innerHeight || document.documentElement.clientHeight;
    Array.prototype.forEach.call(targets, function (el) {
      if (el.getBoundingClientRect().top < viewH * 0.92) el.classList.add('is-revealed');
      else observer.observe(el);
    });
    document.documentElement.classList.add('reveal-on');
  }

  // ---- 期限表示の例：あと3日 → あと1日 → 今日まで → +1日 → +6日 ----
  var demo = document.querySelector('[data-deadline-demo]');
  if (!demo) return;
  var badge = demo.querySelector('.demo-badge');
  var value = demo.querySelector('.demo-value');
  var state = demo.querySelector('.demo-state');
  var steps = demo.querySelectorAll('.demo-steps li');
  // 表示の文言・色の種類はアプリ（src/lib/copy.ts）と同じ
  var STATES = [
    { v: 'あと3日', s: '期限前', k: 'is-upcoming' },
    { v: 'あと1日', s: '期限前', k: 'is-upcoming' },
    { v: '今日まで', s: '期限当日', k: 'is-today' },
    { v: '+1日', s: '賞味期限超過', k: 'is-overdue' },
    { v: '+6日', s: '賞味期限超過', k: 'is-overdue' },
  ];
  var index = 0;
  var timer = null;
  var visible = false;

  function show(next) {
    badge.classList.add('is-fading');
    setTimeout(function () {
      var st = STATES[next];
      value.textContent = st.v;
      state.textContent = st.s;
      badge.className = 'demo-badge ' + st.k;
      Array.prototype.forEach.call(steps, function (li, i) { li.classList.toggle('is-current', i === next); });
      index = next;
    }, 220);
  }
  function tick() {
    show((index + 1) % STATES.length);
    // 最後（+6日）は少し長めに止めてから最初に戻る
    timer = setTimeout(tick, index === STATES.length - 2 ? 3200 : 2000);
  }
  function start() {
    if (timer || !visible || document.hidden) return;
    timer = setTimeout(tick, 1600);
  }
  function stop() {
    clearTimeout(timer);
    timer = null;
  }
  // 画面に見えているときだけ動かす
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(demo);
  } else {
    visible = true;
    start();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
})();
