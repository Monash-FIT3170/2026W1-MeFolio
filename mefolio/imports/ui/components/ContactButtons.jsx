
const ContactButtons = ({ portfolio }) => {
  const resumeLink = Array.isArray(portfolio?.recruiterInfo?.resumeLinks)
    ? portfolio.recruiterInfo.resumeLinks[0]?.url || ""
    : portfolio?.recruiterInfo?.resumeLink || "";

  const email =
    portfolio?.bio?.email ||
    portfolio?.contact?.email ||
    portfolio?.socials?.email ||
    "";

  return (
    <div className="flex flex-wrap gap-4">
      <a
        href={email ? `mailto:${email}` : undefined}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors active:scale-[0.98]"
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
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors active:scale-[0.98]"
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
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors active:scale-[0.98]"
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
