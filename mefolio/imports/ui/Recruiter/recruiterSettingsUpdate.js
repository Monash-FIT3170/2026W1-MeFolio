// Pure logic for saving RecruiterPortal settings, kept free of the client
// collection and React so it can be unit-tested without a browser test bundle.

// Recruiter settings the owner can edit from the Recruiter Portal form.
export const EDITABLE_RECRUITER_FIELDS = [
  "companyName",
  "salaryExpectation",
  "phoneNumber",
  "currentLocation",
  "availability",
  "personalNote",
  "allowAccess",
  "accessCode",
];

// Builds a `portfolios.update` payload using dotted keys so only the edited
// fields are $set. Setting the whole `recruiterInfo` object would replace the
// subdocument and wipe fields saved elsewhere, such as uploaded resumeLinks.
export const buildRecruiterSettingsUpdate = (recruiterInfo) =>
  Object.fromEntries(
    EDITABLE_RECRUITER_FIELDS.map((field) => [
      `recruiterInfo.${field}`,
      recruiterInfo[field],
    ]),
  );
