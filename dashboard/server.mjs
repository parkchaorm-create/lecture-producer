#!/usr/bin/env node
/**
 * dashboard/server.mjs · v1.3
 * lecture-producer 로컬 대시보드. Zero-dependency (Node 내장 http만).
 * 실행: node dashboard/server.mjs  → http://127.0.0.1:3737
 *
 * 보안:
 * - 127.0.0.1만 바인딩 (LAN 접근 차단)
 * - Exec 모드는 .claude/local-config.json의 dashboard.allowExec: true 필요
 */
import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync, statSync, createReadStream, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { extname, join, resolve, basename } from 'path';
import { spawn } from 'child_process';
import { URL } from 'url';

const PORT = 3737;
const HOST = '127.0.0.1';
const ROOT = resolve(import.meta.dirname, '..');

// local-config 로드
function loadConfig() {
  const p = join(ROOT, '.claude/local-config.json');
  if (!existsSync(p)) return {};
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return {}; }
}
const config = loadConfig();
const allowExec = !!(config.dashboard?.allowExec);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8'
};

/* ──── API · 강의 목록 ──── */
function listLectures() {
  const out = [];
  const dir = join(ROOT, 'output');
  if (!existsSync(dir)) return out;
  for (const slug of readdirSync(dir)) {
    const slugDir = join(dir, slug);
    if (!statSync(slugDir).isDirectory()) continue;
    if (slug.startsWith('_')) continue;
    const metaPath = join(slugDir, '_meta.json');
    const meta = existsSync(metaPath) ? safeJson(metaPath) : {};
    const sp = join(slugDir, 'script_parts');
    const pp = join(slugDir, 'ppt');
    const tu = join(slugDir, 'tutorials');
    const scriptCount = existsSync(sp) ? countMd(sp) : 0;
    const pptCount = existsSync(pp) ? countHtml(pp) : 0;
    const tutCount = existsSync(tu) ? countMd(tu) : 0;
    const total = meta.total_parts || Math.max(scriptCount, pptCount, 1);
    out.push({
      slug,
      title: meta.title || slug,
      audience: meta.audience || '미지정',
      theme: meta.theme || 'pajamaboss',
      brand: meta.brand || '_default',
      totalParts: total,
      scriptCount, pptCount, tutCount,
      progress: Math.round(((scriptCount + pptCount + tutCount) / (total * 3)) * 100),
      createdAt: meta.created_at || null,
      mtime: statSync(slugDir).mtimeMs
    });
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}
function safeJson(p) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return {}; } }
function countMd(d) { return countExt(d, /\.md$/); }
function countHtml(d) { return countExt(d, /\.html$/); }
function countExt(d, re) {
  let n = 0;
  function w(x) {
    for (const e of readdirSync(x)) {
      const f = join(x, e);
      const st = statSync(f);
      if (st.isDirectory()) w(f);
      else if (re.test(e) && e !== 'index.html') n++;
    }
  }
  try { w(d); } catch {}
  return n;
}

