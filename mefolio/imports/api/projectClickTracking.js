import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import {
  PROJECT_CLICK_METHOD,
  PROJECT_CLICK_TARGETS,
} from "./projectEngagement";

// check if crypto.randomUUID is available, otherwise fallback to Random.id
export const createProjectClickEventId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return Random.id(24);
};

// This is the only transport-specific function. A separately hosted public
// frontend can replace this. When public HTTP endpoints can be used

// const httpTransport = (event) =>
//   fetch("https://api.example.com/project-clicks", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(event),
//     keepalive: true,
//   });

export const meteorProjectClickTransport = (event) =>
  Meteor.callAsync(PROJECT_CLICK_METHOD, event);

// returns track function
// track function receives click details
export const createProjectClickTracker =
  ({
    transport = meteorProjectClickTransport,
    createEventId = createProjectClickEventId,
  } = {}) =>
  ({ portfolioId, projectId, target }) => {
    if (!portfolioId || !projectId) {
      // id is missing
      return Promise.reject(
        new TypeError("A portfolio ID and project ID are required."),
      );
    }

    if (!PROJECT_CLICK_TARGETS.includes(target)) {
      return Promise.reject(new TypeError("Unsupported project click target."));
    }
    // event sent to server
    const event = {
      eventId: createEventId(),
      portfolioId,
      projectId,
      target,
    };

    return Promise.resolve(transport(event));
  };

export const trackProjectClick = createProjectClickTracker();
