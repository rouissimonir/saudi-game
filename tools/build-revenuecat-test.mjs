import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const key = process.env.VITE_REVENUECAT_TEST_KEY;
if (!key || !/^test_[A-Za-z0-9]+$/.test(key)) {
  console.error('Set VITE_REVENUECAT_TEST_KEY to the RevenueCat Test Store public key.');
  process.exit(1);
}

// Keep test assets away from dist, which is the normal Capacitor release input.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const result = spawnSync(process.execPath, [vite, 'build', '--outDir', 'build/revenuecat-test', '--emptyOutDir'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit',
});
if (result.error) {
  console.error('Unable to start the test build:', result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
