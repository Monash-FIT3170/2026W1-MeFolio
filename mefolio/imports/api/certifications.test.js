import { expect } from "chai";
import {
  normalizeCertification,
  normalizeCertifications,
} from "./certifications.js";

describe("normalizeCertification", function () {
  it("keeps all provided string fields", function () {
    expect(
      normalizeCertification({
        title: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        issueDate: "2025-01-15",
        imageUrl: "https://img.example.com/badge.png",
        verificationUrl: "https://verify.example.com/abc",
        source: "credly",
        verified: true,
      }),
    ).to.deep.equal({
      title: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      issueDate: "2025-01-15",
      imageUrl: "https://img.example.com/badge.png",
      verificationUrl: "https://verify.example.com/abc",
      source: "credly",
      verified: true,
      lastSyncedAt: null,
    });
  });

  it("defaults missing fields to safe empty values", function () {
    expect(normalizeCertification({})).to.deep.equal({
      title: "",
      issuer: "",
      issueDate: "",
      imageUrl: "",
      verificationUrl: "",
      source: "manual",
      verified: false,
      lastSyncedAt: null,
    });
  });

  it("defaults an unknown source to manual", function () {
    expect(normalizeCertification({ source: "linkedin" }).source).to.equal(
      "manual",
    );
    expect(normalizeCertification({ source: 42 }).source).to.equal("manual");
  });

  it("treats verified as a strict boolean (only true is true)", function () {
    expect(normalizeCertification({ verified: "true" }).verified).to.equal(
      false,
    );
    expect(normalizeCertification({ verified: 1 }).verified).to.equal(false);
    expect(normalizeCertification({ verified: true }).verified).to.equal(true);
  });

  it("serialises a Date issueDate to an ISO string", function () {
    const date = new Date("2025-03-02T00:00:00.000Z");
    expect(normalizeCertification({ issueDate: date }).issueDate).to.equal(
      "2025-03-02T00:00:00.000Z",
    );
  });

  it("coerces a non-string, non-Date issueDate to an empty string", function () {
    expect(normalizeCertification({ issueDate: 12345 }).issueDate).to.equal("");
  });

  it("keeps a Date lastSyncedAt and nulls anything else", function () {
    const syncedAt = new Date();
    expect(
      normalizeCertification({ lastSyncedAt: syncedAt }).lastSyncedAt,
    ).to.equal(syncedAt);
    expect(
      normalizeCertification({ lastSyncedAt: "2025-01-01" }).lastSyncedAt,
    ).to.equal(null);
  });
});

describe("normalizeCertifications", function () {
  it("maps every entry through normalizeCertification", function () {
    const result = normalizeCertifications([
      { title: "One", source: "credly", verified: true },
      { title: "Two" },
    ]);
    expect(result).to.have.lengthOf(2);
    expect(result[0].source).to.equal("credly");
    expect(result[0].verified).to.equal(true);
    expect(result[1].source).to.equal("manual");
    expect(result[1].verified).to.equal(false);
  });

  it("returns an empty array for a non-array input", function () {
    expect(normalizeCertifications(undefined)).to.deep.equal([]);
    expect(normalizeCertifications(null)).to.deep.equal([]);
    expect(normalizeCertifications("nope")).to.deep.equal([]);
  });
});
