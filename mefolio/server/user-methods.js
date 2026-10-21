import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { isPasswordValid } from "/imports/api/passwordRules";

if (Meteor.isServer) {
  Meteor.methods({
    async "users.register"(email, password, fullName) {
      check(email, String);
      check(password, String);
      check(fullName, String);

      if (!isPasswordValid(password)) {
        throw new Meteor.Error(
          "weak-password",
          "Password must be at least 8 characters, include a letter and a number, and not be a commonly used password.",
        );
      }

      return Accounts.createUserAsync({
        email: email.trim(),
        password,
        profile: { fullName: fullName.trim() },
      });
    },
  });

  // Public method, so cap sign-up attempts per connection
  DDPRateLimiter.addRule(
    { type: "method", name: "users.register", connectionId: () => true },
    5,
    60 * 1000,
  );
}

Accounts.config({ forbidClientAccountCreation: true });
