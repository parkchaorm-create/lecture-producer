/* ================================================================
   lecture-producer Dashboard · Vanilla JS SPA
   Routes:
     #/                            Home · 강의 목록
     #/new                         신규 강의
     #/lecture/<slug>              강의 상세 (강 목록)
     #/lecture/<slug>/part/<N>     강별 상세
     #/system                      시스템 (lint · cost · brand)
   ================================================================ */

const app = document.getElementById('app');
const toastHost = document.getElementById('toastHost');
const statusBadge = document.getElementById('statusBadge');

let CONFIG = { allowExec: false, version: '?' };

/* ──── 공통 ──── */
async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  toastHost.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const k of kids.flat()) {
    if (k == null) continue;
    el.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
  }
  return el;
}

function setActive() {
  const route = (location.hash.replace(/^#/, '') || '/').split('/');
  const top = '/' + (route[1] || '');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === top || (top === '' && a.dataset.route === '/'));
  });
}

/* ──── Router ──── */
async function render() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const parts = raw.split('/').filter(Boolean);
  setActive();
  app.innerHTML = '';
  try {
    if (parts.length === 0) return renderHome();
    if (parts[0] === 'new') return renderNew();
    if (parts[0] === 'system') return renderSystem();
    if (parts[0] === 'lecture' && parts.length === 2) return renderLecture(parts[1]);
    if (parts[0] === 'lecture' && parts[2] === 'part' && parts[3]) return renderPart(parts[1], parts[3]);
    app.appendChild(h('p', { class: 'muted' }, '페이지를 찾을 수 없습니다.'));
  } catch (e) {
    toast('오류: ' + e.message, 'error');
    app.appendChild(h('pre', { class: 'log-pane' }, e.stack || e.message));
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('load', async () => {
  try {
    CONFIG = await api('/api/config');
    statusBadge.textContent = `v${CONFIG.version} · ${CONFIG.allowExec ? 'Exec ON' : 'Exec OFF'}`;
    statusBadge.classList.toggle('exec-on', CONFIG.allowExec);
  } catch {}
  render();
});

/* ════════════════════════════════════════════════════════════════
   🏠 HOME
   ════════════════════════════════════════════════════════════════ */
async function renderHome() {
  app.appendChild(h('h1', {}, '강의 목록'));
  app.appendChild(h('p', { class: 'muted' }, 'output/ 폴더에 있는 모든 강의를 표시합니다. 클릭해 상세로 이동.'));

  const lectures = await api('/api/lectures');
  const done = lectures.filter(l => l.progress >= 100).length;
  const avgProgress = lectures.length ? Math.round(lectures.reduce((s, l) => s + l.progress, 0) / lectures.length) : 0;
  const totalParts = lectures.reduce((s, l) => s + l.totalParts, 0);

  // Summary strip
  app.appendChild(h('div', { class: 'summary-strip' },
    stat('전체 강의', lectures.length),
    stat('완료', done),
    stat('평균 진행률', avgProgress + '%'),
    stat('누적 파트', totalParts)
  ));

  app.appendChild(h('div', { style: { display: 'flex', gap: '12px', marginBottom: '20px' } },
    h('a', { class: 'btn btn-gold', href: '#/new' }, '➕ 신규 강의 만들기'),
    h('a', { class: 'btn', href: '#/system' }, '⚙️ 시스템 상태')
  ));

  if (lectures.length === 0) {
    app.appendChild(h('div', { class: 'empty-state' },
      h('h3', {}, '아직 강의가 없습니다'),
      h('p', {}, '우측 상단 ➕ 신규 버튼으로 첫 강의를 시작하세요.')
    ));
    return;
  }

  const grid = h('div', { class: 'lecture-grid' });
  for (const l of lectures) grid.appendChild(lectureCard(l));
  app.appendChild(grid);
}

function stat(label, value) {
  return h('div', { class: 'stat-card' },
    h('div', { class: 'label' }, label),
    h('div', { class: 'value' }, String(value))
  );
}

function lectureCard(l) {
  return h('div', {
    class: 'lecture-card',
    onclick: () => location.hash = `#/lecture/${encodeURIComponent(l.slug)}`
  },
    h('div', { class: 'title' }, l.title),
    h('div', { class: 'meta' },
      h('span', {}, l.audience),
      h('span', {}, l.theme),
      h('span', {}, l.brand)
    ),
    h('div', { class: 'progress-bar' },
      h('div', { style: { width: l.progress + '%' } })
    ),
    h('div', { class: 'progress-info' },
      h('span', {}, `${l.progress}%`),
      h('span', {}, `S:${l.scriptCount} P:${l.pptCount} T:${l.tutCount} / ${l.totalParts}`)
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   ➕ NEW LECTURE
   ════════════════════════════════════════════════════════════════ */
async function renderNew() {
  app.appendChild(h('h1', {}, '신규 강의'));
  app.appendChild(h('p', { class: 'muted' }, '아래 폼을 채우고 ▶ 실행 버튼 · 비용이 자동 계산됩니다.'));

  const [brands, themes] = await Promise.all([api('/api/brands'), api('/api/themes')]);

  const slug = input('slug', 'my-course', '영문 kebab-case · 강의 식별자');
  const audience = select('audience', [
    ['public-lecture', '공공기관 강의 (80~100분)'],
    ['youtube-longform', '유튜브 롱폼 (8~15분)'],
    ['online-course', '온라인 강의 (25~40분)']
  ]);
  const brand = select('brand', brands.map(b => [b.slug, `${b.name} (${b.slug})`]));
  const theme = select('theme', themes.map(t => [t.slug, `${t.displayName}`]));
  const mode = select('mode', [
    ['mode-1-references', 'Mode 1 · 참고자료'],
    ['mode-2-outline', 'Mode 2 · 목차'],
    ['mode-3-fullscript', 'Mode 3 · 완성 스크립트'],
    ['mode-4-framework', 'Mode 4 · 프레임워크']
  ]);
  const parts = input('parts', '6', '예상 강 수 · 비용 추정용');

  const flagBatch = check('batch', '--batch 배치 할인 (50%)');
  const flagQuiz = check('with-quiz', '--with-quiz 퀴즈 슬라이드');
  const flagNotion = check('upload-notion', '--upload-notion 노션 업로드');
  const flagDeploy = check('deploy', '--deploy GitHub Pages');

  const costBox = h('pre', { class: 'cost-preview' }, '비용 계산 중...');
  const logPane = h('pre', { class: 'log-pane', id: 'execLog', style: { display: 'none' } });

  async function updateCost() {
    costBox.classList.add('loading');
    try {
      const r = await api(`/api/cost?parts=${parseInt(parts.value) || 6}&batch=${flagBatch.checked ? 1 : 0}`);
      costBox.textContent = r.stdout.split('\n').slice(-20).join('\n');
    } catch (e) { costBox.textContent = '비용 계산 실패: ' + e.message; }
    costBox.classList.remove('loading');
  }
  updateCost();
  parts.addEventListener('input', updateCost);
  flagBatch.addEventListener('change', updateCost);

  function buildArgs() {
    const args = ['-p', `/produce-lecture --slug ${slug.value}`
      + ` --brand ${brand.value}`
      + ` --theme ${theme.value}`
      + (flagBatch.checked ? ' --batch' : '')
      + (flagQuiz.checked ? ' --with-quiz' : '')
      + (flagNotion.checked ? ' --upload-notion' : '')
      + (flagDeploy.checked ? ' --deploy' : '')
    ];
    return args;
  }

  const runBtn = h('button', { class: 'btn btn-gold btn-big', onclick: onExec }, '▶ 실행');
  const copyBtn = h('button', { class: 'btn', onclick: () => {
    const cmd = 'claude ' + buildArgs().map(a => JSON.stringify(a)).join(' ');
    navigator.clipboard.writeText(cmd); toast('명령어 복사 완료');
  }}, '📋 명령어 복사');

  async function onExec() {
    if (!CONFIG.allowExec) {
      toast('Exec 모드 비활성 · .claude/local-config.json의 dashboard.allowExec을 true로 설정', 'error');
      return;
    }
    if (!slug.value.match(/^[a-z0-9-]+$/)) {
      toast('slug는 영문 kebab-case만 허용', 'error'); return;
    }
    runBtn.disabled = true; runBtn.textContent = '실행 중...';
    logPane.style.display = 'block';
    logPane.innerHTML = '';
    const args = buildArgs();
    const res = await fetch('/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'claude', args })
    });
    if (!res.ok) {
      const err = await res.json();
      toast('실행 실패: ' + err.error, 'error');
      runBtn.disabled = false; runBtn.textContent = '▶ 실행';
      return;
    }
    // SSE 파싱 (fetch streaming)
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    appendLog('meta', `$ claude ${args.join(' ')}`);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const events = buf.split('\n\n'); buf = events.pop() || '';
      for (const ev of events) {
        const m = ev.match(/^event:\s*(\S+)\s*\ndata:\s*(.+)$/s);
        if (!m) continue;
        const [, type, data] = m;
        const parsed = JSON.parse(data);
        if (type === 'stdout' || type === 'stderr') appendLog(type, parsed);
        else if (type === 'close') { appendLog('meta', `[종료 코드 ${parsed.code}]`); toast(parsed.code === 0 ? '완료' : `실패 (code ${parsed.code})`, parsed.code === 0 ? 'success' : 'error'); }
        else if (type === 'error') appendLog('stderr', '❌ ' + parsed.message);
      }
    }
    runBtn.disabled = false; runBtn.textContent = '▶ 실행';
  }

  function appendLog(kind, text) {
    const span = document.createElement('span');
    span.className = 'log-' + kind;
    span.textContent = (typeof text === 'string' ? text : JSON.stringify(text)) + '\n';
    logPane.appendChild(span);
    logPane.scrollTop = logPane.scrollHeight;
  }

  const form = h('div', {},
    h('div', { class: 'form-grid' },
      field('slug', slug),
      field('parts (예상 강 수)', parts),
      field('오디언스', audience),
      field('브랜드', brand),
      field('테마', theme),
      field('입력 모드', mode)
    ),
    h('h3', {}, '옵션 플래그'),
    h('div', { class: 'checkbox-row' }, flagBatch.parentElement, flagQuiz.parentElement, flagNotion.parentElement, flagDeploy.parentElement),
    h('h2', {}, '예상 비용'),
    costBox,
    h('div', { style: { marginTop: '24px', display: 'flex', gap: '12px' } }, runBtn, copyBtn),
    logPane
  );

  app.appendChild(form);

  if (!CONFIG.allowExec) {
    app.appendChild(h('div', { class: 'empty-state', style: { marginTop: '20px' } },
      h('p', {}, '⚠️ Exec 모드가 비활성 상태입니다. 실행 버튼이 작동하지 않습니다.'),
      h('p', { class: 'muted' }, '.claude/local-config.json에 다음을 추가하세요:'),
      h('pre', { class: 'cost-preview' }, '{\n  "dashboard": {\n    "allowExec": true\n  }\n}'),
      h('p', { class: 'muted' }, '또는 상단 📋 명령어 복사 버튼으로 복사해 터미널에서 직접 실행 가능.')
    ));
  }
}

function input(name, value, hint) {
  const el = h('input', { type: 'text', name, value });
  el._hint = hint;
  return el;
}
function select(name, options) {
  const el = h('select', { name });
  for (const [v, label] of options) el.appendChild(h('option', { value: v }, label));
  return el;
}
function check(name, label) {
  const wrap = h('label', {},
    h('input', { type: 'checkbox', name }),
    h('span', {}, label)
  );
  return wrap.querySelector('input');
}
function field(label, inputEl) {
  return h('div', { class: 'form-field' },
    h('label', {}, label),
    inputEl,
    inputEl._hint ? h('small', {}, inputEl._hint) : null
  );
}

/* ════════════════════════════════════════════════════════════════
   📚 LECTURE (강의 상세)
   ════════════════════════════════════════════════════════════════ */
async function renderLecture(slug) {
  const data = await api('/api/lecture/' + encodeURIComponent(slug));
  const { meta, parts, pptFiles, tutFiles } = data;

  app.appendChild(h('a', { href: '#/', class: 'muted', style: { fontSize: '13px' } }, '← 목록'));
  app.appendChild(h('h1', {}, meta.title || slug));
  app.appendChild(h('p', { class: 'meta muted' },
    `${meta.audience || '-'} · ${meta.theme || '-'} · ${meta.brand || '-'} · ${meta.total_parts || parts.length}강`));

  // 강 카드 그리드 · 파트 번호 기준
  const partNums = new Set();
  for (const p of parts) {
    const m = p.name.match(/part-(\d+)/);
    if (m) partNums.add(m[1]);
  }
  for (const f of pptFiles) {
    const m = f.match(/(\d+)/);
    if (m) partNums.add(m[1].padStart(2, '0'));
  }
  for (const f of tutFiles) {
    const m = f.match(/(\d+)/);
    if (m) partNums.add(m[1].padStart(2, '0'));
  }

  const sorted = [...partNums].sort();
  app.appendChild(h('h2', {}, '강 목록'));
  if (sorted.length === 0) {
    app.appendChild(h('div', { class: 'empty-state' }, h('p', {}, '아직 생성된 강이 없습니다.')));
  } else {
    const grid = h('div', { class: 'lecture-grid' });
    for (const n of sorted) {
      const hasScript = parts.some(p => p.name.includes(`part-${n}`));
      const hasPPT = pptFiles.some(f => f.includes(n));
      const hasTut = tutFiles.some(f => f.includes(n));
      grid.appendChild(h('div', {
        class: 'lecture-card',
        onclick: () => location.hash = `#/lecture/${encodeURIComponent(slug)}/part/${n}`
      },
        h('div', { class: 'title' }, `${n}강`),
        h('div', { class: 'meta' },
          h('span', { style: { background: hasScript ? 'rgba(106,154,106,0.2)' : 'rgba(120,120,120,0.1)', color: hasScript ? '#6a9a6a' : '#7a7666' } }, hasScript ? '📝 스크립트' : '스크립트'),
          h('span', { style: { background: hasPPT ? 'rgba(226,199,147,0.15)' : 'rgba(120,120,120,0.1)', color: hasPPT ? '#e2c793' : '#7a7666' } }, hasPPT ? '🎨 PPT' : 'PPT'),
          h('span', { style: { background: hasTut ? 'rgba(184,148,31,0.15)' : 'rgba(120,120,120,0.1)', color: hasTut ? '#b8941f' : '#7a7666' } }, hasTut ? '🛠 튜토' : '튜토')
        )
      ));
    }
    app.appendChild(grid);
  }

  // 전체 PPT 인덱스 링크
  app.appendChild(h('h2', {}, '전체 보기'));
  const links = h('div', { class: 'checkbox-row' });
  if (pptFiles.length > 0) links.appendChild(h('a', { class: 'btn', href: `/output/${encodeURIComponent(slug)}/ppt/index.html`, target: '_blank' }, '📑 PPT 목차 페이지'));
  links.appendChild(h('a', { class: 'btn', href: `/output/${encodeURIComponent(slug)}/_postmortem.md`, target: '_blank' }, '📋 포스트모템'));
  app.appendChild(links);
}

/* ════════════════════════════════════════════════════════════════
   📖 PART (강별 상세)
   ════════════════════════════════════════════════════════════════ */
async function renderPart(slug, num) {
  const data = await api('/api/lecture/' + encodeURIComponent(slug));
  const scriptFile = data.parts.find(p => p.name.includes(`part-${num}`));
  const pptFile = data.pptFiles.find(f => f.includes(num));
  const tutFile = data.tutFiles.find(f => f.includes(num));

  app.appendChild(h('a', { href: `#/lecture/${encodeURIComponent(slug)}`, class: 'muted', style: { fontSize: '13px' } }, '← 강의로'));
  app.appendChild(h('h1', {}, `${num}강 · ${data.meta.title || slug}`));

  const tabs = h('div', { class: 'tabs' });
  const body = h('div', {});
  const tabDefs = [
    ['ppt', '🎨 PPT', () => {
      if (!pptFile) return h('p', { class: 'muted' }, 'PPT 파일 없음');
      return h('div', { class: 'ppt-preview' },
        h('iframe', { src: `/output/${encodeURIComponent(slug)}/ppt/${encodeURIComponent(pptFile)}` })
      );
    }],
    ['script', '📝 스크립트', () => {
      if (!scriptFile) return h('p', { class: 'muted' }, '스크립트 파일 없음');
      return h('iframe', { src: `/output/${encodeURIComponent(slug)}/script_parts/${scriptFile.act}/${scriptFile.name}`, style: { width: '100%', height: '70vh', border: '1px solid var(--border)', background: 'var(--ink)' } });
    }],
    ['tutorial', '🛠 튜토리얼', () => {
      if (!tutFile) return h('p', { class: 'muted' }, '튜토리얼 없음 (DEMO 섹션 있는 파트만 생성됨)');
      return h('iframe', { src: `/output/${encodeURIComponent(slug)}/tutorials/${encodeURIComponent(tutFile)}`, style: { width: '100%', height: '70vh', border: '1px solid var(--border)', background: 'var(--ink)' } });
    }],
    ['feedback', '💬 피드백', () => {
      return h('iframe', { src: `/output/${encodeURIComponent(slug)}/_design/human-feedback-${num}.md`, style: { width: '100%', height: '50vh', border: '1px solid var(--border)', background: 'var(--ink)' } });
    }]
  ];
  let active = 'ppt';
  function switchTab(key) {
    active = key;
    [...tabs.children].forEach((c, i) => c.classList.toggle('active', tabDefs[i][0] === key));
    body.innerHTML = '';
    body.appendChild(tabDefs.find(t => t[0] === key)[2]());
  }
  tabDefs.forEach(([k, label], i) => {
    const t = h('div', { class: 'tab' + (i === 0 ? ' active' : ''), onclick: () => switchTab(k) }, label);
    tabs.appendChild(t);
  });
  app.appendChild(tabs);
  app.appendChild(body);
  switchTab('ppt');

  // 이전/다음 네비
  const partNums = [...new Set(data.parts.map(p => (p.name.match(/part-(\d+)/) || [])[1]).filter(Boolean))].sort();
  const idx = partNums.indexOf(num);
  const navRow = h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '32px' } },
    idx > 0 ? h('a', { class: 'btn', href: `#/lecture/${encodeURIComponent(slug)}/part/${partNums[idx - 1]}` }, `← ${partNums[idx - 1]}강`) : h('span'),
    idx < partNums.length - 1 ? h('a', { class: 'btn', href: `#/lecture/${encodeURIComponent(slug)}/part/${partNums[idx + 1]}` }, `${partNums[idx + 1]}강 →`) : h('span')
  );
  app.appendChild(navRow);
}

