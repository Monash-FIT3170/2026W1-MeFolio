import { fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Meteor } from "meteor/meteor";
import AiTwinConfiguration from "./AiTwinConfiguration.jsx";

if (Meteor.isClient) {
  describe("AiTwinConfiguration chatbot personality", () => {
    beforeEach(() => {
      Meteor.call = (_methodName, _portfolioId, _updates, callback) => {
        callback?.(null);
      };
    });

    it("defaults to professional and saves the selected personality", () => {
      const calls = [];
      Meteor.call = (...args) => {
        calls.push(args);
        args[3]?.(null);
      };

      render(
        <AiTwinConfiguration
          portfolioId="test-portfolio-id"
          configuration={{ documents: [] }}
        />,
      );

      const selector = screen.getByTestId("field-chatbot-persona");
      expect(selector.value).to.equal("professional");

      fireEvent.change(selector, { target: { value: "casual" } });
      fireEvent.click(screen.getByTestId("btn-save-chatbot-persona"));

      expect(calls[0][0]).to.equal("portfolios.update");
      expect(calls[0][1]).to.equal("test-portfolio-id");
      expect(calls[0][2]).to.deep.equal({ chatbotPersona: "casual" });
      expect(screen.getByRole("status").textContent).to.include(
        "Publish your portfolio",
      );
    });

    it("loads the saved personality", () => {
      render(
        <AiTwinConfiguration
          portfolioId="test-portfolio-id"
          configuration={{ documents: [] }}
          chatbotPersona="friendly"
        />,
      );

      expect(screen.getByTestId("field-chatbot-persona").value).to.equal(
        "friendly",
      );
    });
  });
}
