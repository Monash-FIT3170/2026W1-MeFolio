import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";

const ShareButton = ({
  portfolio,
  hasUnpublishedChanges = false,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const copyRef = useRef(null);
  const timerRef = useRef(null);
  const canShare = Boolean(portfolio?._id && portfolio.isPublished);
  const publicUrl = canShare
    ? `${window.location.origin}${portfolio.username ? `/u/${encodeURIComponent(portfolio.username)}` : `/${encodeURIComponent(portfolio._id)}/view`}`
    : "";

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!isOpen) return;
    copyRef.current?.focus();
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyStatus("idle"), 2500);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="share-portfolio-panel"
        onClick={() => {
          setCopyStatus("idle");
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-fill px-4 py-3 text-sm font-semibold text-alt transition-colors hover:bg-selected"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </button>

      {isOpen && (
        <div
          id="share-portfolio-panel"
          role="region"
          aria-label="Share portfolio"
          className={`absolute z-50 rounded-xl border border-line bg-surface-fill p-4 shadow-xl ${isMobile ? "left-0 top-full mt-2 w-full" : "left-full top-0 ml-8 w-80"}`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-primary">
              Share portfolio
            </h2>
            <button
              type="button"
              aria-label="Close sharing options"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="rounded-md p-1 text-muted hover:bg-selected hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {canShare ? (
            <>
              <p className="mb-3 text-xs text-muted">
                {hasUnpublishedChanges
                  ? "This link shows your published version. Publish to share your latest changes."
                  : "Your published portfolio"}
              </p>
              <input
                aria-label="Published portfolio URL"
                value={publicUrl}
                readOnly
                onFocus={(event) => event.target.select()}
                className="mb-3 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-primary"
              />
              <button
                ref={copyRef}
                type="button"
                data-testid="copy-public-link-btn"
                onClick={copyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-button px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-accent1"
              >
                {copyStatus === "copied" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copyStatus === "copied" ? "Copied!" : "Copy link"}
              </button>
              <p
                role={copyStatus === "error" ? "alert" : "status"}
                className="mt-2 text-xs text-muted"
              >
                {copyStatus === "error"
                  ? "Couldn't copy. Select the URL above and copy it manually."
                  : copyStatus === "copied"
                    ? "Link copied to clipboard."
                    : ""}
              </p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-sm font-medium text-alt hover:underline"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open live portfolio
              </a>
            </>
          ) : (
            <p className="text-sm text-muted">
              Publish your portfolio to get a shareable link.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

ShareButton.propTypes = {
  portfolio: PropTypes.object,
  hasUnpublishedChanges: PropTypes.bool,
  isMobile: PropTypes.bool,
};

export default ShareButton;