/* ──── API · 브랜드 / 테마 ──── */
function listBrands() {
  const dir = join(ROOT, 'brand-context');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(d => { try { return statSync(join(dir, d)).isDirectory(); } catch { return false; } })
    .map(slug => {
      const yml = join(dir, slug, 'brand.yaml');
      const yaml = existsSync(yml) ? readFileSync(yml, 'utf8') : '';
      const name = (yaml.match(/^displayName:\s*['"]?([^'"\n]+)/m) || [,slug])[1].trim();
      const type = (yaml.match(/^type:\s*(\S+)/m) || [,'unknown'])[1];
      return { slug, name, type };
    });
}
function listThemes() {
  const dir = join(ROOT, 'assets/themes');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(d => { try { return statSync(join(dir, d)).isDirectory(); } catch { return false; } })
    .map(slug => {
      const td = join(dir, slug);
      const tp = join(td, 'tokens.json');
      const tokens = existsSync(tp) ? safeJson(tp) : {};
      const hasPreview = existsSync(join(td, 'preview.svg'));
      return {
        slug,
        displayName: tokens.displayName || slug,
        variant: tokens.variant || 'dark',
        description: tokens.description || '',
        accent: tokens.palette?.gold || null,
        bg: tokens.palette?.black || null,
        preview: hasPreview ? `/assets/themes/${slug}/preview.svg` : null
      };
    });
}

/* ──── v1.4-G · Multipart parser (minimal · zero-dep) ──── */
async function parseMultipart(req, contentType) {
  const m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!m) throw new Error('boundary 없음');
  const boundary = '--' + (m[1] || m[2]).trim();
  const chunks = [];
  const LIMIT = 50 * 1024 * 1024; // 50MB
  let total = 0;
  for await (const c of req) {
    total += c.length;
    if (total > LIMIT) throw new Error('파일 크기 50MB 초과');
    chunks.push(c);
  }
  const buf = Buffer.concat(chunks);
  const bBuf = Buffer.from(boundary);
  const parts = [];
  let idx = 0;
  while (idx < buf.length) {
    const start = buf.indexOf(bBuf, idx);
    if (start < 0) break;
    const next = buf.indexOf(bBuf, start + bBuf.length);
    if (next < 0) break;
    // 파트 본문 (헤더 + body)
    const partBuf = buf.slice(start + bBuf.length + 2, next - 2); // +2 CRLF, -2 CRLF
    const headerEnd = partBuf.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd < 0) { idx = next; continue; }
    const headerText = partBuf.slice(0, headerEnd).toString('utf8');
    const body = partBuf.slice(headerEnd + 4);
    const disp = headerText.match(/Content-Disposition:\s*form-data;([^\r\n]+)/i);
    if (disp) {
      const filenameMatch = disp[1].match(/filename="([^"]+)"/);
      const nameMatch = disp[1].match(/name="([^"]+)"/);
      parts.push({
        name: nameMatch ? nameMatch[1] : null,
        filename: filenameMatch ? filenameMatch[1] : null,
        data: body
      });
    }
    idx = next;
  }
  return parts;
}

/* ──── API · cost estimate ──── */
function runNode(script, args = []) {
  return new Promise((resolve) => {
    const proc = spawn('node', [join(ROOT, script), ...args], { cwd: ROOT });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => resolve({ code, stdout, stderr }));
  });
}

