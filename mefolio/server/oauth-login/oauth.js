import { Meteor } from "meteor/meteor";
import { ServiceConfiguration } from "meteor/service-configuration";

Meteor.startup(async () => {
  const google = Meteor.settings?.private?.google;
  const github = Meteor.settings?.private?.github;

  if (google) {
    await ServiceConfiguration.configurations.upsertAsync(
      { service: "google" },
      {
        $set: {
          clientId: Meteor.settings.private.google.clientId,
          secret: Meteor.settings.private.google.secret,
          loginStyle: "popup",
        },
      },
    );
  }

  if (github) {
    await ServiceConfiguration.configurations.upsertAsync(
      { service: "github" },
      {
        $set: {
          clientId: Meteor.settings.private.github.clientId,
          secret: Meteor.settings.private.github.secret,
          loginStyle: "popup",
        },
      },
    );
  }
});
