import PropTypes from "prop-types";
import { Code, FileText } from "lucide-react";

const MODES = [
  {
    value: "standard",
    label: "Standard",
    description: "Base project card with title, derscription, and links.",
    Icon: FileText,
  },
  {
    value: "interactive",
    label: "Interactive",
    description: "Include a mini coding challenge visitors can attempt.",
    Icon: Code,
  },
];

/**
 * Proof of Work Section (Standard / Interactive Mode Toggle)
 * Interactive mode --> parent renders coding challenge fields
 */
const ProofOfWorkSection = ({ mode, onModeChange, children }) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">Proof of Work</h3>
        <p className="mt-1 text-xs text-muted">
          Choose how this project is presented on your portfolio.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Proof of Work mode"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {MODES.map(({ value, label, description, Icon }) => {
          const selected = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`pow-mode-${value}`}
              onClick={() => onModeChange(value)}
              className={`text-left rounded-xl border p-4 transition flex gap-3 items-start
                                ${
                                  selected
                                    ? "border-accent2 bg-selected"
                                    : "border-line bg-surface-fill hover:border-alt"
                                }`}
            >
              <Icon
                className={`h-5 w-5 mt-0.5 shrink-0 ${
                  selected ? "text-accent2" : "text-muted"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold ${
                    selected ? "text-accent2" : "text-primary"
                  }`}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {mode === "interactive" && children}
    </div>
  );
};

ProofOfWorkSection.propTypes = {
  mode: PropTypes.oneOf(["standard", "interactive"]).isRequired,
  onModeChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default ProofOfWorkSection;
