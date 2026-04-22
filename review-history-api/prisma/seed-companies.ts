import { spawn } from 'child_process';

/**
 * Legacy entrypoint kept for npm script compatibility.
 * It now delegates to prisma/seed.ts, which supports high-volume configurable seeding.
 */
async function main() {
  console.log('↪ Delegating to prisma/seed.ts');
  console.log('  Tip: use env vars like SEED_ENTITIES=1000000, SEED_BATCH_SIZE=5000');

  const child = spawn('ts-node', ['-P', 'tsconfig.seed.json', 'prisma/seed.ts'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error('❌ seed-companies delegate failed', err);
  process.exit(1);
});

