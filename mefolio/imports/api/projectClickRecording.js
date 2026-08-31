import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";
import {
  ProjectEngagement,
  PROJECT_CLICK_TARGETS,
} from "/imports/api/projectEngagement";

const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const MAX_DATABASE_ID_LENGTH = 128;

const validateDatabaseId = (value, label) => {
  if (!value || value.length > MAX_DATABASE_ID_LENGTH) {
    throw new Meteor.Error("project-click.invalid-id", `${label} is invalid.`);
  }
};

const isDuplicateKeyError = (error) =>
  error?.code === 11000 ||
  error?.error === 11000 ||
  error?.cause?.code === 11000;

export const recordProjectClick = async (event) => {
  check(event, {
    eventId: String,
    portfolioId: String,
    projectId: String,
    target: Match.OneOf(...PROJECT_CLICK_TARGETS),
  });

  const { eventId, portfolioId, projectId, target } = event;

  if (!EVENT_ID_PATTERN.test(eventId)) {
    throw new Meteor.Error(
      "project-click.invalid-event-id",
      "The click event ID is invalid.",
    );
  }

  validateDatabaseId(portfolioId, "Portfolio ID");
  validateDatabaseId(projectId, "Project ID");

  const portfolio = await PortfolioCollection.findOneAsync(portfolioId, {
    fields: {
      isPublished: 1,
      "publishedContent.projects._id": 1,
    },
  });

  const projectIsInPublishedSnapshot =
    portfolio?.isPublished === true &&
    Array.isArray(portfolio?.publishedContent?.projects) &&
    portfolio.publishedContent.projects.some(
      (publishedProject) => publishedProject?._id === projectId,
    );

  if (!projectIsInPublishedSnapshot) {
    throw new Meteor.Error(
      "project-click.not-available",
      "The project is not available in this portfolio.",
    );
  }

  const recordedAt = new Date();

  try {
    await ProjectEngagement.insertAsync({
      _id: eventId,
      eventId,
      portfolioId,
      project_id: projectId,
      target,
      clicks: 1,
      date: recordedAt,
      schemaVersion: 1,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { eventId, recorded: false, duplicate: true };
    }

    throw error;
  }

  return { eventId, recorded: true, duplicate: false, recordedAt };
};
