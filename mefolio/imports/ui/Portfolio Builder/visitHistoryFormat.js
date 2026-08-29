// Pure formatting helpers for VisitHistorySection, kept free of React and the
// client collection so they can be unit-tested without a browser test bundle.
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const timestamp = date instanceof Date ? date : new Date(date);
  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);
};
