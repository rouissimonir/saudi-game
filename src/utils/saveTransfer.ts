import { GameState } from '../game/rules';
import { normalizeSave } from '../game/normalizeSave';

/** Versioned prefix so future formats can be told apart. */
const PREFIX = 'QM1.';

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array<ArrayBuffer>> {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** A copy-and-paste code holding the whole save, gzip-compressed. */
export async function exportSaveCode(state: GameState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state));
  return PREFIX + toBase64Url(await pipe(json, new CompressionStream('gzip')));
}

/** Parses a transfer code; returns null for anything that is not a valid save. */
export async function importSaveCode(code: string): Promise<GameState | null> {
  const trimmed = code.trim().replace(/\s+/g, '');
  if (!trimmed.startsWith(PREFIX)) return null;
  try {
    const bytes = await pipe(fromBase64Url(trimmed.slice(PREFIX.length)), new DecompressionStream('gzip'));
    return normalizeSave(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
