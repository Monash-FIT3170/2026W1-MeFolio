import { expect } from "chai";
import {
  escapeHtmlAttribute,
  getBaseUrlFromRequest,
  getPortfolioMeta,
  getPublicPortfolioIdFromPath,
  normalizeDescription,
  renderPortfolioMetaTags,
} from "./publicPortfolioMetaHelpers.js";

if (Meteor.isServer) {
  describe("public portfolio meta helpers", function () {
    it("extracts only public portfolio view ids", function () {
      expect(getPublicPortfolioIdFromPath("/abc123/view")).to.equal("abc123");
      expect(getPublicPortfolioIdFromPath("/abc%20123/view")).to.equal(
        "abc 123",
      );
      expect(getPublicPortfolioIdFromPath("/recruiter/abc123/view")).to.equal(
        null,
      );
      expect(getPublicPortfolioIdFromPath("/login")).to.equal(null);
    });

    it("builds the public base url from forwarded headers", function () {
      expect(
        getBaseUrlFromRequest({
          headers: {
            host: "localhost:3000",
            "x-forwarded-proto": "https",
          },
        }),
      ).to.equal("https://localhost:3000");
    });

    it("uses published content for title, description, and preview image", function () {
      const meta = getPortfolioMeta(
        {
          title: "Jane Doe Portfolio",
          bio: "Frontend developer and designer.",
          profile: { avatarUrl: "" },
          theme: "terminal-retro",
          projects: [{ media: "https://example.com/project.png" }],
        },
        "https://mefolio.example",
      );

      expect(meta).to.deep.equal({
        title: "Jane Doe Portfolio",
        description: "Frontend developer and designer.",
        image: "https://example.com/project.png",
      });
    });

    it("falls back to an absolute theme preview image", function () {
      const meta = getPortfolioMeta(
        {
          title: "Jane Doe Portfolio",
          profile: { fullName: "Jane Doe" },
          theme: "modern-saas",
          projects: [],
        },
        "https://mefolio.example",
      );

      expect(meta.description).to.equal("Jane Doe's portfolio");
      expect(meta.image).to.equal(
        "https://mefolio.example/modern-saas-preview.png",
      );
    });

    it("escapes generated tags", function () {
      const html = renderPortfolioMetaTags({
        title: 'A "great" <portfolio>',
        description: "Design & development",
        image: "https://example.com/image.png",
        url: "https://example.com/portfolio/view",
      });

      expect(escapeHtmlAttribute('A "great" <portfolio>')).to.equal(
        "A &quot;great&quot; &lt;portfolio&gt;",
      );
      expect(html).to.include(
        '<meta property="og:title" content="A &quot;great&quot; &lt;portfolio&gt;" />',
      );
      expect(html).to.include(
        '<meta property="og:description" content="Design &amp; development" />',
      );
    });

    it("renders the required Open Graph and Twitter preview tags", function () {
      const html = renderPortfolioMetaTags({
        title: "Sample Portfolio",
        description: "This is a sample portfolio.",
        image: "https://mefolio.example/default-preview.png",
        url: "https://mefolio.example/abc123/view",
      });

      expect(html).to.include("<title>Sample Portfolio</title>");
      expect(html).to.include(
        '<meta property="og:title" content="Sample Portfolio" />',
      );
      expect(html).to.include(
        '<meta property="og:image" content="https://mefolio.example/default-preview.png" />',
      );
      expect(html).to.include(
        '<meta name="twitter:card" content="summary_large_image" />',
      );
      expect(html).to.include(
        '<meta name="twitter:image" content="https://mefolio.example/default-preview.png" />',
      );
    });

    it("normalizes long descriptions for share previews", function () {
      const longDescription = `Frontend developer
        building portfolio tools with a lot of extra whitespace. ${"x".repeat(220)}`;

      const description = normalizeDescription(longDescription);

      expect(description).to.have.lengthOf(180);
      expect(description).to.not.include("\n");
      expect(description).to.not.match(/\s{2,}/);
    });
  });
}
