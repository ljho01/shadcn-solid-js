/**
 * @radix-solid-js/*, @shadcn-solid-js/* 패키지의 publishConfig를
 * GitHub Packages 레지스트리로 변경하는 스크립트
 *
 * CLI(shadcn-solid-js)는 npmjs.com에 유지
 *
 * 실행: bun run scripts/set-github-registry.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dir, '..');

const packageDirs = ['packages/core', 'packages/solid', 'packages/shadcn'];

let updated = 0;

for (const dir of packageDirs) {
  const fullDir = join(rootDir, dir);
  if (!existsSync(fullDir)) continue;

  const entries = readdirSync(fullDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pkgJsonPath = join(fullDir, entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    const raw = readFileSync(pkgJsonPath, 'utf-8');
    const pkg = JSON.parse(raw);

    if (pkg.private) continue;

    // GitHub Packages 레지스트리로 변경
    pkg.publishConfig = {
      access: 'public',
      registry: 'https://npm.pkg.github.com'
    };

    // repository 필드 추가 (GitHub Packages에 필요)
    if (!pkg.repository) {
      pkg.repository = {
        type: 'git',
        url: 'https://github.com/ljho01/shadcn-solid-js.git',
        directory: dir + '/' + entry.name
      };
    }

    const newRaw = JSON.stringify(pkg, null, 2) + '\n';
    writeFileSync(pkgJsonPath, newRaw, 'utf-8');

    console.log(`✅ ${pkg.name}`);
    updated++;
  }
}

console.log(`\n완료: ${updated}개 패키지를 GitHub Packages 레지스트리로 설정`);
