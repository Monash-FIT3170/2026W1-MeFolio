import { Meteor } from "meteor/meteor";
import { useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { useParams } from "react-router-dom";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioContent } from "../Portfolio Preview/PortfolioContent.jsx";
import { getPublishedTheme } from "../Portfolio Preview/publishedTheme.js";

/**
 * FEAT-12: the portfolio as a visitor sees it.
 *
 * Reached at /:portfolioId/view with no login. It renders the same
 * presentation the owner previews in the dashboard, minus the dashboard
 * controls - a visitor has no draft to preview, nothing to publish and no
 * dashboard to go back to.
 *
 * Only the snapshot taken at publish time is shown, never the live draft, so
 * edits in progress stay private until the owner publishes them again.
 */
export const PublicPortfolioPage = () => {
  const { portfolioId } = useParams();

  const { isLoading, publishedContent } = useTracker(() => {
    const publicViewHandle = Meteor.subscribe(
      "portfolios.publicView",
      portfolioId,
    );
    const viewerHandle = Meteor.subscribe("portfolios.viewer", portfolioId);
    const portfolio = PortfolioCollection.findOne({ _id: portfolioId });

    // The publication withholds unpublished portfolios, but an owner signed in
    // elsewhere in the app has their own draft in minimongo already. Checking
    // isPublished here keeps this route showing the same thing to everyone.
    return {
      isLoading: !publicViewHandle.ready() || !viewerHandle.ready(),
      publishedContent: portfolio?.isPublished
        ? portfolio.publishedContent
        : null,
    };
  }, [portfolioId]);

  useEffect(() => {
    if (isLoading || !publishedContent || !portfolioId) return undefined;

    const sendHeartbeat = () => {
      Meteor.call("portfolios.viewerHeartbeat", portfolioId, (error) => {
        if (error) console.error("Failed to send viewer heartbeat:", error);
      });
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    return () => clearInterval(heartbeatInterval);
  }, [isLoading, portfolioId, publishedContent]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p
          data-testid="public-portfolio-loading"
          className="text-lg text-muted"
        >
          Loading portfolio...
        </p>
      </div>
    );
  }

  // An unknown id and an unpublished portfolio are deliberately indistinguishable:
  // whether a given id exists is not something a visitor gets to find out.
  if (!publishedContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div
          data-testid="public-portfolio-unavailable"
          className="w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-bold text-primary">
            Portfolio not available
          </h1>
          <p className="mt-3 text-muted">
            This portfolio does not exist, or it has not been published yet.
          </p>
        </div>
      </div>
    );
  }

  // The app shell applies the signed-in owner's theme, which for a visitor is
  // no theme at all. Re-applying the snapshot's own theme here overrides that
  // for everything inside; the background and font utilities have to be
  // repeated rather than inherited, since an inherited font-family arrives
  // already resolved against the outer theme.
  return (
    <div
      data-testid="public-portfolio-view"
      data-theme={getPublishedTheme(publishedContent.theme)}
      className="min-h-screen bg-background font-main"
    >
      <PortfolioContent
        portfolio={publishedContent}
        projects={publishedContent.projects || []}
      />
    </div>
  );
};

export default PublicPortfolioPage;
