import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { fetchCredlyBadges } from "./credly-api.js";

if (Meteor.isServer) {
  describe("fetchCredlyBadges", function () {
    let originalFetch;

    beforeEach(function () {
      originalFetch = globalThis.fetch;
    });

    afterEach(function () {
      globalThis.fetch = originalFetch;
    });

    it("maps a Credly badge to a certification", async function () {
      globalThis.fetch = async (url) => {
        expect(String(url)).to.equal(
          "https://www.credly.com/users/test-user/badges.json",
        );

        return {
          status: 200,
          ok: true,
          json: async () => ({
            data: [
              {
                id: "badge-123",
                issued_at_date: "2026-01-10",
                issuer: { entities: [{ entity: { name: "Example Issuer" } }] },
                badge_template: {
                  name: "Example Badge",
                  image_url: "https://example.com/badge.png",
                },
              },
            ],
          }),
        };
      };

      const badges = await fetchCredlyBadges("test-user");

      expect(badges).to.have.lengthOf(1);
      expect(badges[0]).to.include({
        title: "Example Badge",
        issuer: "Example Issuer",
        issueDate: "2026-01-10",
        imageUrl: "https://example.com/badge.png",
        verificationUrl: "https://www.credly.com/badges/badge-123",
        source: "credly",
        verified: true,
      });
      expect(badges[0].lastSyncedAt).to.be.instanceOf(Date);
    });
  });
}
