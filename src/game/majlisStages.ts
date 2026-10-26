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
