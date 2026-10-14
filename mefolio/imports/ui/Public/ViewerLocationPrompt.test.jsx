import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { ViewerLocationPrompt } from "./ViewerLocationPrompt.jsx";

if (Meteor.isClient) {
  describe("ViewerLocationPrompt", function () {
    let originalGeolocation;
    let originalFetch;
    let originalCall;
    let methodCalls;

    beforeEach(function () {
      methodCalls = [];

      // Stub navigator.geolocation
      originalGeolocation = navigator.geolocation;
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: null, // set per test
        },
      });

      // Stub fetch (reverse-geocode)
      originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              city: "Sydney",
              countryCode: "AU",
            }),
        });

      // Stub Meteor.call and record invocations
      originalCall = Meteor.call;
      Meteor.call = (...args) => {
        methodCalls.push(args);
        // Invoke the callback with no error
        const cb = args[args.length - 1];
        if (typeof cb === "function") cb(null);
      };
    });

    afterEach(function () {
      cleanup();
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: originalGeolocation,
      });
      global.fetch = originalFetch;
      Meteor.call = originalCall;
    });

    it("renders the share button", function () {
      const { container } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      expect(container.textContent).to.contain("Share my location");
    });

    it("calls the record method with truncated coords and geocoded city on success", async function () {
      navigator.geolocation.getCurrentPosition = (onSuccess) => {
        onSuccess({
          coords: { latitude: -33.8765432, longitude: 151.2123456 },
        });
      };

      const { getByText } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      fireEvent.click(getByText("Share my location"));

      await waitFor(() => {
        expect(methodCalls.length).to.equal(1);
      });

      const [methodName, portfolioId, location] = methodCalls[0];
      expect(methodName).to.equal("portfolios.recordViewerLocation");
      expect(portfolioId).to.equal("abc123");
      // Truncated to 2dp
      expect(location.lat).to.equal(-33.88);
      expect(location.lng).to.equal(151.21);
      // Geocode data preserved
      expect(location.city).to.equal("Sydney");
      expect(location.countryCode).to.equal("AU");
    });

    it("shows success message after a successful share", async function () {
      navigator.geolocation.getCurrentPosition = (onSuccess) => {
        onSuccess({ coords: { latitude: -33.87, longitude: 151.21 } });
      };

      const { getByText, findByText } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      fireEvent.click(getByText("Share my location"));

      const done = await findByText(/Thanks/i);
      expect(done).to.exist;
    });

    it("shows an error when permission is denied", async function () {
      navigator.geolocation.getCurrentPosition = (_success, onError) => {
        onError({ code: 1, PERMISSION_DENIED: 1 }); // code 1 = denied
      };

      const { getByText, findByText } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      fireEvent.click(getByText("Share my location"));

      const err = await findByText(/denied/i);
      expect(err).to.exist;
      // No Meteor call on error
      expect(methodCalls.length).to.equal(0);
    });

    it("still sends coordinates if reverse-geocoding fails", async function () {
      global.fetch = () => Promise.reject(new Error("network down"));

      navigator.geolocation.getCurrentPosition = (onSuccess) => {
        onSuccess({ coords: { latitude: -33.87, longitude: 151.21 } });
      };

      const { getByText } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      fireEvent.click(getByText("Share my location"));

      await waitFor(() => {
        expect(methodCalls.length).to.equal(1);
      });

      const [, , location] = methodCalls[0];
      expect(location.lat).to.equal(-33.87);
      expect(location.lng).to.equal(151.21);
      expect(location.city).to.equal("");
      expect(location.countryCode).to.equal("");
    });

    it("shows an error when the browser lacks geolocation support", async function () {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: undefined,
      });

      const { getByText, findByText } = render(
        <ViewerLocationPrompt portfolioId="abc123" />,
      );
      fireEvent.click(getByText("Share my location"));

      const err = await findByText(/doesn't support/i);
      expect(err).to.exist;
    });
  });
}
