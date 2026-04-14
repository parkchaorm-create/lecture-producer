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
    if (parts[0] === 'new' || parts[0] === 'my') return renderMyLectures();
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
    statusBadge.innerHTML = '';
    statusBadge.appendChild(h('span', { class: 'status-dot' }));
    statusBadge.appendChild(h('span', { class: 'status-text' }, `v${CONFIG.version} · ${CONFIG.allowExec ? 'EXEC ON' : 'EXEC OFF'}`));
    statusBadge.classList.toggle('exec-on', CONFIG.allowExec);
  } catch {
    statusBadge.innerHTML = '';
    statusBadge.appendChild(h('span', { class: 'status-dot' }));
    statusBadge.appendChild(h('span', { class: 'status-text' }, 'offline'));
  }
  render();
});

/* ════════════════════════════════════════════════════════════════
   🏠 HOME · v1.4 · 3단계 마법사 + 강의 목록 하이브리드
   ════════════════════════════════════════════════════════════════ */

const WIZARD_KEY = 'lp-wizard-draft';
function loadWizardDraft() {
  try { return JSON.parse(sessionStorage.getItem(WIZARD_KEY) || '{}'); } catch { return {}; }
}
function saveWizardDraft(d) { sessionStorage.setItem(WIZARD_KEY, JSON.stringify(d)); }

async function renderHome() {
  const [brands, themes] = await Promise.all([
    api('/api/brands'), api('/api/themes')
  ]);

  // ─── Hero (간소화) ───
  app.appendChild(h('section', { class: 'hero reveal' },
    h('div', { class: 'hero-kicker' }, '● LECTURE PRODUCER · v' + CONFIG.version),
    h('h1', { class: 'hero-title' },
      '풀코스 강의를 ',
      h('span', { class: 'accent' }, '한 번에'),
      ' 만들기'
    ),
    h('p', { class: 'hero-subtitle' },
      '4단계만 채우면 스크립트·PPT·실습 자료가 자동으로 만들어져요. 중간 3번 확인 후 통과시키면 끝.'
    )
  ));

  // ─── Wizard ───
  app.appendChild(renderWizard(brands, themes));
}

