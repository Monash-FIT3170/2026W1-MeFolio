import { useState } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { MapPin } from "lucide-react";

// Small inline prompt on the public portfolio view letting a visitor share
// their location with the owner.
const ViewerLocationPrompt = ({ portfolioId }) => {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");

  const handleShare = () => {
    if (!portfolioId || status === "loading" || status === "done") return;

    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Your browser doesn't support location sharing.");
      return;
    }

    setStatus("loading");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Truncate to 2 decimal places for ~1km precision.
        const lat = Math.round(position.coords.latitude * 100) / 100;
        const lng = Math.round(position.coords.longitude * 100) / 100;
        let city = "";
        let countryCode = "";

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          );
          if (res.ok) {
            const data = await res.json();
            city = data.city || data.locality || "";
            countryCode = data.countryCode || "";
          }
        } catch {
          //Ignore reverse-geocoding error
        }

        Meteor.call(
          "portfolios.recordViewerLocation",
          portfolioId,
          { lat, lng, city, countryCode },
          (err, count) => {
            if (err || !count) {
              setStatus("error");
              setMessage("Couldn't save your location.");
              return;
            }
            setStatus("done");
            setMessage("Thanks! Your location was shared.");
          },
        );
      },
      (error) => {
        setStatus("error");
        setMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location sharing was denied."
            : "Couldn't get your location.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  if (status === "done") {
    return (
      <p className="text-xs text-muted">
        <MapPin className="inline h-3 w-3 mr-1" />
        {message}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-fill px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-background hover:text-accent2 disabled:opacity-50"
      >
        <MapPin className="h-3.5 w-3.5" />
        {status === "loading" ? "Getting location…" : "Share my location"}
      </button>
      {status === "error" && message && (
        <span className="text-xs text-muted">{message}</span>
      )}
    </div>
  );
};

ViewerLocationPrompt.propTypes = {
  portfolioId: PropTypes.string,
};

export default ViewerLocationPrompt;
