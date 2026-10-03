/*
 * 食品一覧の検索（/foods/）。ブラウザの中だけで動き、入力内容はどこにも送信しない。
 * JavaScript が無効でも、一覧はすべて表示される。
 */
(function () {
  'use strict';
  var input = document.getElementById('food-search');
  if (!input) return;
  var form = input.form;
  var status = document.getElementById('search-status');
  var items = Array.prototype.slice.call(document.querySelectorAll('.food-item'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
  var hideOnSearch = Array.prototype.slice.call(document.querySelectorAll('[data-hide-on-search]'));
  var collapsibles = Array.prototype.slice.call(document.querySelectorAll('[data-collapsible]'));
  var empty = document.querySelector('[data-search-empty]');
  var terms = items.map(function (el) { return (el.getAttribute('data-terms') || '').split('|'); });
  var timer = null;

  // アプリの src/lib/normalize.ts と同じ（全角→半角、小文字、カタカナ→ひらがな、空白除去）
  function normalize(s) {
    return String(s)
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0x60); })
      .replace(/\s+/g, '');
  }

  function apply(trackEvent) {
    var q = normalize(input.value);
    var count = 0;
    items.forEach(function (el, i) {
      var hit = q === '' || terms[i].some(function (t) { return t.indexOf(q) !== -1; });
      el.hidden = !hit;
      if (hit) count++;
    });
    groups.forEach(function (g) {
      g.hidden = !g.querySelector('.food-item:not([hidden])');
    });
    hideOnSearch.forEach(function (el) { el.hidden = q !== ''; });
    if (q !== '') collapsibles.forEach(function (d) { d.open = true; });
    if (empty) empty.hidden = q === '' || count > 0;
    if (status) status.textContent = q === '' ? '' : count + '件の食品が見つかりました';
    if (trackEvent && q !== '' && typeof window.gtag === 'function') {
      window.gtag('event', 'search', { search_term: input.value });
    }
  }

  input.addEventListener('input', function () {
    apply(false);
    clearTimeout(timer);
    timer = setTimeout(function () { apply(true); }, 1200);
  });
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      apply(true);
      try { history.replaceState(null, '', input.value ? '?q=' + encodeURIComponent(input.value) : location.pathname); } catch (err) {}
    });
  }

  // TOP の検索フォームから来たとき（/foods/?q=…）
  try {
    var q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; apply(true); }
  } catch (err) {}
})();