/* ──── Wizard 블록 ──── */
function renderWizard(brands, themes) {
  const state = Object.assign({
    contents: [],        // [{ name, size, saved? } | { url, note? }]
    brandMode: null,     // 'existing' | 'upload' | 'skip'
    brandSlug: '',       // existing slug or new slug
    brandFiles: [],
    theme: themes[0]?.slug || 'pajamaboss',
    slug: '',
    audience: 'online-course'
  }, loadWizardDraft());

  const block = h('section', { class: 'wizard-block reveal', 'aria-label': '강의 생성 마법사' });
  block.appendChild(h('div', { class: 'wizard-intro' }, '● 마법사 · 3단계를 완료하면 아래 버튼이 활성화됩니다'));

  // ─── Step 1 ───
  const step1 = h('div', { class: 'wizard-step', role: 'group', 'aria-labelledby': 'wz-step1-title' });
  const step1List = h('ul', { class: 'wizard-item-list', 'aria-label': '등록된 콘텐츠' });
  function renderStep1List() {
    step1List.innerHTML = '';
    state.contents.forEach((c, i) => {
      step1List.appendChild(h('li', {},
        h('span', {}, c.url ? '🔗 ' + c.url : '📄 ' + c.name),
        h('span', { class: 'item-meta' }, c.size ? (c.size / 1024).toFixed(1) + ' KB' : (c.note || 'URL')),
        h('button', { type: 'button', 'aria-label': '삭제', onclick: () => { state.contents.splice(i, 1); persist(); renderStep1List(); updateSteps(); } }, '✕')
      ));
    });
  }
  const fileInputId = 'wz-file-input';
  const dropzone = h('label', { class: 'dropzone', for: fileInputId },
    h('div', {}, '📁 파일을 드래그하거나 클릭해서 선택'),
    h('div', { class: 'dropzone-hint' }, 'PDF · DOCX · MD · 이미지 등 (최대 50MB)'),
    h('input', { type: 'file', id: fileInputId, multiple: '', 'aria-label': '콘텐츠 파일 업로드' })
  );
  const fileInput = dropzone.querySelector('input');
  async function uploadFiles(fileList) {
    if (!fileList.length) return;
    const fd = new FormData();
    for (const f of fileList) fd.append('file', f);
    try {
      const r = await fetch('/api/upload?mode=mode-1-references', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || '업로드 실패');
      for (const f of data.files) state.contents.push({ name: f.name, size: f.size, saved: f.saved });
      toast(`${data.files.length}개 파일 업로드`, 'success');
      persist(); renderStep1List(); updateSteps();
    } catch (e) { toast('업로드 실패: ' + e.message, 'error'); }
  }
  fileInput.addEventListener('change', e => uploadFiles(Array.from(e.target.files)));
  ['dragenter','dragover'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', e => uploadFiles(Array.from(e.dataTransfer.files || [])));

  const urlInput = h('input', { type: 'url', placeholder: 'https://example.com/article', 'aria-label': '참고 URL' });
  const urlBtn = h('button', { class: 'btn', type: 'button', onclick: async () => {
    const url = urlInput.value.trim();
    if (!/^https?:\/\//.test(url)) { toast('http/https URL만 허용', 'error'); return; }
    try {
      const r = await fetch('/api/refs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'mode-1-references', url }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || '등록 실패');
      state.contents.push({ url, note: 'URL' });
      urlInput.value = '';
      toast('URL 등록', 'success');
      persist(); renderStep1List(); updateSteps();
    } catch (e) { toast('URL 등록 실패: ' + e.message, 'error'); }
  } }, '+ 추가');

  step1.appendChild(h('div', { class: 'wizard-step-head' },
    h('span', { class: 'wizard-step-num' }, '1'),
    h('span', { class: 'wizard-step-title', id: 'wz-step1-title' }, '강의에 담을 자료 넣기'),
    h('span', { class: 'wizard-step-badge pending', id: 'wz-step1-badge' }, '필수')
  ));
  step1.appendChild(h('p', { class: 'hero-subtitle', style: { fontSize: '13px', marginBottom: '14px' } }, '📂 강의로 만들고 싶은 내용이 담긴 파일이나 웹사이트 주소를 넣어주세요. PDF·한글·워드·이미지·메모(txt/md) 모두 됩니다. 개수 제한 없음.'));
  step1.appendChild(dropzone);
  step1.appendChild(h('div', { class: 'url-row' }, urlInput, urlBtn));
  step1.appendChild(step1List);
  renderStep1List();

  // ─── Step 2 ───
  const step2 = h('div', { class: 'wizard-step', role: 'group', 'aria-labelledby': 'wz-step2-title' });
  const brandChoice = h('div', { class: 'wizard-brand-choice' });
  const brandBody = h('div', {});
  function setBrandMode(mode) {
    state.brandMode = mode;
    brandChoice.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
    brandBody.innerHTML = '';
    if (mode === 'existing') {
      const sel = h('select', { 'aria-label': '기존 브랜드 선택' });
      sel.appendChild(h('option', { value: '' }, '— 선택 —'));
      for (const b of brands) sel.appendChild(h('option', { value: b.slug }, `${b.name} (${b.slug})`));
      sel.value = state.brandSlug || '';
      sel.addEventListener('change', () => { state.brandSlug = sel.value; persist(); updateSteps(); });
      brandBody.appendChild(sel);
    } else if (mode === 'upload') {
      const slugIn = h('input', { type: 'text', placeholder: '브랜드 식별자 (영문, 예: my-studio)', value: state.brandSlug || '', 'aria-label': '신규 브랜드 식별자' });
      slugIn.addEventListener('input', () => { state.brandSlug = slugIn.value.trim(); persist(); updateSteps(); });
      const fid = 'wz-brand-file';
      const drop2 = h('label', { class: 'dropzone', for: fid, style: { marginTop: '10px' } },
        h('div', {}, '🎨 로고·보이스 가이드·색상 팔레트 업로드'),
        h('div', { class: 'dropzone-hint' }, 'SVG·PNG·MD·YAML 등'),
        h('input', { type: 'file', id: fid, multiple: '', 'aria-label': '브랜드 에셋 파일' })
      );
      const bList = h('ul', { class: 'wizard-item-list', 'aria-label': '브랜드 에셋 목록' });
      function refreshBList() {
        bList.innerHTML = '';
        state.brandFiles.forEach((f, i) => bList.appendChild(h('li', {},
          h('span', {}, '📄 ' + f.name),
          h('span', { class: 'item-meta' }, (f.size / 1024).toFixed(1) + ' KB'),
          h('button', { type: 'button', 'aria-label': '삭제', onclick: () => { state.brandFiles.splice(i, 1); persist(); refreshBList(); updateSteps(); } }, '✕')
        )));
      }
      drop2.querySelector('input').addEventListener('change', async e => {
        if (!state.brandSlug || !/^[a-z0-9-]+$/.test(state.brandSlug)) { toast('브랜드 식별자부터 입력 (영문 소문자·숫자·하이픈)', 'error'); return; }
        const fd = new FormData();
        for (const f of e.target.files) fd.append('file', f);
        try {
          const r = await fetch('/api/brand-upload?slug=' + encodeURIComponent(state.brandSlug), { method: 'POST', body: fd });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || '업로드 실패');
          for (const f of data.files) state.brandFiles.push(f);
          toast(`${data.files.length}개 에셋 업로드`, 'success');
          persist(); refreshBList(); updateSteps();
        } catch (err) { toast('업로드 실패: ' + err.message, 'error'); }
      });
      brandBody.appendChild(slugIn);
      brandBody.appendChild(drop2);
      brandBody.appendChild(bList);
      refreshBList();
    } else if (mode === 'skip') {
      state.brandSlug = '_default';
      state.brandFiles = [];
      brandBody.appendChild(h('p', { class: 'hero-subtitle', style: { fontSize: '13px', margin: 0 } }, '기본 브랜드(_default)로 진행합니다. 나중에 `init-brand` 명령어로 추가할 수 있어요.'));
    }
    persist(); updateSteps();
  }
  for (const [mode, label] of [['existing','📚 이미 만든 브랜드 쓰기'], ['upload','📤 새 브랜드 파일 올리기'], ['skip','⏭ 건너뛰기 (기본 스타일)']]) {
    brandChoice.appendChild(h('button', { type: 'button', 'data-mode': mode, onclick: () => setBrandMode(mode) }, label));
  }
  step2.appendChild(h('div', { class: 'wizard-step-head' },
    h('span', { class: 'wizard-step-num' }, '2'),
    h('span', { class: 'wizard-step-title', id: 'wz-step2-title' }, '내 브랜드 넣기 (건너뛰기 가능)'),
    h('span', { class: 'wizard-step-badge pending', id: 'wz-step2-badge' }, '선택')
  ));
  step2.appendChild(h('p', { class: 'hero-subtitle', style: { fontSize: '13px', marginBottom: '14px' } }, '🎨 로고 이미지, 말투 예시 글, 색상 가이드 등이 있으면 넣어주세요. 없으면 "건너뛰기"를 눌러도 괜찮아요 — 기본 스타일로 만들어집니다.'));
  step2.appendChild(brandChoice);
  step2.appendChild(brandBody);
  if (state.brandMode) setBrandMode(state.brandMode); // restore

  // ─── Step 3 ───
  const step3 = h('div', { class: 'wizard-step', role: 'group', 'aria-labelledby': 'wz-step3-title' });
  const themeGrid = h('div', { class: 'theme-card-grid', role: 'radiogroup', 'aria-label': '테마 선택' });
  function renderThemeGrid() {
    themeGrid.innerHTML = '';
    for (const t of themes) {
      const selected = state.theme === t.slug;
      const card = h('div', {
        class: 'theme-card',
        role: 'radio',
        'aria-checked': selected ? 'true' : 'false',
        tabindex: selected ? '0' : '-1',
        onclick: () => { state.theme = t.slug; persist(); renderThemeGrid(); updateSteps(); },
        onkeydown: (e) => {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); state.theme = t.slug; persist(); renderThemeGrid(); updateSteps(); }
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveTheme(1); }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveTheme(-1); }
        }
      },
        t.preview
          ? h('img', { src: t.preview, alt: t.displayName + ' 테마 미리보기', loading: 'lazy' })
          : h('div', { class: 'theme-card-noimg' }, t.slug),
        h('div', { class: 'theme-card-body' },
          h('div', { class: 'theme-card-name' }, t.displayName),
          h('div', { class: 'theme-card-meta' },
            h('span', { class: 'theme-variant v-' + t.variant }, t.variant),
            h('span', { class: 'muted' }, t.slug)
          )
        )
      );
      themeGrid.appendChild(card);
    }
  }
  function moveTheme(delta) {
    const i = themes.findIndex(t => t.slug === state.theme);
    const n = (i + delta + themes.length) % themes.length;
    state.theme = themes[n].slug;
    persist(); renderThemeGrid(); updateSteps();
    themeGrid.children[n].focus();
  }
  renderThemeGrid();
  step3.appendChild(h('div', { class: 'wizard-step-head' },
    h('span', { class: 'wizard-step-num' }, '3'),
    h('span', { class: 'wizard-step-title', id: 'wz-step3-title' }, '슬라이드 디자인 고르기'),
    h('span', { class: 'wizard-step-badge pending', id: 'wz-step3-badge' }, '필수')
  ));
  step3.appendChild(h('p', { class: 'hero-subtitle', style: { fontSize: '13px', marginBottom: '14px' } }, '🎨 원하는 분위기의 디자인을 눌러주세요. 이게 강의 PPT 스타일이 됩니다.'));
  step3.appendChild(themeGrid);

  // ─── Meta · 강의 이름 · 몇 강 · 누구용 ───
  if (!state.parts) state.parts = '6';
  const slugId = 'wz-slug';
  const audId = 'wz-audience';
  const partsId = 'wz-parts';
  const slugField = h('div', { class: 'form-field' },
    h('label', { for: slugId }, '강의 이름 (영문)',
      h('span', { class: 'tip-trigger', tabindex: '0', 'aria-label': '설명', 'data-tip': '파일 폴더명으로 쓰입니다. 영문 소문자·숫자·하이픈만.' }, '?')
    ),
    h('input', { id: slugId, type: 'text', placeholder: '예: my-course', value: state.slug, 'aria-describedby': 'wz-slug-hint' }),
    h('small', { id: 'wz-slug-hint' }, '예시: my-course · coffee-101 · brand-story')
  );
  const partsField = h('div', { class: 'form-field' },
    h('label', { for: partsId }, '몇 강으로 만들까요?'),
    h('input', { id: partsId, type: 'number', min: '1', max: '30', value: state.parts }),
    h('small', {}, '보통 6~12강. 아래 비용에 바로 반영됩니다.')
  );
  const audField = h('div', { class: 'form-field' },
    h('label', { for: audId }, '누구를 위한 강의인가요?'),
    h('select', { id: audId },
      h('option', { value: 'online-course' }, '🎓 온라인 강의 (한 강 25~40분)'),
      h('option', { value: 'youtube-longform' }, '📺 유튜브 롱폼 (한 강 8~15분)'),
      h('option', { value: 'public-lecture' }, '🏛 공공기관 강의 (한 강 80~100분)')
    )
  );
  const slugEl = slugField.querySelector('input');
  const audEl = audField.querySelector('select');
  const partsEl = partsField.querySelector('input');
  audEl.value = state.audience;
  slugEl.addEventListener('input', () => { state.slug = slugEl.value.trim(); persist(); updateSteps(); });
  audEl.addEventListener('change', () => { state.audience = audEl.value; persist(); updateSteps(); });
  partsEl.addEventListener('input', () => { state.parts = partsEl.value; persist(); updateCost(); });

  const metaRow = h('div', { class: 'wizard-step' },
    h('div', { class: 'wizard-step-head' },
      h('span', { class: 'wizard-step-num' }, '4'),
      h('span', { class: 'wizard-step-title' }, '강의 기본 정보'),
      h('span', { class: 'wizard-step-badge pending', id: 'wz-step4-badge' }, '필수')
    ),
    h('p', { class: 'hero-subtitle', style: { fontSize: '13px', marginBottom: '14px' } }, '📝 강의의 기본 정보를 알려주세요.'),
    h('div', { class: 'wizard-meta-row', style: { gridTemplateColumns: '1fr 1fr 1fr' } }, slugField, partsField, audField)
  );

  // ─── 고급 옵션 (접힘) ───
  state.flags = state.flags || {};
  const mkFlag = (key, label, desc) => {
    const cb = h('input', { type: 'checkbox' });
    cb.checked = !!state.flags[key];
    cb.addEventListener('change', () => { state.flags[key] = cb.checked; persist(); if (key === 'batch') updateCost(); });
    return h('label', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px' } },
      cb, h('span', {}, h('strong', {}, label), h('br'), h('span', { class: 'muted', style: { fontSize: '11px' } }, desc))
    );
  };
  const advDetails = h('details', { style: { marginTop: '12px' } },
    h('summary', { style: { cursor: 'pointer', padding: '10px 14px', fontSize: '13px', color: 'var(--muted)' } }, '⚙️ 고급 옵션 (몰라도 괜찮아요)'),
    h('div', { class: 'checkbox-row', style: { flexDirection: 'column', marginTop: '10px' } },
      mkFlag('batch', '💰 배치 할인 쓰기 (50% 저렴 · 속도 느림)', '결과는 같고 비용만 절반. 덜 급하면 켜세요.'),
      mkFlag('quiz', '📝 각 강 끝에 퀴즈 넣기', '수강생 체크용 퀴즈 슬라이드 자동 추가.'),
      mkFlag('notion', '📘 실습 튜토리얼을 노션에 올리기', '노션 토큰이 설정되어 있어야 작동.'),
      mkFlag('deploy', '🌐 완성본을 인터넷에 공개 (GitHub Pages)', '깃허브 계정이 있어야 작동.')
    )
  );

  // ─── 비용 프리뷰 ───
  const costBox = h('pre', { class: 'cost-preview', 'aria-label': '예상 비용' }, '계산 중...');
  async function updateCost() {
    costBox.classList.add('loading');
    try {
      const r = await api(`/api/cost?parts=${parseInt(state.parts) || 6}&batch=${state.flags.batch ? 1 : 0}`);
      costBox.textContent = r.stdout.split('\n').slice(-18).join('\n');
    } catch (e) { costBox.textContent = '비용 계산 실패: ' + e.message; }
    costBox.classList.remove('loading');
  }
  updateCost();

  const costBlock = h('div', { class: 'wizard-step' },
    h('div', { class: 'wizard-step-head' },
      h('span', { class: 'wizard-step-num' }, '💰'),
      h('span', { class: 'wizard-step-title' }, '예상 비용')
    ),
    h('p', { class: 'hero-subtitle', style: { fontSize: '13px', marginBottom: '10px' } }, '💡 실제 강의 제작 시 Claude API에 드는 비용이에요. 위 옵션을 바꾸면 실시간으로 계산됩니다.'),
    costBox,
    advDetails
  );

  // ─── 진행률 바 (실행 시) ───
  const progressWrap = h('div', { class: 'exec-progress', style: { display: 'none' } },
    h('div', { class: 'exec-progress-bar' }, h('div', { class: 'exec-progress-fill' })),
    h('div', { class: 'exec-progress-label' }, '준비 중...')
  );
  const logPane = h('pre', { class: 'log-pane', id: 'execLog', 'aria-live': 'polite', 'aria-label': '실행 로그', style: { display: 'none', height: '280px' } });

  // ─── CTA · 실행 버튼 (직접 실행) ───
  const ctaBtn = h('button', {
    class: 'btn btn-gold btn-big wizard-cta',
    type: 'button',
    disabled: '',
    'aria-label': '강의 만들기 시작',
    onclick: () => runProduce()
  }, '🚀 강의 만들기 시작');
  const ctaHint = h('p', { class: 'hero-subtitle', style: { fontSize: '12px', textAlign: 'right', marginTop: '8px' } }, '위 필수 항목 3개를 모두 채우면 이 버튼이 켜집니다.');
  const ctaRow = h('div', {},
    h('div', { class: 'wizard-cta-row' }, ctaBtn),
    ctaHint
  );

  // ─── 실행 로직 ───
  async function runProduce() {
    if (!CONFIG.allowExec) {
      const msg = 'Exec 모드가 꺼져 있어요. 프로젝트 루트의 .claude/local-config.json 파일에 {"dashboard":{"allowExec":true}} 를 추가한 뒤 서버를 다시 시작해주세요.';
      toast(msg, 'error');
      alert(msg);
      return;
    }
    ctaBtn.disabled = true;
    ctaBtn.textContent = '⏳ 만드는 중...';
    progressWrap.style.display = 'block';
    logPane.style.display = 'block';
    logPane.innerHTML = '';
    const args = buildExecArgs();
    appendLog('meta', '▶ 강의 만들기 시작');
    appendLog('meta', `명령어: claude ${args.join(' ')}`);
    try {
      const res = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'claude', args })
      });
      if (!res.ok) {
        const err = await res.json();
        toast('실행 실패: ' + err.error, 'error');
        ctaBtn.disabled = false; ctaBtn.textContent = '🚀 강의 만들기 시작';
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let lineCount = 0;
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
          if (type === 'stdout' || type === 'stderr') {
            appendLog(type, parsed);
            lineCount++;
            updateProgressFromLog(parsed, lineCount);
          } else if (type === 'close') {
            appendLog('meta', `[종료 코드 ${parsed.code}]`);
            setProgress(100, parsed.code === 0 ? '✅ 완료!' : `❌ 실패 (코드 ${parsed.code})`);
            toast(parsed.code === 0 ? '완료' : `실패 (code ${parsed.code})`, parsed.code === 0 ? 'success' : 'error');
          } else if (type === 'error') {
            appendLog('stderr', '❌ ' + parsed.message);
          }
        }
      }
    } catch (e) {
      appendLog('stderr', '❌ ' + e.message);
    }
    ctaBtn.disabled = false;
    ctaBtn.textContent = '🚀 다시 만들기';
  }
  function appendLog(kind, text) {
    const span = document.createElement('span');
    span.className = 'log-' + kind;
    span.textContent = (typeof text === 'string' ? text : JSON.stringify(text)) + '\n';
    logPane.appendChild(span);
    logPane.scrollTop = logPane.scrollHeight;
  }
  function setProgress(pct, label) {
    progressWrap.querySelector('.exec-progress-fill').style.width = pct + '%';
    progressWrap.querySelector('.exec-progress-label').textContent = label;
  }
  function updateProgressFromLog(text, count) {
    const t = (typeof text === 'string' ? text : '').toLowerCase();
    if (t.includes('stage 1') || t.includes('입력 감지')) setProgress(10, '📥 자료 분석 중...');
    else if (t.includes('6인') || t.includes('회의')) setProgress(25, '🧠 6인 전문가 회의 중...');
    else if (t.includes('1강') && t.includes('스크립트')) setProgress(40, '📝 1강 스크립트 작성 중...');
    else if (t.includes('ppt') || t.includes('렌더')) setProgress(65, '🎨 PPT 만드는 중...');
    else if (t.includes('튜토리얼') || t.includes('실습')) setProgress(85, '🛠 실습 자료 만드는 중...');
    else if (t.includes('완료') || t.includes('done')) setProgress(95, '🎁 마무리 중...');
    else {
      const pct = Math.min(5 + count * 0.5, 90);
      setProgress(pct, '⚙️ 작업 중... (줄 ' + count + ')');
    }
  }
  function buildExecArgs() {
    const brandArg = state.brandSlug || '_default';
    return ['-p', `/produce-lecture --slug ${state.slug}`
      + ` --brand ${brandArg}`
      + ` --theme ${state.theme}`
      + ` --audience ${state.audience}`
      + ` --parts ${state.parts}`
      + (state.flags.batch ? ' --batch' : '')
      + (state.flags.quiz ? ' --with-quiz' : '')
      + (state.flags.notion ? ' --upload-notion' : '')
      + (state.flags.deploy ? ' --deploy' : '')
    ];
  }

  block.appendChild(step1);
  block.appendChild(step2);
  block.appendChild(step3);
  block.appendChild(metaRow);
  block.appendChild(costBlock);
  block.appendChild(ctaRow);
  block.appendChild(progressWrap);
  block.appendChild(logPane);

  function persist() { saveWizardDraft(state); }
  function updateSteps() {
    // Step 1
    const s1Done = state.contents.length > 0;
    step1.classList.toggle('done', s1Done);
    step1.classList.toggle('active', !s1Done);
    const b1 = step1.querySelector('#wz-step1-badge');
    b1.textContent = s1Done ? `✓ ${state.contents.length}개` : '대기';
    b1.classList.toggle('pending', !s1Done);

    // Step 2 (optional)
    const s2Done = state.brandMode === 'skip' || (state.brandMode === 'existing' && state.brandSlug)
      || (state.brandMode === 'upload' && state.brandSlug && state.brandFiles.length > 0);
    step2.classList.toggle('done', s2Done);
    step2.classList.toggle('active', s1Done && !s2Done);
    const b2 = step2.querySelector('#wz-step2-badge');
    b2.textContent = s2Done ? (state.brandMode === 'skip' ? '✓ 기본' : '✓ ' + state.brandSlug) : '선택사항';
    b2.classList.toggle('pending', !s2Done);

    // Step 3
    const s3Done = !!state.theme;
    step3.classList.toggle('done', s3Done);
    step3.classList.toggle('active', s1Done && !s3Done);
    const b3 = step3.querySelector('#wz-step3-badge');
    b3.textContent = s3Done ? '✓ ' + state.theme : '대기';
    b3.classList.toggle('pending', !s3Done);

    // CTA 활성 조건: step1 + step3 + slug + audience (step2는 선택)
    const slugOk = /^[a-z0-9-]+$/.test(state.slug);
    const ok = s1Done && s3Done && slugOk && state.audience;
    ctaBtn.disabled = !ok;
    ctaBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }
  updateSteps();

  return block;
}

