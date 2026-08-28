import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";
import { PortfolioProjectsCollection } from "/imports/api/portfolioProjects";
import {
  ProjectEngagement,
  PROJECT_CLICK_TARGETS,
} from "/imports/api/projectEngagement";
import { ProjectCollection } from "./projects";

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

  const [portfolio, project, portfolioProject] = await Promise.all([
    PortfolioCollection.findOneAsync(portfolioId, {
      fields: { projects: 1 },
    }),
    ProjectCollection.findOneAsync(projectId, { fields: { _id: 1 } }),
    PortfolioProjectsCollection.findOneAsync(
      { portfolioId, projectId },
      { fields: { _id: 1 } },
    ),
  ]);

  const projectIsInPortfolio =
    Boolean(portfolioProject) ||
    (Array.isArray(portfolio?.projects) &&
      portfolio.projects.includes(projectId));

  if (!portfolio || !project || !projectIsInPortfolio) {
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
