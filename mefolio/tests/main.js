import assert from "assert";

import "meteor/accounts-base";
import "meteor/accounts-password";

import "/imports/ui/LoginPage.test.jsx";
import "/imports/ui/ForgotPasswordPage.test.jsx"; 
import "/imports/api/account.test.js";
import "/imports/api/session.test.js";

describe("mefolio", function () {
  it("package.json has correct name", async function () {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "mefolio");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});