import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Loader2, Mic, Pause, Play, Square } from "lucide-react";
import { NARRATION_VOICES, DEFAULT_VOICE_ID } from "../../api/narrationVoices";

const VOICE_STORAGE_KEY = "mefolio.narrationVoice";

const readSavedVoice = () => {
  try {
    const saved = window.localStorage.getItem(VOICE_STORAGE_KEY);
    return NARRATION_VOICES.some((voice) => voice.id === saved)
  ? saved
  : DEFAULT_VOICE_ID;
  } catch {
    return DEFAULT_VOICE_ID;
  }
};

const requestNarration = (portfolioId, projectId, voiceId) =>
  Meteor.callAsync("projects.getNarrationAudio", portfolioId, projectId, voiceId);

// Formats seconds as m:ss. Durations the browser can't report yet (NaN or
// Infinity before metadata loads) show as 0:00.
export const formatNarrationTime = (seconds) => {
  const total =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voiceId, setVoiceId] = useState(readSavedVoice);
  const requestId = useRef(0);

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
    const token = requestId.current;
    setError("");
    try {
      if (!audio.getAttribute("src")) {
        setStatus("loading");
        const src = await loadAudio(portfolioId, projectId, voiceId);
        if (token !== requestId.current) return;
        audio.src = src;
      }
      await audio.play();
      setStatus("playing");
    } catch (playError) {
      if (token !== requestId.current) return;
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
    setCurrentTime(0);
    setStatus("idle");
  };

  const handleTimeUpdate = (event) => setCurrentTime(event.target.currentTime);
  const handleDurationChange = (event) => {
    const { duration: audioDuration } = event.target;
    setDuration(Number.isFinite(audioDuration) ? audioDuration : 0);
  };
  const handleEnded = () => {
    setCurrentTime(0);
    setStatus("idle");
  };

  const handleVoiceChange = (event) => {
    const next = event.target.value;
    if (!NARRATION_VOICES.some((voice) => voice.id === next)) return;

    requestId.current += 1;
    const audio = audioRef.current;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setStatus("idle");
    setError("");
    setVoiceId(next);
    try {
      window.localStorage.setItem(VOICE_STORAGE_KEY, next);
    } catch {
      // storage unavailable
    }
  };

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const showProgress = status === "playing" || status === "paused";
  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="mb-4" data-testid="narration-player">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-background p-2">
        <Mic className="ml-1 h-4 w-4 text-accent1" aria-hidden="true" />
        <span className="flex-1 text-sm font-bold text-primary">
          {isLoading ? "Loading audio..." : "Voice Summary"}
        </span>
        <select aria-label="Narration voice"
        value={voiceId}
        onChange={handleVoiceChange}
        disabled={isLoading}
        className="h-9 rounded-lg border border-line bg-background px-2 text-xs font-semibold text-primary disabled:cursor-wait disabled:opacity-50"
        >
          {NARRATION_VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.label}
              </option>
            ))}
            </select>
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
      {showProgress && (
        <div className="mt-2 flex items-center gap-2 px-1">
          <div
            role="progressbar"
            aria-label="Narration progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatNarrationTime(currentTime)} of ${formatNarrationTime(duration)}`}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/30"
          >
            <div
              data-testid="narration-progress-fill"
              className="h-full rounded-full bg-accent1 transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            data-testid="narration-time"
            className="shrink-0 text-xs font-semibold tabular-nums text-muted"
          >
            {formatNarrationTime(currentTime)} / {formatNarrationTime(duration)}
          </span>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-accent2">
          {error}
        </p>
      )}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleDurationChange}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
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
