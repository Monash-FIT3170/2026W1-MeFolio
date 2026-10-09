import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Loader2, Mic, Pause, Play, Square } from "lucide-react";

const requestNarration = (portfolioId, projectId) =>
  Meteor.callAsync("projects.getNarrationAudio", portfolioId, projectId);

/**
 * Custom audio player that lets visitors listen to a project's story.
 * Audio is only requested on the first Play so cards stay lightweight.
 */
export function NarrationPlayer({
  portfolioId,
  projectId,
  loadAudio = requestNarration,
}) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handlePlay = async () => {
    const audio = audioRef.current;
    setError("");
    try {
      if (!audio.getAttribute("src")) {
        setStatus("loading");
        audio.src = await loadAudio(portfolioId, projectId);
      }
      await audio.play();
      setStatus("playing");
    } catch (playError) {
      setStatus("idle");
      setError(
        playError?.reason ||
          "Sorry, the audio could not be played. Please try again.",
      );
    }
  };

  const handlePause = () => {
    audioRef.current.pause();
    setStatus("paused");
  };

  const handleStop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setStatus("idle");
  };

  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  return (
    <div className="mb-4" data-testid="narration-player">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-background p-2">
        <Mic className="ml-1 h-4 w-4 text-accent1" aria-hidden="true" />
        <span className="flex-1 text-sm font-bold text-primary">
          {isLoading ? "Loading audio..." : "Voice Summary"}
        </span>
        <button
          type="button"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isPlaying ? "Pause narration" : "Play narration"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-primary transition-colors hover:bg-primary hover:text-background disabled:cursor-wait disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={handleStop}
          disabled={status === "idle" || isLoading}
          aria-label="Stop narration"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-primary transition-colors hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-accent2">
          {error}
        </p>
      )}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setStatus("idle")}
        hidden
      />
    </div>
  );
}

NarrationPlayer.propTypes = {
  portfolioId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  loadAudio: PropTypes.func,
};
