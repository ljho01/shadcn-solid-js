/**
 * 모든 scoped 패키지(@radix-solid/*, @shadcn-solid/*)의 package.json에
 * publishConfig: { "access": "public" }을 추가하는 스크립트
 *
 * 실행: bun run scripts/add-publish-config.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dir, '..');

const packageDirs = ['packages/core', 'packages/solid', 'packages/shadcn'];

let updated = 0;
let skipped = 0;

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

    // private 패키지는 건너뛰기
    if (pkg.private) {
      skipped++;
      continue;
    }

    // 이미 publishConfig가 있으면 건너뛰기
    if (pkg.publishConfig?.access === 'public') {
      skipped++;
      continue;
    }

    // publishConfig 추가
    pkg.publishConfig = { access: 'public' };

    // JSON 직렬화 (2칸 들여쓰기 + 마지막 줄바꿈)
    const newRaw = JSON.stringify(pkg, null, 2) + '\n';
    writeFileSync(pkgJsonPath, newRaw, 'utf-8');

    console.log(`✅ ${pkg.name}`);
    updated++;
  }
}

console.log(`\n완료: ${updated}개 업데이트, ${skipped}개 건너뜀`);
