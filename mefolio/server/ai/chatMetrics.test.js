import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { ChatMetrics, incrementChatQuestionCount } from "./chatMetrics.js";

if (Meteor.isServer) {
  describe("AI chat metrics", function () {
    it("atomically tracks questions from all recruiters", async function () {
      const metricsId = "all-recruiters";
      const originalMetrics = await ChatMetrics.findOneAsync(metricsId);
      const originalQuestionCount = originalMetrics?.questionCount || 0;
      const increments = 10;

      try {
        await Promise.all(
          Array.from({ length: increments }, () => incrementChatQuestionCount()),
        );

        const metrics = await ChatMetrics.findOneAsync(metricsId);
        expect(metrics.questionCount).to.equal(
          originalQuestionCount + increments,
        );
      } finally {
        if (originalMetrics) {
          await ChatMetrics.updateAsync(
            metricsId,
            { $set: { questionCount: originalQuestionCount } },
          );
        } else {
          await ChatMetrics.removeAsync(metricsId);
        }
      }
    });
  });
}
