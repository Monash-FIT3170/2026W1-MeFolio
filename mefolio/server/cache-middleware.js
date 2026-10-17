export const PUBLIC_PORTFOLIO_PATH_REGEX =
  /^\/(u\/[^/?#]+|[a-zA-Z0-9]{17}\/view)(\/|\?|#|$)/;

export const shouldCachePortfolioView = (req) => {
  return (
    (req.method === "GET" || req.method === "HEAD") &&
    PUBLIC_PORTFOLIO_PATH_REGEX.test(req.url)
  );
};

export const applyCacheHeaders = (res) => {
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("Vary", "Accept-Encoding");
};
