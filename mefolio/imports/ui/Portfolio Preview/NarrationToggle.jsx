import PropTypes from "prop-types";
import { Mic } from "lucide-react";

export function NarrationToggle({ enabled, onChange, fullWidth = false }) {
  return (
    <div
      className={`flex h-10 box-border min-w-0 ${
        fullWidth ? "w-full" : "w-44"
      } items-center justify-between rounded-xl border border-line bg-surface-fill px-3`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <Mic className="h-4 w-4 shrink-0 text-accent1" aria-hidden="true" />
        <span className="truncate text-sm font-semibold text-primary">
          Narration
        </span>
      </span>
      <label className="ml-2 inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          role="switch"
          checked={enabled}
          aria-label="Enable voice narration"
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted/40 px-0.5 transition-colors peer-checked:bg-accent1 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent1 peer-focus-visible:ring-offset-2"
        >
          <span
            data-testid="narration-switch-thumb"
            className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </label>
    </div>
  );
}

NarrationToggle.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
};