/* ──── Router ──── */
const server = createServer(async (req, res) => {
  const u = new URL(req.url, `http://${HOST}:${PORT}`);
  const path = u.pathname;
  const method = req.method;

  // CORS (로컬만이라 단순)
  res.setHeader('Access-Control-Allow-Origin', 'http://' + HOST + ':' + PORT);

  // API
  if (path === '/api/config') return json(res, { allowExec, version: readFileSync(join(ROOT, '.claude/VERSION'), 'utf8').trim() });
  if (path === '/api/lectures') return json(res, listLectures());
  if (path === '/api/brands') return json(res, listBrands());
  if (path === '/api/themes') return json(res, listThemes());

  // v1.4-G · 자료 업로드 (파일)
  if (path === '/api/upload' && method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) return json(res, { error: 'multipart/form-data 필요' }, 400);
    const mode = u.searchParams.get('mode') || 'mode-1-references';
    if (!/^mode-[1-4]-/.test(mode)) return json(res, { error: 'invalid mode' }, 400);
    try {
      const files = await parseMultipart(req, contentType);
      const savedAt = [];
      const uploadDir = join(ROOT, 'input', mode, 'uploads');
      mkdirSync(uploadDir, { recursive: true });
      for (const f of files) {
        if (!f.filename) continue;
        // sanitize: 경로 구분자·상위경로 제거
        const safe = basename(f.filename).replace(/[^\w.\-가-힣]/g, '_');
        const ts = Date.now();
        const dst = join(uploadDir, `${ts}-${safe}`);
        writeFileSync(dst, f.data);
        savedAt.push({ name: f.filename, saved: `input/${mode}/uploads/${ts}-${safe}`, size: f.data.length });
      }
      return json(res, { ok: true, files: savedAt });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // v1.4 · 브랜드 에셋 업로드 (마법사 Step 2)
  if (path === '/api/brand-upload' && method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) return json(res, { error: 'multipart/form-data 필요' }, 400);
    const brandSlug = (u.searchParams.get('slug') || '').trim();
    if (!/^[a-z0-9-]+$/.test(brandSlug)) return json(res, { error: 'slug는 영문 소문자·숫자·하이픈만' }, 400);
    if (brandSlug.startsWith('_')) return json(res, { error: '_로 시작하는 slug 금지' }, 400);
    try {
      const files = await parseMultipart(req, contentType);
      const brandDir = join(ROOT, 'brand-context', brandSlug);
      const uploadDir = join(brandDir, 'uploads');
      mkdirSync(uploadDir, { recursive: true });
      // brand.yaml 스텁 (최초 업로드 시에만)
      const yamlPath = join(brandDir, 'brand.yaml');
      if (!existsSync(yamlPath)) {
        const stub = `name: ${brandSlug}\ndisplayName: ${brandSlug}\ntype: personal\nlicense: All rights reserved\n# dashboard 마법사에서 자동 생성 · 이후 수동 편집 권장\n`;
        writeFileSync(yamlPath, stub);
      }
      const savedAt = [];
      for (const f of files) {
        if (!f.filename) continue;
        const safe = basename(f.filename).replace(/[^\w.\-가-힣]/g, '_');
        const ts = Date.now();
        const dst = join(uploadDir, `${ts}-${safe}`);
        writeFileSync(dst, f.data);
        savedAt.push({ name: f.filename, saved: `brand-context/${brandSlug}/uploads/${ts}-${safe}`, size: f.data.length });
      }
      return json(res, { ok: true, slug: brandSlug, files: savedAt });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // v1.4-G · 외부 URL 참조 등록
  if (path === '/api/refs' && method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let payload;
      try { payload = JSON.parse(body); } catch { return json(res, { error: 'invalid JSON' }, 400); }
      const { mode, url, note } = payload;
      if (!mode || !/^mode-[1-4]-/.test(mode)) return json(res, { error: 'invalid mode' }, 400);
      if (!url || !/^https?:\/\//.test(url)) return json(res, { error: 'invalid url (http/https)' }, 400);
      const refDir = join(ROOT, 'input', mode, 'refs');
      mkdirSync(refDir, { recursive: true });
      const refFile = join(refDir, 'external-refs.md');
      const entry = `\n## ${new Date().toISOString()}\n- URL: ${url}${note ? '\n- 메모: ' + note : ''}\n`;
      appendFileSync(refFile, entry);
      return json(res, { ok: true, saved: `input/${mode}/refs/external-refs.md` });
    });
    return;
  }

  // v1.4-G · 업로드된 자료 목록
  if (path === '/api/uploads') {
    const mode = u.searchParams.get('mode') || 'mode-1-references';
    const uploadDir = join(ROOT, 'input', mode, 'uploads');
    const refFile = join(ROOT, 'input', mode, 'refs', 'external-refs.md');
    const files = existsSync(uploadDir)
      ? readdirSync(uploadDir).map(f => {
          const st = statSync(join(uploadDir, f));
          return { name: f, size: st.size, mtime: st.mtimeMs };
        }).sort((a, b) => b.mtime - a.mtime)
      : [];
    const refsText = existsSync(refFile) ? readFileSync(refFile, 'utf8') : '';
    return json(res, { files, refsText });
  }

  if (path === '/api/cost' && method === 'GET') {
    const parts = parseInt(u.searchParams.get('parts') || '6', 10);
    const batch = u.searchParams.get('batch') === '1';
    const r = await runNode('.claude/scripts/cost-estimator.mjs', [String(parts), ...(batch ? ['--batch'] : [])]);
    return json(res, { stdout: r.stdout, code: r.code });
  }

  if (path.startsWith('/api/lecture/')) {
    const slug = decodeURIComponent(path.slice('/api/lecture/'.length));
    const slugDir = join(ROOT, 'output', slug);
    if (!existsSync(slugDir)) return json(res, { error: 'not found' }, 404);
    const meta = safeJson(join(slugDir, '_meta.json'));
    const parts = [];
    const sp = join(slugDir, 'script_parts');
    if (existsSync(sp)) {
      for (const act of readdirSync(sp)) {
        const ap = join(sp, act);
        if (!statSync(ap).isDirectory()) continue;
        for (const f of readdirSync(ap)) if (/part-\d+\.md$/.test(f)) parts.push({ act, name: f, size: statSync(join(ap, f)).size });
      }
    }
    const pptFiles = (() => {
      const pp = join(slugDir, 'ppt');
      if (!existsSync(pp)) return [];
      return readdirSync(pp).filter(f => /\.html$/.test(f) && f !== 'index.html');
    })();
    const tutFiles = (() => {
      const tu = join(slugDir, 'tutorials');
      if (!existsSync(tu)) return [];
      return readdirSync(tu).filter(f => /\.md$/.test(f));
    })();
    return json(res, { slug, meta, parts, pptFiles, tutFiles });
  }

  if (path === '/api/lint') {
    const results = {};
    for (const [name, script] of [
      ['portability', '.claude/scripts/portability-check.mjs'],
      ['theme', '.claude/scripts/theme-lint.mjs'],
      ['path', '.claude/scripts/path-lint.mjs'],
      ['brand', '.claude/scripts/brand-context-lint.mjs']
    ]) {
      const args = name === 'brand' ? ['--all'] : ['.'];
      const r = await runNode(script, args);
      results[name] = { code: r.code, output: r.stdout || r.stderr };
    }
    return json(res, results);
  }

  if (path === '/api/smoke') {
    const r = await runNode('tests/e2e/smoke.mjs');
    return json(res, { code: r.code, output: r.stdout });
  }

  // Exec: /produce-lecture 실행 · SSE 스트리밍
  if (path === '/api/exec' && method === 'POST') {
    if (!allowExec) return json(res, { error: 'Exec 모드 비활성 · .claude/local-config.json의 dashboard.allowExec을 true로 설정하세요.' }, 403);
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let payload;
      try { payload = JSON.parse(body); } catch { return json(res, { error: 'invalid JSON' }, 400); }
      const { command, args } = payload;
      // 화이트리스트: claude CLI · node 스크립트만 허용
      const allowed = ['claude', 'node'];
      if (!allowed.includes(command)) return json(res, { error: 'command not allowed' }, 403);
      // SSE 헤더
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write(`event: start\ndata: ${JSON.stringify({ command, args })}\n\n`);
      const proc = spawn(command, args || [], { cwd: ROOT, shell: process.platform === 'win32' });
      proc.stdout.on('data', d => res.write(`event: stdout\ndata: ${JSON.stringify(d.toString())}\n\n`));
      proc.stderr.on('data', d => res.write(`event: stderr\ndata: ${JSON.stringify(d.toString())}\n\n`));
      proc.on('close', code => {
        res.write(`event: close\ndata: ${JSON.stringify({ code })}\n\n`);
        res.end();
      });
      proc.on('error', err => {
        res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
        res.end();
      });
    });
    return;
  }

  // 정적 파일 (더 긴 prefix 먼저)
  const staticRoots = [
    ['/output/', join(ROOT, 'output')],
    ['/assets/', join(ROOT, 'assets')],
    ['/brand-context/', join(ROOT, 'brand-context')],
    ['/', join(import.meta.dirname, 'public')]
  ];
  let filePath;
  for (const [prefix, base] of staticRoots) {
    if (path.startsWith(prefix)) {
      const rel = path.slice(prefix.length) || 'index.html';
      filePath = join(base, decodeURIComponent(rel));
      break;
    }
  }
  if (!filePath) return notFound(res);
  // path traversal 차단
  if (!resolve(filePath).startsWith(ROOT) && !resolve(filePath).startsWith(join(import.meta.dirname, 'public'))) {
    return json(res, { error: 'forbidden' }, 403);
  }
  try {
    const st = statSync(filePath);
    if (st.isDirectory()) filePath = join(filePath, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch {
    notFound(res);
  }
});

function json(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

server.listen(PORT, HOST, () => {
  console.log(`\n🎓 lecture-producer Dashboard`);
  console.log(`   http://${HOST}:${PORT}`);
  console.log(`   Exec 모드: ${allowExec ? '✅ 활성' : '❌ 비활성 (local-config.json에서 켜기)'}`);
  console.log(`   종료: Ctrl+C\n`);
});
