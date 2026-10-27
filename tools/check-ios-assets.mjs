import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function filesUnder(root, relative = '') {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const name = path.join(relative, entry.name);
    return entry.isDirectory() ? filesUnder(root, name) : entry.isFile() ? [name] : [];
  }));
  return nested.flat();
}

const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/** Compare the entire generated web build with the files copied into the Capacitor iOS project. */
export async function verifyIOSBundle(root) {
  const dist = path.join(root, 'dist');
  const bundled = path.join(root, 'ios', 'App', 'App', 'public');
  const issues = [];
  let files;
  try { files = await filesUnder(dist); }
  catch { return { filesChecked: 0, issues: ['Build directory is missing. Run npm run build first.'] }; }
  if (!files.includes('index.html')) issues.push('Build is missing index.html.');
  for (const file of files) {
    try {
      const [source, copy] = await Promise.all([readFile(path.join(dist, file)), readFile(path.join(bundled, file))]);
      if (digest(source) !== digest(copy)) issues.push(`Stale iOS asset: ${file}`);
    } catch { issues.push(`Missing or unreadable iOS asset: ${file}`); }
  }
  try {
    const source = JSON.parse(await readFile(path.join(root, 'capacitor.config.json'), 'utf8'));
    const copy = JSON.parse(await readFile(path.join(root, 'ios', 'App', 'App', 'capacitor.config.json'), 'utf8'));
    if (source.server?.url || copy.server?.url) issues.push('A remote server URL is configured; the iOS game should use its bundled build.');
    if (source.appId !== copy.appId || source.server?.iosScheme !== copy.server?.iosScheme) issues.push('The copied iOS configuration does not match the source configuration.');
  } catch { issues.push('The source or copied Capacitor configuration is missing or unreadable.'); }
  return { filesChecked: files.length, issues };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyIOSBundle(process.cwd());
  if (result.issues.length) {
    for (const issue of result.issues) console.error(issue);
    process.exitCode = 1;
  } else console.log(`iOS bundle matches ${result.filesChecked} web build files; no remote server URL configured.`);
}