function stat(label, value, unit) {
  return h('div', { class: 'stat-card' },
    h('div', { class: 'label' }, label),
    h('div', { class: 'value' },
      String(value),
      unit ? h('span', { class: 'unit' }, unit) : null
    )
  );
}

function lectureCard(l) {
  return h('div', {
    class: 'lecture-card',
    onclick: () => location.hash = `#/lecture/${encodeURIComponent(l.slug)}`
  },
    h('div', { class: 'card-title' }, l.title),
    h('div', { class: 'meta-row' },
      h('span', { class: 'meta-chip' }, l.audience),
      h('span', { class: 'meta-chip secondary' }, l.theme),
      h('span', { class: 'meta-chip secondary' }, l.brand)
    ),
    h('div', { class: 'progress-track' },
      h('div', { class: 'progress-fill', style: { width: l.progress + '%' } })
    ),
    h('div', { class: 'progress-info' },
      h('span', { class: 'pct' }, l.progress + '%'),
      h('span', {}, `script ${l.scriptCount} · ppt ${l.pptCount} · tut ${l.tutCount} / ${l.totalParts}`)
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   📚 MY LECTURES · v1.4 · 진행률 + 프리뷰 목록
   ════════════════════════════════════════════════════════════════ */
async function renderMyLectures() {
  const lectures = await api('/api/lectures');
  const done = lectures.filter(l => l.progress >= 100).length;
  const avgProgress = lectures.length ? Math.round(lectures.reduce((s, l) => s + l.progress, 0) / lectures.length) : 0;
  const totalParts = lectures.reduce((s, l) => s + l.totalParts, 0);

  app.appendChild(h('section', { class: 'hero reveal' },
    h('div', { class: 'hero-kicker' }, '● MY LECTURES'),
    h('h1', { class: 'hero-title' }, '내 ', h('span', { class: 'accent' }, '강의')),
    h('p', { class: 'hero-subtitle' }, '지금까지 만든 강의들입니다. 카드를 누르면 스크립트·PPT·실습 자료를 바로 볼 수 있어요.')
  ));

  app.appendChild(h('div', { class: 'summary-strip' },
    stat('전체 강의', lectures.length, '편'),
    stat('완료', done, '편'),
    stat('평균 진행률', avgProgress, '%'),
    stat('누적 파트', totalParts, '개')
  ));

  if (lectures.length === 0) {
    app.appendChild(h('section', { class: 'empty-state reveal' },
      h('h3', {}, '아직 만든 강의가 없어요'),
      h('p', {}, '✨ 새 강의 만들기 메뉴에서 첫 번째 강의를 시작해보세요.'),
      h('a', { class: 'btn btn-gold', href: '#/' }, '✨ 새 강의 만들기')
    ));
    return;
  }

  app.appendChild(h('h2', {}, '강의 목록'));
  const grid = h('div', { class: 'my-lecture-grid' });
  lectures.forEach((l, i) => {
    const card = myLectureCard(l);
    card.classList.add('reveal');
    card.style.animationDelay = (i * 0.05) + 's';
    grid.appendChild(card);
  });
  app.appendChild(grid);
}

function myLectureCard(l) {
  const pct = l.progress;
  const statusLabel = pct >= 100 ? '✅ 완료' : (pct > 0 ? '⏳ 진행 중' : '📋 준비');
  const statusColor = pct >= 100 ? 'var(--success)' : (pct > 0 ? 'var(--gold)' : 'var(--muted)');
  return h('div', {
    class: 'my-lecture-card',
    tabindex: '0',
    role: 'button',
    'aria-label': `${l.title} · ${pct}% · 클릭하면 강의 자료 보기`,
    onclick: () => location.hash = `#/lecture/${encodeURIComponent(l.slug)}`,
    onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = `#/lecture/${encodeURIComponent(l.slug)}`; } }
  },
    h('div', { class: 'mlc-head' },
      h('span', { class: 'mlc-status', style: { color: statusColor } }, statusLabel),
      h('span', { class: 'mlc-theme' }, '🎨 ' + l.theme)
    ),
    h('h3', { class: 'mlc-title' }, l.title),
    h('div', { class: 'mlc-meta' },
      h('span', {}, '🎧 ' + l.audience),
      h('span', {}, '📦 ' + l.brand)
    ),
    h('div', { class: 'mlc-progress-wrap' },
      h('div', { class: 'mlc-progress-track' },
        h('div', { class: 'mlc-progress-fill', style: { width: pct + '%' } })
      ),
      h('div', { class: 'mlc-progress-label' },
        h('span', { class: 'mlc-pct' }, pct + '%'),
        h('span', { class: 'mlc-detail' }, `📝 ${l.scriptCount}/${l.totalParts} · 🎨 ${l.pptCount}/${l.totalParts} · 🛠 ${l.tutCount}/${l.totalParts}`)
      )
    ),
    h('div', { class: 'mlc-action' }, '강의 자료 보기 →')
  );
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

  app.appendChild(h('a', { href: '#/', class: 'muted', style: { fontSize: '12px', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' } }, '← 강의 목록'));
  app.appendChild(h('section', { class: 'hero reveal' },
    h('div', { class: 'hero-kicker' }, '● LECTURE · ' + slug),
    h('h1', { class: 'hero-title' }, meta.title || slug),
    h('div', { class: 'meta-row', style: { marginTop: '20px' } },
      h('span', { class: 'meta-chip' }, meta.audience || '오디언스 미지정'),
      h('span', { class: 'meta-chip secondary' }, meta.theme || 'pajamaboss'),
      h('span', { class: 'meta-chip secondary' }, meta.brand || '_default'),
      h('span', { class: 'meta-chip secondary' }, (meta.total_parts || parts.length) + '강')
    )
  ));

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

  app.appendChild(h('a', { href: `#/lecture/${encodeURIComponent(slug)}`, class: 'muted', style: { fontSize: '12px', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' } }, '← ' + (data.meta.title || slug)));
  app.appendChild(h('section', { class: 'hero reveal' },
    h('div', { class: 'hero-kicker' }, '● PART ' + num),
    h('h1', { class: 'hero-title' }, num + '강 · ', h('span', { class: 'accent' }, data.meta.title || slug))
  ));

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
  app.appendChild(h('section', { class: 'hero reveal' },
    h('div', { class: 'hero-kicker' }, '● SYSTEM · 개발자 도구'),
    h('h1', { class: 'hero-title' }, '시스템 ', h('span', { class: 'accent' }, '점검')),
    h('p', { class: 'hero-subtitle' }, '설치가 제대로 됐는지, 비용은 얼마나 나올지 확인하는 도구들입니다. 평소엔 안 써도 돼요.')
  ));

  // Lint 4종 · Smoke Test 좌우 배치
  const lintBtn = h('button', { class: 'btn btn-gold', onclick: runLint }, '▶ 전체 Lint 실행');
  const lintResults = h('div', { class: 'lint-grid', style: { marginTop: '12px' } });
  const smokeBtn = h('button', { class: 'btn btn-gold', onclick: runSmoke }, '▶ Smoke 실행');
  const smokeOut = h('pre', { class: 'log-pane', style: { height: '260px', marginTop: '12px', display: 'none' } });

  app.appendChild(h('div', { class: 'diag-grid' },
    h('div', { class: 'diag-card' },
      h('h2', { style: { margin: '0 0 6px' } }, '🔍 Lint 4종'),
      h('p', { class: 'muted', style: { fontSize: '13px', marginBottom: '14px' } },
        '프로젝트 설정이 규칙에 맞는지 자동 점검합니다 (이식성·테마 토큰·경로·브랜드 컨텍스트). ✅가 뜨면 문제 없음.'
      ),
      lintBtn,
      lintResults
    ),
    h('div', { class: 'diag-card' },
      h('h2', { style: { margin: '0 0 6px' } }, '🧪 Smoke Test'),
      h('p', { class: 'muted', style: { fontSize: '13px', marginBottom: '14px' } },
        '필수 폴더·파일·의존성이 모두 제자리에 있는지 빠르게 확인합니다. 새로 설치한 뒤 한 번 눌러 보세요.'
      ),
      smokeBtn,
      smokeOut
    )
  ));

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
  app.appendChild(h('p', { class: 'muted', style: { fontSize: '13px', marginBottom: '14px' } },
    '강의를 만들 때 Claude API에 얼마나 드는지 미리 계산합니다. 홈 마법사에도 같은 계산이 실시간으로 표시돼요.'
  ));
  const costPartsId = 'sys-cost-parts';
  const costBatchId = 'sys-cost-batch';
  const costParts = h('input', { id: costPartsId, type: 'number', value: '6', min: '1', max: '50' });
  const costBatch = h('input', { id: costBatchId, type: 'checkbox' });
  const costBtn = h('button', { class: 'btn', onclick: runCost }, '계산');
  const costOut = h('pre', { class: 'cost-preview' }, '파트 수 입력 후 계산 버튼');
  app.appendChild(h('div', { class: 'checkbox-row' },
    h('label', { for: costPartsId, style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' } },
      h('span', {}, h('strong', {}, '파트 수'), ' · ', h('span', { class: 'muted', style: { fontSize: '11px' } }, '총 몇 강으로 만들지. 예: 6강')),
      costParts
    ),
    h('label', { for: costBatchId, style: { alignItems: 'flex-start' } },
      costBatch,
      h('span', {}, h('strong', {}, '배치 할인'), h('br'), h('span', { class: 'muted', style: { fontSize: '11px' } }, '50% 저렴하지만 속도 느림 (당일 급하지 않을 때)'))
    )
  ));
  app.appendChild(costBtn);
  app.appendChild(costOut);

  async function runCost() {
    costOut.textContent = '계산 중...';
    const r = await api(`/api/cost?parts=${costParts.value}&batch=${costBatch.checked ? 1 : 0}`);
    costOut.textContent = r.stdout.split('\n').slice(-22).join('\n');
  }
}
