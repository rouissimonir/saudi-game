/**
 * Keeps the most recent `max` keys in `order` (oldest first) and returns the keys pushed out.
 * Used to cap decoded story-line audio: a decoded minute of speech is several MB, and a full story is hundreds of lines.
 */
export function trackRecent(order: string[], key: string, max: number): string[] {
  const at = order.indexOf(key);
  if (at >= 0) order.splice(at, 1);
  order.push(key);
  return order.length > max ? order.splice(0, order.length - max) : [];
}