/* ════════════════════════════════════════════════════════════════
   ⚙️ SYSTEM
   ════════════════════════════════════════════════════════════════ */
async function renderSystem() {
  app.appendChild(h('h1', {}, '시스템 상태'));
  app.appendChild(h('p', { class: 'muted' }, '검증·측정 도구를 원클릭으로 실행.'));

  // 4 lint 실행
  app.appendChild(h('h2', {}, '🔍 Lint 4종'));
  const lintBtn = h('button', { class: 'btn btn-gold', onclick: runLint }, '▶ 전체 Lint 실행');
  const lintResults = h('div', { class: 'lint-grid', style: { marginTop: '16px' } });
  app.appendChild(lintBtn);
  app.appendChild(lintResults);

  async function runLint() {
    lintBtn.disabled = true; lintBtn.textContent = '실행 중...';
    lintResults.innerHTML = '';
    const r = await api('/api/lint');
    for (const [name, res] of Object.entries(r)) {
      lintResults.appendChild(h('div', { class: 'lint-card ' + (res.code === 0 ? 'pass' : 'fail') },
        h('div', { class: 'name' }, (res.code === 0 ? '✅' : '❌') + ' ' + name),
        h('pre', { class: 'output' }, res.output.split('\n').slice(-10).join('\n'))
      ));
    }
    lintBtn.disabled = false; lintBtn.textContent = '▶ 전체 Lint 실행';
  }

  // Smoke
  app.appendChild(h('h2', {}, '🧪 Smoke Test'));
  const smokeBtn = h('button', { class: 'btn btn-gold', onclick: runSmoke }, '▶ Smoke 실행');
  const smokeOut = h('pre', { class: 'log-pane', style: { height: '300px', display: 'none' } });
  app.appendChild(smokeBtn);
  app.appendChild(smokeOut);

  async function runSmoke() {
    smokeBtn.disabled = true;
    smokeOut.style.display = 'block';
    smokeOut.textContent = '실행 중...';
    const r = await api('/api/smoke');
    smokeOut.textContent = r.output;
    smokeBtn.disabled = false;
  }

  // Cost 계산기
  app.appendChild(h('h2', {}, '💰 비용 계산기'));
  const costParts = h('input', { type: 'number', value: '6', min: '1', max: '50' });
  const costBatch = h('input', { type: 'checkbox' });
  const costBtn = h('button', { class: 'btn', onclick: runCost }, '계산');
  const costOut = h('pre', { class: 'cost-preview' }, '파트 수 입력 후 계산 버튼');
  app.appendChild(h('div', { class: 'checkbox-row' },
    h('label', {}, '파트 수', costParts),
    h('label', {}, costBatch, h('span', {}, '--batch 할인'))
  ));
  app.appendChild(costBtn);
  app.appendChild(costOut);

  async function runCost() {
    costOut.textContent = '계산 중...';
    const r = await api(`/api/cost?parts=${costParts.value}&batch=${costBatch.checked ? 1 : 0}`);
    costOut.textContent = r.stdout.split('\n').slice(-22).join('\n');
  }

  // 브랜드·테마 목록
  app.appendChild(h('h2', {}, '🎨 브랜드 / 테마'));
  const [brands, themes] = await Promise.all([api('/api/brands'), api('/api/themes')]);
  app.appendChild(h('h3', {}, `브랜드 ${brands.length}개`));
  app.appendChild(h('ul', { class: 'file-list' },
    ...brands.map(b => h('li', {}, h('span', {}, `${b.name} · ${b.slug}`), h('span', { class: 'muted' }, b.type)))
  ));
  app.appendChild(h('h3', {}, `테마 ${themes.length}개`));
  app.appendChild(h('ul', { class: 'file-list' },
    ...themes.map(t => h('li', {}, h('span', {}, `${t.displayName} · ${t.slug}`), h('span', { class: 'muted' }, t.variant)))
  ));
}
