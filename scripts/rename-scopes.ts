/**
 * 모든 패키지의 스코프를 변경하는 스크립트
 * @radix-solid-js/* → @radix-solid-js/*
 * @shadcn-solid-js/* → @shadcn-solid-js/*
 *
 * 실행: bun run scripts/rename-scopes.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const rootDir = join(import.meta.dir, '..');

const replacements: [string, string][] = [
  ['@radix-solid-js/', '@radix-solid-js/'],
  ['@shadcn-solid-js/', '@shadcn-solid-js/'],
];

// 1. 모든 package.json 업데이트 (이름 + 의존성)
const packageDirs = ['packages/core', 'packages/solid', 'packages/shadcn'];
let pkgUpdated = 0;

for (const dir of packageDirs) {
  const fullDir = join(rootDir, dir);
  if (!existsSync(fullDir)) continue;

  const entries = readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = join(fullDir, entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    let raw = readFileSync(pkgJsonPath, 'utf-8');
    let changed = false;

    for (const [from, to] of replacements) {
      if (raw.includes(from)) {
        raw = raw.replaceAll(from, to);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(pkgJsonPath, raw, 'utf-8');
      pkgUpdated++;
    }
  }
}

// 2. CLI package.json 업데이트
const cliPkgPath = join(rootDir, 'packages/cli/package.json');
if (existsSync(cliPkgPath)) {
  let raw = readFileSync(cliPkgPath, 'utf-8');
  for (const [from, to] of replacements) {
    raw = raw.replaceAll(from, to);
  }
  writeFileSync(cliPkgPath, raw, 'utf-8');
}

// 3. docs package.json 업데이트
const docsPkgPath = join(rootDir, 'apps/docs/package.json');
if (existsSync(docsPkgPath)) {
  let raw = readFileSync(docsPkgPath, 'utf-8');
  for (const [from, to] of replacements) {
    raw = raw.replaceAll(from, to);
  }
  writeFileSync(docsPkgPath, raw, 'utf-8');
}

// 4. 소스 파일 내 import 경로 업데이트
function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      walkDir(fullPath, callback);
    } else {
      const ext = extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx'].includes(ext)) {
        callback(fullPath);
      }
    }
  }
}

let srcUpdated = 0;
const dirsToWalk = [
  join(rootDir, 'packages'),
  join(rootDir, 'apps'),
  join(rootDir, 'scripts'),
];

for (const dir of dirsToWalk) {
  walkDir(dir, (filePath) => {
    // package.json은 이미 처리했으므로 건너뛰기
    if (filePath.endsWith('package.json')) return;

    let raw = readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const [from, to] of replacements) {
      if (raw.includes(from)) {
        raw = raw.replaceAll(from, to);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(filePath, raw, 'utf-8');
      srcUpdated++;
    }
  });
}

// 5. changeset config 업데이트
const changesetConfig = join(rootDir, '.changeset/config.json');
if (existsSync(changesetConfig)) {
  let raw = readFileSync(changesetConfig, 'utf-8');
  for (const [from, to] of replacements) {
    raw = raw.replaceAll(from, to);
  }
  writeFileSync(changesetConfig, raw, 'utf-8');
}

// 6. 루트 package.json (만약 참조가 있다면)
const rootPkgPath = join(rootDir, 'package.json');
if (existsSync(rootPkgPath)) {
  let raw = readFileSync(rootPkgPath, 'utf-8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (raw.includes(from)) {
      raw = raw.replaceAll(from, to);
      changed = true;
    }
  }
  if (changed) writeFileSync(rootPkgPath, raw, 'utf-8');
}

console.log(`\n완료:`);
console.log(`  package.json 업데이트: ${pkgUpdated}개`);
console.log(`  소스 파일 업데이트: ${srcUpdated}개`);
console.log(`  + CLI, docs, changeset config 업데이트`);
