import PropTypes from "prop-types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { getPublishedTheme } from "../Portfolio Preview/publishedTheme";

const THEME_STYLES = {
  default: oneLight,
  "terminal-retro": vscDarkPlus,
  "modern-saas": oneDark,
  minimalist: oneLight,
};

/**
 * Used for syntax highlighting code snippets
 */
const CodeBlock = ({ code, language = "text", dataTheme = "default" }) => {
  // Resolve through getPublishedTheme so legacy/unknown theme ids (e.g. the old
  // "minimal") map to the same style the page's [data-theme] uses.
  const style = THEME_STYLES[getPublishedTheme(dataTheme)] || oneLight;

  return (
    <div className="rounded-lg overflow-hidden border border-line">
      <SyntaxHighlighter
        language={language}
        style={style}
        customStyle={{
          margin: 0,
          padding: "0.75rem 1rem",
          fontSize: "0.75rem",
          background: "var(--theme-surface-fill)",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, "IBM Plex Mono", Menlo, monospace',
          },
        }}
        wrapLongLines
      >
        {code ?? ""}
      </SyntaxHighlighter>
    </div>
  );
};

CodeBlock.propTypes = {
  code: PropTypes.string,
  language: PropTypes.string,
  dataTheme: PropTypes.string,
};

export default CodeBlock;
