// PAUDEL KIRAN ポートフォリオ
// メニュー、テーマ切り替え、スクロール表示、作品カード（works-data.js から）、コードビューアー、メールのコピー
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  console.log('Kiran Paudel Portfolio Core System Launched Successfully.');

  // ---------- スマホのメニュー ----------
  const nav = $('#nav');
  const menuBtn = $('#menu-btn');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    const en = document.documentElement.dataset.lang === 'en';
    menuBtn.setAttribute('aria-label', open ? (en ? 'Close menu' : 'メニューを閉じる') : (en ? 'Open menu' : 'メニューを開く'));
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  // ---------- ライト／ダーク切り替え ----------
  const themeBtn = $('#theme-btn');
  const root = document.documentElement;
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  function showThemeIcon() {
    const dark = isDark();
    themeBtn.innerHTML = `<i class="fa-solid ${dark ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
    const en = root.dataset.lang === 'en';
    themeBtn.setAttribute('aria-label', dark ? (en ? 'Switch to light mode' : 'ライトモードに切り替え') : (en ? 'Switch to dark mode' : 'ダークモードに切り替え'));
  }
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('kiran-theme', root.dataset.theme); } catch (e) { /* 保存できなくても動く */ }
    showThemeIcon();
  });
  showThemeIcon();

  // ---------- 日本語 / English 切り替え ----------
  // 文章は <span lang="ja"> と <span lang="en"> の両方があり、CSS で片方を隠す
  const lang = () => (root.dataset.lang === 'en' ? 'en' : 'ja');
  const both = (ja, en) => `<span lang="ja">${ja}</span><span lang="en">${en}</span>`;
  function setLang(l) {
    if (l === 'en') root.dataset.lang = 'en'; else delete root.dataset.lang;
    root.lang = l;
    try { localStorage.setItem('kiran-lang', l); } catch (e) { /* 保存できなくても動く */ }
    $$('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
    showThemeIcon();
    setMenu(nav.classList.contains('open'));
  }
  $$('[data-set-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.setLang)));

  // ---------- スクロール：ヘッダーの背景、読んだ量のバー、上へ戻るボタン ----------
  const header = $('#header');
  const progress = $('#progress');
  const toTop = $('#to-top');
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 700);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 作品カード ----------
  const works = window.WORKS || [];
  const CATS = {
    app: both('アプリ', 'App'), web: both('Webアプリ', 'Web app'), db: both('データベース', 'Database'),
    oop: both('オブジェクト指向', 'OOP'), basic: both('Java基礎', 'Java basics'), algo: both('アルゴリズム', 'Algorithms'),
  };
  // 日本語と英語の文章（英語がなければ日本語）
  const txt = (w, key) => both(esc(w[key]), esc(w[key + '_en'] || w[key]));
  const tags = (w) => `<ul class="tags">${(w.tech || []).map((t, i) => {
    const en = (w.tech_en || [])[i];
    return `<li>${en && en !== t ? both(esc(t), esc(en)) : esc(t)}</li>`;
  }).join('')}</ul>`;
  const statsText = (w, l) => (l === 'en'
    ? `${w.fileCount} ${w.fileCount === 1 ? 'file' : 'files'}${w.lines ? ' · ' + w.lines + ' lines' : ''}`
    : `${w.fileCount}ファイル${w.lines ? ' · ' + w.lines + '行' : ''}`);
  const stats = (w) => both(statsText(w, 'ja'), statsText(w, 'en'));
  const previewUrl = (w) => 'works/' + w.id + '/' + w.preview;

  function visual(w) {
    const bar = (title) => `<div class="win-bar"><i></i><i></i><i></i><span>${esc(title)}</span></div>`;
    if (w.visual === 'radar') {
      return `<div class="visual radar" aria-hidden="true"><div class="radar-disc"><div class="radar-sweep"></div>
        <i class="radar-me"></i><i class="radar-enemy e1"></i><i class="radar-enemy e2"></i><i class="radar-enemy e3"></i><i class="radar-shot"></i></div>
        <span class="radar-label">${both('イメージ図：レーダーで敵を探して撃つ', 'Illustration: find enemies on radar, then fire')}</span></div>`;
    }
    if (w.visual === 'browser') {
      return `<a class="visual browser" href="${esc(previewUrl(w))}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        ${bar(w.preview)}<img src="${esc(w.thumb)}" alt="" width="960" height="600" loading="lazy"></a>`;
    }
    const lines = (w.screen || []).map(esc).join('\n');
    if (w.visual === 'code') {
      const html = lines.replace(/(&quot;.*?&quot;)/g, '<span class="s">$1</span>').replace(/\b(String|select|from|where|like|or)\b/g, '<span class="k">$1</span>');
      return `<div class="visual" aria-hidden="true">${bar('CustomerModel.java')}<pre class="screen">${html}</pre></div>`;
    }
    return `<div class="visual" aria-hidden="true">${bar('Console')}<pre class="screen"><span class="p">$</span> java ${esc(w.id)}\n${lines} <span class="caret"></span></pre></div>`;
  }

  function featureCard(w) {
    return `<article class="feature reveal" id="w-${esc(w.id)}" data-cat="${esc(w.cat)}">
      ${visual(w)}
      <div class="feature-body">
        <p class="meta"><span class="cat">${CATS[w.cat] || ''}</span>${w.team ? `<span class="team">${both('チーム制作', 'Team project')}</span>` : ''}<span>${stats(w)}</span></p>
        <h4>${txt(w, 'title')}<small>${esc(w.en || w.id)}</small></h4>
        <p>${txt(w, 'desc')}</p>
        ${tags(w)}
        <div class="actions">
          <button class="btn btn-primary btn-sm" type="button" data-code="${esc(w.id)}"><i class="fa-solid fa-code" aria-hidden="true"></i> ${both('コードを見る', 'View code')}</button>
          ${w.preview ? `<a class="btn btn-ghost btn-sm" href="${esc(previewUrl(w))}" target="_blank" rel="noopener">${both('生成されたページ', 'Generated page')} <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
        </div>
      </div>
    </article>`;
  }

  function workCard(w) {
    return `<article class="work" id="w-${esc(w.id)}" data-cat="${esc(w.cat)}">
      <p class="meta"><span class="cat">${CATS[w.cat] || ''}</span><span>${esc(w.id)}</span></p>
      <h4>${txt(w, 'title')}</h4>
      <p>${txt(w, 'desc')}</p>
      ${tags(w)}
      <div class="work-foot"><span>${stats(w)}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-code="${esc(w.id)}"><i class="fa-solid fa-code" aria-hidden="true"></i> ${both('コード', 'Code')}<span class="sr-only"> ${esc(w.title_en || w.title)}</span></button></div>
    </article>`;
  }

  const featured = works.filter((w) => w.featured);
  const others = works.filter((w) => !w.featured);
  $('#featured').innerHTML = featured.map(featureCard).join('');
  $('#work-list').innerHTML = others.map(workCard).join('');
  const totalLines = works.reduce((n, w) => n + (w.lines || 0), 0).toLocaleString();
  $$('.stat-projects').forEach((el) => { el.textContent = works.length; });
  $$('.stat-lines').forEach((el) => { el.textContent = totalLines; });
  $('#project-count').textContent = works.length;

  // ---------- その他のプロジェクトの絞り込み ----------
  const filters = $('#filters');
  const used = ['all'].concat(Object.keys(CATS).filter((c) => others.some((w) => w.cat === c)));
  filters.innerHTML = used.map((c) => {
    const n = c === 'all' ? others.length : others.filter((w) => w.cat === c).length;
    return `<button type="button" data-filter="${c}" aria-pressed="${c === 'all'}">${c === 'all' ? both('すべて', 'All') : CATS[c]} <span class="count">${n}</span></button>`;
  }).join('');
  function applyFilter(c) {
    filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === c)));
    let n = 0;
    $$('#work-list .work').forEach((el) => { el.hidden = c !== 'all' && el.dataset.cat !== c; if (!el.hidden) n++; });
    $('#filter-status').textContent = lang() === 'en' ? `Showing ${n} projects` : `${n}件のプロジェクトを表示しています`;
  }
  filters.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (b) applyFilter(b.dataset.filter); });

  // ---------- 画面に入ったら表示する／今いるセクションのメニューに印 ----------
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      entries.filter((en) => en.isIntersecting).forEach((en, i) => {
        en.target.style.setProperty('--d', (i * 0.08) + 's');
        en.target.classList.add('in');
        seen.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => seen.observe(el));

    const links = $$('.nav a');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.hash === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  // ---------- スキルの「使った作品」から作品へ移動 ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.used a');
    if (!a) return;
    const card = document.querySelector(a.hash);
    if (!card) return;
    if (card.hidden) applyFilter('all'); // 絞り込みで隠れていたら全部表示に戻す
    card.classList.add('in');
    card.classList.remove('flash');
    void card.offsetWidth; // アニメーションをもう一度動かすため
    card.classList.add('flash');
  });

  // ---------- コードビューアー ----------
  const viewer = $('#viewer');
  const filesEl = $('#viewer-files');
  const codeScroll = $('#code-scroll');
  let current = null;
  let currentText = '';

  function openCode(id, opener) {
    current = works.find((w) => w.id === id);
    if (!current) return;
    const en = lang() === 'en';
    $('#viewer-title').textContent = en ? (current.title_en || current.title) : current.title;
    $('#viewer-sub').textContent = `${current.id} · ${statsText(current, lang())}`;
    const prev = $('#viewer-preview');
    prev.hidden = !current.preview;
    if (current.preview) prev.href = previewUrl(current);
    filesEl.innerHTML = current.files.map((f) => `<li><button type="button" data-file="${esc(f.path)}">${esc(f.path)}</button></li>`).join('');
    // 最初に見せるのは main メソッドのある .java（なければ最初のファイル）
    const first = current.files.find((f) => /\.java$/.test(f.path) && /static void main/.test(f.text)) || current.files[0];
    if (first) showFile(first.path);
    viewer.returnFocus = opener;
    viewer.showModal();
  }

  function showFile(path) {
    const file = current.files.find((f) => f.path === path);
    if (!file) return;
    filesEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.file === path)));
    $('#code-name').textContent = path;
    currentText = file.text;
    const ext = (path.match(/\.([a-z]+)$/i) || ['', ''])[1].toLowerCase();
    const lang = { java: 'java', jsp: 'xml', html: 'xml', css: 'css', sql: 'sql', csv: 'plaintext' }[ext] || 'plaintext';
    let body = esc(file.text);
    if (window.hljs && hljs.getLanguage(lang)) body = hljs.highlight(file.text, { language: lang, ignoreIllegals: true }).value;
    const nums = Array.from({ length: file.text.split('\n').length }, (_, i) => i + 1).join('\n');
    codeScroll.innerHTML = `<pre class="code"><span class="nums" aria-hidden="true">${nums}</span><code>${body}</code></pre>`;
    codeScroll.scrollTop = 0;
    codeScroll.scrollLeft = 0;
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-code]');
    if (b) openCode(b.dataset.code, b);
  });
  filesEl.addEventListener('click', (e) => { const b = e.target.closest('[data-file]'); if (b) showFile(b.dataset.file); });
  $('#viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); }); // 外側をクリックで閉じる
  viewer.addEventListener('close', () => { if (viewer.returnFocus) viewer.returnFocus.focus(); });

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
  }
  // ボタンの文字を少しの間「コピーしました / Copied!」にする
  function flashLabel(btn) {
    const label = btn.querySelector('.copy-label');
    label.innerHTML = both('コピーしました', 'Copied!');
    setTimeout(() => { label.innerHTML = both('コピー', 'Copy'); }, 1800);
  }

  $('#code-copy').addEventListener('click', async (e) => {
    await copyText(currentText);
    flashLabel(e.currentTarget);
  });

  // ---------- メールアドレスをコピー ----------
  const copyBtn = $('#copy-btn');
  copyBtn.addEventListener('click', async () => {
    await copyText(copyBtn.dataset.email);
    flashLabel(copyBtn);
    $('#copy-status').textContent = lang() === 'en' ? 'Email address copied' : 'メールアドレスをコピーしました';
  });

  setLang(lang());

  $('#year').textContent = new Date().getFullYear();
})();
