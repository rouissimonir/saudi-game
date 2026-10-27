/** Point the top pointer at the middle of the awarded clockwise wedge, after two full turns. */
export function rotationForWedge(previous: number, index: number, count: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= count || count <= 0) return previous;
  const step = 360 / count;
  const target = (360 - ((index + 0.5) * step) % 360) % 360;
  const current = ((previous % 360) + 360) % 360;
  return previous + 720 + (target - current + 360) % 360;
}
