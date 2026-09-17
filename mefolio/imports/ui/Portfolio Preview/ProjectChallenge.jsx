import { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Play } from "lucide-react";
import { runInSandbox } from "./runInSandbox";
import CodeBlock from "../Projects Editor/CodeBlock";
import getLanguageFromTechStack from "../Projects Editor/techToLanguage";

// The interactive Mini Challenge shown on a project card. The visitor edits the
// snippet and runs it; the code executes in a sandboxed Web Worker
// (runInSandbox), and the captured output is sent to the server, which compares
// it to the expected result (never shipped to the client).
export function ProjectChallenge({ project, dataTheme = "default" }) {
  const challenge = project?.challenge;
  const projectId = project?._id || project?.id;
  const language = getLanguageFromTechStack(project?.technologies);

  const [code, setCode] = useState(challenge?.starterCode || "");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  // null | "correct" | "incorrect" | "error" | "timeout"
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  if (!challenge) return null;

  const handleSubmit = async () => {
    setRunning(true);
    setStatus(null);
    setOutput("");
    setMessage("");

    const result = await runInSandbox(code);

    if (result.timedOut) {
      setRunning(false);
      setStatus("timeout");
      setMessage("Your code took too long — check for an infinite loop.");
      return;
    }
    if (result.error) {
      setRunning(false);
      setStatus("error");
      setMessage(result.error);
      return;
    }

    setOutput(result.output);
    Meteor.call(
      "validate_challenge_completion",
      projectId,
      result.output,
      (error, res) => {
        setRunning(false);
        if (error) {
          setStatus("error");
          setMessage(error.reason || "Unable to check your solution.");
          return;
        }
        setStatus(res?.completed ? "correct" : "incorrect");
      },
    );
  };

  return (
    <div className="ml-6 mb-3 space-y-3">
      <p className="text-[11px] font-semibold text-accent2">
        {challenge.title}
        {challenge.language ? ` · ${challenge.language}` : ""}
      </p>

      {challenge.hint && (
        <p className="text-[11px] text-muted">Hint: {challenge.hint}</p>
      )}

      <textarea
        aria-label="Challenge code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        rows={5}
        spellCheck={false}
        className="w-full rounded-lg border border-line bg-surface-fill p-2 font-mono text-xs text-primary"
      />

      {code.trim() && (
        <CodeBlock code={code} language={language} dataTheme={dataTheme} />
      )}

      <p className="text-[11px] text-muted">
        Your last line&apos;s value — or anything you <code>console.log</code> —
        is checked.
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={running}
        className="w-full py-2 flex items-center justify-center gap-2 bg-primary text-background rounded-lg font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Play className="w-3.5 h-3.5 fill-background" />
        {running ? "Running…" : "Submit Solution"}
      </button>

      {output && (
        <pre className="whitespace-pre-wrap rounded-lg bg-surface-fill p-2 text-[11px] text-primary">
          Output: {output}
        </pre>
      )}

      {status === "correct" && (
        <p className="text-xs font-bold text-accent1">Correct!</p>
      )}
      {status === "incorrect" && (
        <p className="text-xs font-bold text-primary">Not quite yet!</p>
      )}
      {(status === "error" || status === "timeout") && message && (
        <p role="alert" className="text-xs font-bold text-primary">
          {message}
        </p>
      )}
    </div>
  );
}

ProjectChallenge.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
    challenge: PropTypes.shape({
      title: PropTypes.string,
      language: PropTypes.string,
      hint: PropTypes.string,
      starterCode: PropTypes.string,
    }),
  }),
  dataTheme: PropTypes.string,
};

export default ProjectChallenge;
