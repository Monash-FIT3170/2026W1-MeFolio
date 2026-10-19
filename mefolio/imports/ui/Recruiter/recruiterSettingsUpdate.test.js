import { expect } from "chai";
import {
  EDITABLE_RECRUITER_FIELDS,
  buildRecruiterSettingsUpdate,
} from "/imports/ui/Recruiter/recruiterSettingsUpdate";

// Saving recruiter settings must only touch the edited fields, otherwise the
// whole recruiterInfo subdocument (including uploaded resumes) is replaced.
describe("buildRecruiterSettingsUpdate (recruiter settings save)", () => {
  const recruiterInfo = {
    companyName: "Acme",
    salaryExpectation: "100k",
    phoneNumber: "0400 000 000",
    currentLocation: "Melbourne",
    availability: "Immediate",
    personalNote: "Hi",
    allowAccess: true,
    accessCode: "abc123",
  };

  it("uses dotted recruiterInfo keys instead of a whole recruiterInfo object", () => {
    const update = buildRecruiterSettingsUpdate(recruiterInfo);

    expect(update).to.not.have.property("recruiterInfo");
    expect(update["recruiterInfo.phoneNumber"]).to.equal("0400 000 000");
    expect(update["recruiterInfo.allowAccess"]).to.equal(true);
  });

  it("includes every editable field and nothing else", () => {
    const update = buildRecruiterSettingsUpdate({
      ...recruiterInfo,
      resumeLinks: [{ name: "cv.pdf", url: "/cv.pdf" }],
    });

    expect(Object.keys(update)).to.have.members(
      EDITABLE_RECRUITER_FIELDS.map((field) => `recruiterInfo.${field}`),
    );
  });
});
