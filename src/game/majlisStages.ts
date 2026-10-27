/**
 * Painted restoration stages for the Majlis view (docs/ART_BATCH_4.md, docs/ART_BATCH_5.md): public/assets/art/majlis/<areaId>_<n>.webp,
 * from 1 (ruin) to the last (fully restored). Add an area here once its stages have landed; areas without painted
 * stages keep the vector diorama.
 */
export const PAINTED_STAGES: Record<string, number> = {
  diriyah: 3, jeddah: 3, alula: 3, taif: 3, abha: 3, ahsa: 3, riyadh: 3, khobar: 3,
};

/**
 * Which stage to show for a restoration progress of `levels` out of `maxLevels` wing tiers. The last stage only
 * appears when every wing is fully restored; the stages before it split the progress evenly.
 */
export function restorationStage(levels: number, maxLevels: number, stages: number): number {
  if (stages <= 1 || maxLevels <= 0) return 1;
  if (levels >= maxLevels) return stages;
  return 1 + Math.floor((Math.max(0, levels) / maxLevels) * (stages - 1));
}

/** File-name suffix of each painted mood (docs/ART_BATCH_6.md): '' is the golden-afternoon original. */
export const MOOD_SUFFIXES = ['', '_night', '_rain'] as const;

/** The mood picture for a Majlis ambiance chip. */
export function moodSuffix(ambiance: string): (typeof MOOD_SUFFIXES)[number] {
  return ambiance === 'ramadan_night' ? '_night' : ambiance === 'courtyard_rain' ? '_rain' : '';
}

/**
 * The picture (file name without extension) the Majlis banner will show for these wings and mood, or null when the
 * area has no painted stages. The app fetches it quietly while the board is idle so opening the Majlis tab is instant.
 */
export function bannerKey(areaId: string, zones: { unlockedLevel: number }[], ambiance: string): string | null {
  const stages = PAINTED_STAGES[areaId] ?? 0;
  if (!stages) return null;
  const stage = restorationStage(zones.reduce((n, z) => n + z.unlockedLevel, 0), zones.length * 2, stages);
  return `${areaId}_${stage}${moodSuffix(ambiance)}`;
}
