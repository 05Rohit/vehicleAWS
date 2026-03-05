/* ====== Comments (Use) :- Return time difference ===== */

export function getTimeDifference(databaseTime) {
  const dbDate = new Date(databaseTime);
  const now = new Date();

  // Calculate difference in milliseconds
  const diffMs = now - dbDate;

  // Convert to minutes
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours !== 1 ? "s" : ""}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}
