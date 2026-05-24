import { useState, useRef } from "react";
import PropTypes from "prop-types";

const TECH_SUGGESTIONS = [
  "React",
  "Vue",
  "Angular",
  "Svelte",
  "Next.js",
  "Nuxt",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Laravel",
  "Spring Boot",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Firebase",
  "Supabase",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Tailwind CSS",
  "GraphQL",
  "REST",
];

export const TechStackInput = ({ value = [], onChange }) => {
  const [text, setText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const filtered = text.trim()
    ? TECH_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s),
      ).slice(0, 6)
    : [];

  const add = (tag) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const remove = (tag) => onChange(value.filter((v) => v !== tag));

  const onKey = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      if (text.trim()) add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg bg-white min-h-[44px] items-center cursor-text focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              aria-label={`Remove ${tag}`}
              className="text-indigo-500 hover:text-indigo-700 leading-none"
            >
              x
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={onKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={
            value.length === 0 ? "e.g. React, Node.js... press Enter" : ""
          }
          data-testid="tags-text-input"
          className="flex-1 min-w-[140px] border-none outline-none text-sm text-gray-900 bg-transparent"
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 py-1">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => add(s)}
              className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-indigo-50"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

TechStackInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default TechStackInput;
