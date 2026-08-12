const ContactButtons = ({ portfolio }) => {
  // Resolve the resume link across all known fields: an uploaded resume
  // (recruiterInfo.resumeLinks), a single recruiterInfo.resumeLink, or the
  // older profile resume (cta.resumeUrl) so the preview keeps working for
  // portfolios created before the FEAT-05 resume-storage change.
  const resumeLink =
    (Array.isArray(portfolio?.recruiterInfo?.resumeLinks)
      ? portfolio.recruiterInfo.resumeLinks[0]?.url
      : portfolio?.recruiterInfo?.resumeLink) ||
    portfolio?.cta?.resumeUrl ||
    "";

  const email =
    portfolio?.bio?.email ||
    portfolio?.contact?.email ||
    portfolio?.socials?.email ||
    "";

  return (
    <div className="flex flex-wrap gap-4">
      <a
        href={email ? `mailto:${email}` : undefined}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-alt bg-alt/50 hover:bg-alt/20 rounded-lg transition-colors active:scale-[0.98]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
        Get in touch
      </a>

      {Boolean(resumeLink) && (
        <a
          href={resumeLink}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-primary bg-surface-fill border border-line hover:bg-muted hover:border-muted rounded-lg transition-colors active:scale-[0.98]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Resume
        </a>
      )}

      {Boolean(resumeLink) && (
        <a
          href={resumeLink}
          download
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-accent1 bg-accent1/50 hover:bg-accent1/20 rounded-lg transition-colors active:scale-[0.98]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Resume
        </a>
      )}
    </div>
  );
};

export default ContactButtons;
