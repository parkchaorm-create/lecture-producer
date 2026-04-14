#!/usr/bin/env node
/**
 * deploy-ppt.mjs · v1.2
 * 강의 완성본(output/<slug>/ppt/)을 GitHub Pages 또는 별도 repo로 배포.
 *
 * 모드:
 *   1) --target=worktree (기본): 현 repo에 gh-pages 브랜치 worktree 생성 후 push
 *   2) --target=separate:<owner>/<repo>: 별도 public repo로 push (gh CLI 필요)
 *   3) --target=local: 배포 없이 배포 패키지만 _deploy/<slug>/ 에 생성
 *
 * 사용:
 *   node deploy-ppt.mjs <slug> [--target worktree|separate:<o>/<r>|local] [--commit-msg <msg>]
 *
 * 전제:
 *   - git 설치
 *   - GitHub Pages 대상이 repo이면 리모트 origin 존재 + write 권한
 *   - separate 모드는 `gh` CLI 인증 완료
 */
import { execSync } from 'child_process';
import { existsSync, cpSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync } from 'fs';
import { join, resolve } from 'path';

// v1.2 · 배포 폴더 구조에 맞게 HTML 상대경로 자동 rewrite
// 원래 output/<slug>/ppt/NN강_*.html에서 ../../../assets/themes/pajamaboss/... 참조
// 배포 시 <slug>/NN강_*.html + <slug>/assets/... 구조 → ./assets/... 로 평탄화
function rewriteAssetPaths(dir) {
  const patterns = [
    /\.\.\/\.\.\/\.\.\/assets\/themes\/pajamaboss\//g,
    /\.\.\/\.\.\/assets\/themes\/pajamaboss\//g,
    /\.\.\/assets\/themes\/pajamaboss\//g
  ];
  let fixed = 0;
  function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      const st = statSync(full);
      if (st.isDirectory()) { walk(full); continue; }
      if (!/\.html$/.test(name)) continue;
      let s = readFileSync(full, 'utf8');
      const before = s;
      for (const p of patterns) s = s.replace(p, './assets/themes/pajamaboss/');
      if (s !== before) { writeFileSync(full, s); fixed++; }
    }
  }
  walk(dir);
  if (fixed > 0) console.log(`🔧 ${fixed}개 HTML 상대경로 rewrite → ./assets/themes/pajamaboss/`);
}

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node deploy-ppt.mjs <slug> [--target worktree|separate:<o>/<r>|local]');
  process.exit(2);
}

const args = process.argv.slice(3);
const targetArg = args.find(a => a.startsWith('--target'))?.split('=')[1]
  || (args.indexOf('--target') >= 0 ? args[args.indexOf('--target') + 1] : 'worktree');
const commitMsg = args.find(a => a.startsWith('--commit-msg='))?.split('=')[1]
  || `deploy: ${slug} · ${new Date().toISOString().slice(0, 10)}`;

const pptDir = `output/${slug}/ppt`;
if (!existsSync(pptDir)) {
  console.error(`❌ ${pptDir} 없음 · 먼저 /produce-lecture 완료`);
  process.exit(2);
}

function sh(cmd) { return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }

// 1. 로컬 배포 패키지 생성 (공통)
const pkgDir = `_deploy/${slug}`;
mkdirSync(pkgDir, { recursive: true });
cpSync(pptDir, pkgDir, { recursive: true });
// assets·brand-context 필수 파일 함께 복사 (상대경로 유지)
cpSync('assets/themes/pajamaboss', join(pkgDir, 'assets/themes/pajamaboss'), { recursive: true });
// _meta.json 복사
if (existsSync(`output/${slug}/_meta.json`)) {
  cpSync(`output/${slug}/_meta.json`, join(pkgDir, '_meta.json'));
}
// GitHub Pages용 .nojekyll
writeFileSync(join(pkgDir, '.nojekyll'), '');

// 배포 구조에 맞게 HTML 상대경로 자동 rewrite
rewriteAssetPaths(pkgDir);

console.log(`📦 배포 패키지 생성: ${pkgDir}`);

if (targetArg === 'local') {
  console.log(`✅ 로컬 패키지만 생성 · 수동 업로드하세요`);
  process.exit(0);
}

// 2. Git 리모트 확인
let origin;
try {
  origin = sh('git remote get-url origin');
} catch {
  console.error('❌ 리모트 origin 없음 · --target=local 사용 또는 origin 먼저 연결');
  console.error('   git remote add origin https://github.com/<you>/<repo>.git');
  process.exit(2);
}

