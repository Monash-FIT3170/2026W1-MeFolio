import PropTypes from "prop-types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// Register only the languages getLanguageFromTechStack can produce, instead of
// the full Prism build (~290 languages). Each module pulls its own Prism deps
// (e.g. jsx -> javascript + markup), so we only list the ids we map to.
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import graphql from "react-syntax-highlighter/dist/esm/languages/prism/graphql";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import {
  oneLight,
  oneDark,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { getPublishedTheme } from "../Portfolio Preview/publishedTheme";

const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  docker,
  go,
  graphql,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  markup,
  php,
  python,
  ruby,
  rust,
  scss,
  sql,
  swift,
  typescript,
  yaml,
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  SyntaxHighlighter.registerLanguage(name, definition);
});

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
