import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useRecruiterSession } from '../../api/useRecruiterSession';

/**
 * Route guard for /recruiter/:username/view.
 *
 * Renders `children` only when a valid, unexpired recruiter access
 * token exists in localStorage. Otherwise redirects back to the
 * access-code screen at /recruiter/:username.
 *
 * The token is set elsewhere (RecruiterLoginPage.jsx) after a
 * successful Meteor.call('recruiter.verifyAccess', ...) via
 * useRecruiterSession().login(token, expiresAt).
 */
export function RecruiterAccessGate({ children }) {
  const { username } = useParams();
  const { isValid } = useRecruiterSession();

  if (!isValid) {
    return <Navigate to={`/recruiter/${username}`} replace />;
  }

  return <>{children}</>;
}

export default RecruiterAccessGate;