if (targetArg === 'worktree') {
  // gh-pages 브랜치 worktree
  const wt = `.git-worktree-gh-pages-${Date.now()}`;
  try {
    // gh-pages 브랜치 존재 여부
    const branches = sh('git branch -a');
    if (!/gh-pages/.test(branches)) {
      sh('git branch gh-pages');
      console.log('✅ gh-pages 브랜치 생성');
    }
    sh(`git worktree add ${wt} gh-pages`);
    // 대상 폴더 정리 후 복사
    const wtSlug = join(wt, slug);
    if (existsSync(wtSlug)) rmSync(wtSlug, { recursive: true, force: true });
    cpSync(pkgDir, wtSlug, { recursive: true });
    // 루트 index.html (강의 목록) 자동 생성/갱신
    const rootIndex = join(wt, 'index.html');
    const existingList = existsSync(rootIndex) ? readFileSync(rootIndex, 'utf8') : '';
    // 단순화: 매 배포 시 목록만 재생성
    const slugLinks = [];
    for (const d of execSync(`ls ${wt}`, { stdio: 'pipe' }).toString().split('\n').filter(Boolean)) {
      if (d.startsWith('.') || d.startsWith('_') || d === 'index.html') continue;
      slugLinks.push(`<li><a href="${encodeURIComponent(d)}/">${d}</a></li>`);
    }
    writeFileSync(rootIndex, `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Lectures</title><style>body{background:#0D0D0D;color:#E8E0CC;font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}a{color:#e2c793}h1{color:#F7F0DF}</style></head><body><h1>Lectures</h1><ul>${slugLinks.join('')}</ul></body></html>`);
    // 커밋·푸시
    process.chdir(wt);
    sh('git add -A');
    sh(`git -c user.email=lecture-producer@local -c user.name=lecture-producer commit -m "${commitMsg}" || true`);
    sh('git push -u origin gh-pages');
    process.chdir('../');
    sh(`git worktree remove ${wt} --force`);
    const url = origin.replace(/\.git$/, '').replace('github.com/', 'https://').replace('https://https://', 'https://');
    // owner/repo 추출
    const m = origin.match(/github\.com[:\/]([^\/]+)\/([^\/]+?)(?:\.git)?$/);
    const pageUrl = m ? `https://${m[1]}.github.io/${m[2]}/${encodeURIComponent(slug)}/` : '배포 URL 확인 필요';
    console.log(`✅ gh-pages push 완료`);
    console.log(`   URL (GitHub Pages 활성 후): ${pageUrl}`);
    console.log(`   Settings → Pages에서 gh-pages 브랜치 활성 필요 (최초 1회)`);
  } catch (e) {
    console.error('❌ worktree 배포 실패:', e.message);
    try { sh(`git worktree remove ${wt} --force`); } catch {}
    process.exit(1);
  }
} else if (targetArg.startsWith('separate:')) {
  const [owner, repo] = targetArg.slice('separate:'.length).split('/');
  if (!owner || !repo) { console.error('형식: separate:<owner>/<repo>'); process.exit(2); }
  try {
    sh('gh --version');
  } catch {
    console.error('❌ gh CLI 필요 · https://cli.github.com');
    process.exit(2);
  }
  // repo 존재 확인·없으면 생성
  try { sh(`gh repo view ${owner}/${repo}`); }
  catch { sh(`gh repo create ${owner}/${repo} --public --description "Lecture: ${slug}" --confirm || true`); }
  const tmp = `_deploy/.sep-${Date.now()}`;
  mkdirSync(tmp, { recursive: true });
  cpSync(pkgDir, tmp, { recursive: true });
  process.chdir(tmp);
  sh('git init -q');
  sh('git checkout -b main');
  sh(`git remote add origin https://github.com/${owner}/${repo}.git`);
  sh('git add -A');
  sh(`git -c user.email=lecture-producer@local -c user.name=lecture-producer commit -m "${commitMsg}"`);
  try { sh('git push -u origin main'); }
  catch { sh('git push -u origin main --force'); }
  process.chdir('../..');
  rmSync(tmp, { recursive: true, force: true });
  console.log(`✅ ${owner}/${repo} push 완료`);
  console.log(`   GitHub Pages 활성 URL: https://${owner}.github.io/${repo}/`);
} else {
  console.error(`알 수 없는 --target: ${targetArg}`);
  process.exit(2);
}
