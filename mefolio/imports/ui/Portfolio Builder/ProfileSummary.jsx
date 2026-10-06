import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut, UserRound } from "lucide-react";
import { Meteor } from "meteor/meteor";

// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile, onAccountSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    menuRef.current?.querySelector("button")?.focus();
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setError("");
    Meteor.logout((logoutError) => {
      setIsLoggingOut(false);
      if (logoutError) {
        setError("Couldn't log out. Please try again.");
      } else {
        setIsOpen(false);
      }
    });
  };

  const handleMenuKeyDown = (event) => {
    const buttons = Array.from(
      menuRef.current.querySelectorAll("button:not(:disabled)"),
    );
    const index = buttons.indexOf(document.activeElement);
    let next;
    if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowUp")
      next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 border-t border-line p-4"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          id="account-menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-line bg-surface-fill p-2 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              triggerRef.current?.focus();
              onAccountSettings?.();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-primary hover:bg-selected"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Account Settings
          </button>
          <div role="separator" className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="account-menu"
        onClick={() => {
          setError("");
          setIsOpen(!isOpen);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="flex w-full items-center gap-3 rounded-lg bg-background p-3 text-left transition-colors hover:bg-selected"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-button border border-secondary text-sm font-bold text-secondary">
          {profile.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-semibold text-primary">
            {profile.name}
          </p>
          <span className="block truncate text-xs text-primary">
            {profile.email}
          </span>
        </div>
        <ChevronUp
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

ProfileSummary.propTypes = {
  profile: PropTypes.shape({
    initials: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onAccountSettings: PropTypes.func,
};

export default ProfileSummary;
