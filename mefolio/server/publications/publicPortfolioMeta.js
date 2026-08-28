import { Meteor } from "meteor/meteor";
import { onPageLoad } from "meteor/server-render";
import { PortfolioCollection } from "/imports/api/portfolio";
import {
  getBaseUrlFromRequest,
  getPortfolioMeta,
  getPublicPortfolioIdFromPath,
  renderPortfolioMetaTags,
} from "./publicPortfolioMetaHelpers.js";

onPageLoad(async (sink) => {
  const portfolioId = getPublicPortfolioIdFromPath(sink.request?.url);
  if (!portfolioId) return;

  const portfolio = await PortfolioCollection.findOneAsync(
    { _id: portfolioId, isPublished: true },
    { fields: { publishedContent: 1 } },
  );

  if (!portfolio?.publishedContent) return;

  const headers =
    typeof sink.getHeaders === "function" ? sink.getHeaders() : null;
  const baseUrl =
    getBaseUrlFromRequest(sink.request, headers) ||
    Meteor.absoluteUrl().replace(/\/$/, "");
  const pageUrl = `${baseUrl}/${portfolioId}/view`;
  const meta = getPortfolioMeta(portfolio.publishedContent, baseUrl);

  sink.appendToHead(
    `\n${renderPortfolioMetaTags({ ...meta, url: pageUrl })}\n`,
  );
});
