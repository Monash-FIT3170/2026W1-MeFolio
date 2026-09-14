/**
 * Maps a project's tech stack to a Prism language id.
 */
const TECH_TO_LANGUAGE = {
  // Web / JS family
  react: "jsx",
  "react native": "jsx",
  next: "jsx",
  "next.js": "jsx",
  vue: "markup",
  nuxt: "markup",
  svelte: "markup",
  angular: "typescript",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  node: "javascript",
  "node.js": "javascript",
  express: "javascript",
  meteor: "javascript",
  graphql: "graphql",
  // Backend
  python: "python",
  django: "python",
  flask: "python",
  fastapi: "python",
  java: "java",
  "spring boot": "java",
  kotlin: "kotlin",
  ruby: "ruby",
  rails: "ruby",
  php: "php",
  laravel: "php",
  go: "go",
  golang: "go",
  rust: "rust",
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",
  swift: "swift",
  // Markup / style
  html: "markup",
  css: "css",
  scss: "scss",
  sass: "scss",
  "tailwind css": "css",
  // Data
  sql: "sql",
  postgresql: "sql",
  postgres: "sql",
  mysql: "sql",
  mongodb: "javascript",
  // Config / shell
  docker: "docker",
  bash: "bash",
  shell: "bash",
  yaml: "yaml",
  json: "json",
};

/**
 * @param {string[]} technologies
 * @returns {string} Prism language id, defaults to "text"
 */
export const getLanguageFromTechStack = (technologies = []) => {
  if (!Array.isArray(technologies)) return "text";

  for (const tech of technologies) {
    if (typeof tech !== "string") continue;
    const key = tech.trim().toLowerCase();
    if (TECH_TO_LANGUAGE[key]) return TECH_TO_LANGUAGE[key];
  }
  return "text";
};

export default getLanguageFromTechStack;
