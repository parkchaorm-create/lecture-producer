#!/usr/bin/env node
/**
 * backup.mjs · v1.1 · B5
 * output/<slug>/ 현 상태를 _backup/<timestamp>/로 자동 복사.
 * 각 Stage 진입 전 호출. rollback 명령도 지원.
 */
import { cpSync, readdirSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const cmd = process.argv[2];
const slug = process.argv[3];

if (!cmd || !slug) {
  console.error('Usage:');
  console.error('  node backup.mjs create <slug>');
  console.error('  node backup.mjs list <slug>');
  console.error('  node backup.mjs rollback <slug> <timestamp>');
  process.exit(2);
}

const root = `output/${slug}`;
if (!existsSync(root)) { console.error(`❌ ${root} 없음`); process.exit(2); }
const backupRoot = `${root}/_backup`;
mkdirSync(backupRoot, { recursive: true });

if (cmd === 'create') {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dst = join(backupRoot, ts);
  // _backup 자체는 복사 제외
  cpSync(root, dst, {
    recursive: true,
    filter: (src) => !src.includes(`${root}/_backup`) && !src.endsWith('_backup')
  });
  console.log(`✅ 백업 생성: ${dst}`);
  process.exit(0);
}

if (cmd === 'list') {
  const dirs = readdirSync(backupRoot).sort().reverse();
  console.log(`📦 ${slug} 백업 ${dirs.length}개:`);
  for (const d of dirs) console.log(`  ${d}`);
  process.exit(0);
}

if (cmd === 'rollback') {
  const ts = process.argv[4];
  if (!ts) { console.error('timestamp 필수'); process.exit(2); }
  const src = join(backupRoot, ts);
  if (!existsSync(src)) { console.error(`❌ ${src} 없음`); process.exit(2); }
  // 현재 상태를 emergency 백업 먼저
  const emergency = join(backupRoot, 'pre-rollback-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
  cpSync(root, emergency, {
    recursive: true,
    filter: (s) => !s.includes(`${root}/_backup`) && !s.endsWith('_backup')
  });
  // 기존 최상위 파일·폴더(_backup 제외) 삭제
  for (const entry of readdirSync(root)) {
    if (entry === '_backup') continue;
    rmSync(join(root, entry), { recursive: true, force: true });
  }
  // 복구
  for (const entry of readdirSync(src)) {
    cpSync(join(src, entry), join(root, entry), { recursive: true });
  }
  console.log(`✅ ${ts}로 롤백 완료`);
  console.log(`   롤백 전 상태는 ${emergency}에 보존`);
  process.exit(0);
}

console.error(`알 수 없는 명령: ${cmd}`);
process.exit(2);
