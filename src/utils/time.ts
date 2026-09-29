/**
 * Convert unix seconds timestamp to local and UTC formatted string.
 */
export function formatTimestamp(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  if (isNaN(d.getTime())) return "Invalid Date";
  return `${d.toLocaleString()} (${d.toISOString()})`;
}

/**
 * Get human-readable relative time (e.g. "in 2 hours 15 mins", "3 days ago").
 */
export function formatRelativeTime(unixSeconds: number, nowSeconds: number = Math.floor(Date.now() / 1000)): string {
  const diff = unixSeconds - nowSeconds;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / 86400);
  const hours = Math.floor((absDiff % 86400) / 3600);
  const minutes = Math.floor((absDiff % 3600) / 60);
  const seconds = absDiff % 60;

  let parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || (days === 0 && hours === 0)) parts.push(`${seconds}s`);

  const durationStr = parts.join(" ");

  if (diff > 0) {
    return `in ${durationStr}`;
  } else if (diff < 0) {
    return `${durationStr} ago`;
  } else {
    return "just now";
  }
}
