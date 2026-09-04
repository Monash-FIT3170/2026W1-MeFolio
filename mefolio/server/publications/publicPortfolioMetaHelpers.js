const THEME_PREVIEW_IMAGES = {
  default: "/default-preview.png",
  minimalist: "/minimalist-preview.png",
  "modern-saas": "/modern-saas-preview.png",
  "terminal-retro": "/terminal-retro-preview.png",
};

const firstHeaderValue = (value) => {
  if (Array.isArray(value)) return value[0] || "";
  return String(value || "")
    .split(",")[0]
    .trim();
};

export const escapeHtmlAttribute = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const normalizeDescription = (value = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

export const getPublicPortfolioIdFromPath = (requestUrl = "") => {
  const pathname =
    typeof requestUrl === "string"
      ? new URL(requestUrl, "http://localhost").pathname
      : requestUrl?.pathname || requestUrl?.path || "";

  const match = String(pathname).match(/^\/([^/?#]+)\/view\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const getBaseUrlFromRequest = (request = {}, headersFromSink = null) => {
  const headers = headersFromSink || request.headers || {};
  const protocol = firstHeaderValue(headers["x-forwarded-proto"]) || "http";
  const host =
    firstHeaderValue(headers["x-forwarded-host"]) ||
    firstHeaderValue(headers.host);

  return host ? `${protocol}://${host}` : "";
};

export const toAbsoluteUrl = (url = "", baseUrl = "") => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (!baseUrl) return url;

  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

export const getPortfolioMeta = (publishedContent = {}, baseUrl = "") => {
  const title = publishedContent.title || "MeFolio Portfolio";
  const description =
    normalizeDescription(
      publishedContent.bio ||
        publishedContent.about?.summary ||
        `${publishedContent.profile?.fullName || "A student"}'s portfolio`,
    ) || "View this public portfolio.";

  const projectImage = publishedContent.projects?.find(
    (project) => project?.media,
  )?.media;
  const themeImage =
    THEME_PREVIEW_IMAGES[publishedContent.theme] ||
    THEME_PREVIEW_IMAGES.default;
  const image = toAbsoluteUrl(
    publishedContent.profile?.avatarUrl || projectImage || themeImage,
    baseUrl,
  );

  return {
    title,
    description,
    image,
  };
};

export const renderPortfolioMetaTags = ({ title, description, image, url }) => {
  const safeTitle = escapeHtmlAttribute(title);
  const safeDescription = escapeHtmlAttribute(description);
  const safeImage = escapeHtmlAttribute(image);
  const safeUrl = escapeHtmlAttribute(url);

  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:image" content="${safeImage}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    `<meta name="twitter:image" content="${safeImage}" />`,
  ].join("\n");
};
