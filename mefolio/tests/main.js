import assert from "assert";

import "meteor/accounts-base";
import "meteor/accounts-password";

import "/imports/ui/Login/LoginPage.test.jsx";
import "/imports/ui/Login/ForgotPasswordPage.test.jsx";
import "/imports/api/account.test.js";
import "/imports/api/session.test.js";
import "/imports/api/projectClickTracking.test.js";
import "/imports/ui/Portfolio Preview/ProjectCard.test.jsx";
import "/imports/ui/Portfolio Preview/PortfolioPreview.test.jsx";
import "/imports/ui/Contexts/ResponsiveContext.test.jsx";
import "/imports/ui/Recruiter/RecruiterLoginPage.test.jsx";
import "/imports/ui/Public/PublicPortfolioPage.test.jsx";
import "/imports/ui/Recruiter/recruiterVisitAlertLogic.test.js";
import "/server/recruiter-tokens/methods.test.js";
import "/server/publications/publicPortfolio.test.js";
import "/server/publications/publicPortfolioMeta.test.js";
import "/imports/ui/Login/SignUpPage.test.jsx";
import "/server/recruiter-tokens/verifytokens.test.js";
import "/server/recruiter-tokens/visit-notifications.test.js";
import "/server/portfolio-methods.test.js";
import "/server/github-methods.test.js";
import "/server/portfolios.byUsername.test.js";
import "/server/github-api.test.js";
import "/server/github-methods.test.js";
import "/imports/api/projects.test.js";
import "../imports/ui/Portfolio Builder/VisitHistorySection.test.jsx";

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
