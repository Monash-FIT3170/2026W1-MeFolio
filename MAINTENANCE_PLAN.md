# MeFolio Maintenance and Contribution Wind-Down Plan

Prepared: 12 October 2026. Scope: the repository at the time of this update and the transition after teaching Week 12.

## 1. Purpose and Decision Status

This plan describes how student contributions will end, how MeFolio can remain maintainable, and what must happen to production services after Week 12. Students have no obligation to provide ongoing development, support, on-call coverage or funding after the project ends.

The proposed operating model is **handover to an explicitly nominated project owner if ownership and funding are accepted; otherwise, controlled shutdown**. It is not a promise of indefinite availability. The repository does not establish a current billing owner, budget, hosting expiry date or agreed successor. These must be confirmed with the project stakeholder before Week 12 ends.

| Decision requiring stakeholder confirmation | Status at preparation |
| --- | --- |
| Accountable project owner and incoming technical maintainer | Not confirmed in repository |
| Production/staging URLs, Galaxy organisation and database provider | Existing README reports Galaxy hosting; live configuration not verified |
| Hosting, database, storage and domain costs; payer and renewal dates | Not confirmed; obtain actual account invoices and subscription details |
| Continue hosting or shut down, and the effective date | Proposed decision gate: end of Week 12; stakeholder approval pending |
| Data retention/deletion policy, user notice period and backup custodian | Must be approved before transfer or shutdown |

Record the named owner, payer, approved budget, decision date and service end/renewal dates in this document before sign-off. Do not put passwords, API tokens, private connection strings or billing details in Git.

## 2. Current Technical Baseline

The following findings come from the current code/configuration, not a live production audit:

- [Meteor release](mefolio/.meteor/release) pins Meteor `3.4`. The [application package](mefolio/package.json) uses React 18, React Router, Tailwind, Rspack, Mocha/Chai, ESLint and Prettier. Docker and CI use Node 20; this base must be reviewed against current security support and Meteor compatibility before future releases.
- [Docker Compose](mefolio/docker-compose.yml) starts the application on port `3000` and MongoDB 7 on host port `3001`. MongoDB data is retained in `mongo_data`. The [Dockerfile](mefolio/Dockerfile) runs `meteor run`, mounts development files through Compose and is not a production-hardened image.
- [Server startup](mefolio/server/main.js) registers OAuth, portfolio methods/publications, indexes, recruiter tokens/visit notifications and GitHub integration. It also creates a sample account with a fixed password and seeds sample data. Disable production seeding and remove or secure any existing seeded account before continued public operation; changing its password alone is not sufficient if startup can recreate it.
- [OAuth configuration](mefolio/server/oauth-login/oauth.js) loads Google and GitHub credentials from private Meteor settings. [GitHub API integration](mefolio/server/github-api.js) optionally uses `private.github.apiToken`, and is subject to external API availability and rate limits.
- [Resume storage](mefolio/imports/api/files/resumeFiles.js) stores PDF files under `uploads/resumes`, with a 5 MB upload limit, and declares public downloads. Database backups alone do not preserve these files. A successor must verify durable production storage, download access/privacy expectations and file recovery. The repository does not configure a production object-storage service.
- The checked-in [test workflow](.github/workflows/CI-Tests.yml) and [lint/format workflow](.github/workflows/CI-Linter-Formatter.yml) run on PRs to `main` and `dev`. They do not deploy the app. Any Galaxy deployment automation or branch protections must be confirmed in account/repository settings rather than assumed.

## 3. Winding Down Contributions

| When | Action | Responsibility before transition |
| --- | --- | --- |
| Before the end of Week 12 | Stop accepting new feature commitments; triage open issues into release blockers, known limitations and future work. Link unresolved work in GitHub issues. | Outgoing team |
| Before final release | Complete or close outstanding PRs, run CI, perform login/portfolio/recruiter/resume smoke checks, and record the release commit and known limitations. | Outgoing team with release reviewer |
| Before access transfer | Finish the [handover README](README.md), export its submission PDF, prepare the service inventory, and demonstrate setup/deployment and a backup restore to the incoming maintainer. | Outgoing team and accepting maintainer |
| By the Week 12 decision gate | Obtain written acceptance of ownership, operating budget and data responsibilities, or approve shutdown and user notification dates. | Project stakeholder/account owner |
| At transfer or shutdown | Transfer authorised account administration securely; rotate credentials, remove departing access, and disable obsolete automation. | Account owner and incoming maintainer, if appointed |
| After Week 12 | Students' contribution and support commitments end. Future work is voluntary and follows the README's PR strategy; only an appointed maintainer may approve releases. | Successor, if appointed |

Use GitHub issues as the future technical work register. Do not make personal student email addresses the ongoing support mechanism or assume that former contributors will answer requests. The stakeholder must publish a successor-controlled support contact if the service continues.

## 4. Production Systems After Week 12

### Option A: Funded Continuation

Only continue production when a named owner accepts billing, security, backups, privacy and incident response responsibilities. Before continuation:

1. Confirm Galaxy app identifiers/URLs, database provider and connection settings, domains/DNS, OAuth application owners, storage location, billing contacts and renewal dates in a restricted operations register.
2. Transfer organisation-based access where supported and use individual authorised accounts/MFA. Rotate OAuth secrets, GitHub API tokens, database credentials and deployment credentials after transfer. Verify callback URLs and public `ROOT_URL` for each environment.
3. Resolve the fixed-password startup account and seed-data blocker. Review the runtime's security support, database exposure, public resume downloads and durable file storage. Do not use the development Compose setup as an internet-facing production service.
4. Take and restore-test a database backup and a matching resume-file backup. Verify that uploads survive a redeploy/restart on the hosting platform.
5. Record a tested production deployment procedure, last working release, rollback route, alert recipient and support contact. Re-run the smoke checks after transfer.
6. Disable routine staging deployment and shut down paid staging resources after final acceptance unless the successor explicitly budgets for them. Recreate staging for future changes when needed.

There is no proposed service-level agreement or guaranteed uptime from the outgoing team. A successor must explicitly agree any support hours and recovery objectives before making availability promises to users.

### Option B: No Accepted Owner or Funding

If ownership/funding is not accepted by the decision gate, do not allow subscriptions to renew silently or leave an unattended service public. The existing account owner must approve and execute a shutdown schedule:

1. Notify users of the approved end date, loss of access to published portfolio/recruiter links and the available process for retrieving their data. Agree retention/deletion requirements with the stakeholder; do not invent an indefinite retention period.
2. Freeze changes and user writes for a consistent final export. Securely back up MongoDB and uploaded resumes, test restoration, and record the custodian, access controls and approved deletion date.
3. Stop production and staging applications and disable any deployment triggers. Remove public routing or provide a suitable closure notice where feasible.
4. Cancel hosting, database and storage subscriptions only after the backup/export and notice requirements are satisfied. Review domain auto-renewal separately: retain/transfer or cancel it deliberately.
5. Revoke unused credentials and departing user access. Delete personal data and backups when the approved retention period ends, and record completion.
6. Keep a sanitised source repository, release tag, handover documents and known-issues register available to the authorised successor. Archive the repository only if no future maintainer is expected and the stakeholder approves.

Shutdown preserves the ability to restart from source and authorised backups; it does not preserve live public URLs, OAuth sessions or guaranteed third-party integration behaviour.

## 5. Running Costs and Who Bears Them

**Yes, continued hosted operation can incur costs.** Local execution does not require purchasing an application licence, but consumes the operator's hardware, electricity and network resources. Cloud free tiers or educational credits may expire and must not be assumed to cover operation after Week 12.

| Cost area | What must be checked | Proposed payer after Week 12 |
| --- | --- | --- |
| Meteor Galaxy or replacement application hosting | Active plan, app/container count, staging, usage, credit expiry and renewal terms | Accepting project owner/sponsor |
| Hosted MongoDB | Actual provider, storage, backups, traffic and plan/credit limits | Accepting project owner/sponsor |
| Uploaded resumes and backup storage | Persistent storage, backup capacity, retention and restore/transfer charges | Accepting project owner/sponsor |
| Domain/DNS, if used | Registrar, renewal date and any paid DNS/TLS services | Accepting domain/project owner |
| CI and external integrations | GitHub Actions quotas, optional GitHub API access and provider terms; no separate paid email service is established by the inspected visit-notification code | Successor organisation if charges arise |
| Maintenance labour | Security updates, incident handling and future development | Successor's agreed staff/volunteer arrangement; no student commitment |

The outgoing students are **not committing to bear future costs**. The accepting stakeholder/organisation should bear approved costs, but no named payer or funding agreement is verified here. Existing account holders must check their present billing liability with their providers and transfer or cancel it explicitly; this plan does not itself change a billing contract.

Before approval, calculate the recurring total from actual subscriptions (hosting + database + storage/backups + applicable domain/CI costs), record currency/taxes, expiry dates and a spending cap, and nominate a billing-alert recipient. If no payer accepts those costs, use Option B. No unverified price estimate is presented as a current bill.

## 6. Minimum Maintenance if Hosting Continues

These are proposed duties for the accepting maintainer, not automated features or completed checks:

| Frequency/trigger | Maintenance action |
| --- | --- |
| Daily automated checks, reviewed on alerts | Check application availability, errors, database/storage capacity and backup completion. Configure an alerting service; none is established by the inspected deployment files. |
| Daily backups and before releases | Back up database and resume files securely. Apply the stakeholder-approved retention period and encryption/access controls. |
| Weekly | Review incidents, OAuth/GitHub failures, recruiter-token access issues and billing/usage alerts. |
| Monthly | Review dependency/runtime security advisories, hosting credits/renewals and user access. Test patches in staging and submit a PR with CI evidence. |
| Quarterly and before major changes | Restore database and resume backups in an isolated environment; record recovery time and smoke-test critical workflows. |
| Every release | Use semantic versioning, pass CI, back up state, document data changes/rollback and test both authorised and unauthorised access. |
| Security incident | Restrict affected access, preserve necessary evidence securely, rotate compromised secrets, and follow the owner's notification/privacy obligations. |

For a failed release, stop further deployment and redeploy the last verified release. Restore data/files only when necessary and after considering writes since the backup; incompatible schema changes need an explicit migration/rollback plan. Never use `docker compose down -v` as production recovery.

## 7. Handover Acceptance Checklist

- [ ] Named owner, maintainer, payer and support contact recorded and accepted.
- [ ] Continue/shutdown decision, effective dates and approved budget documented.
- [ ] Account/service inventory and access transferred securely; departing access removed.
- [ ] Production sample-account/seeding risk resolved, or service remains offline.
- [ ] Durable resume storage and its privacy/access behaviour reviewed.
- [ ] Database and resume backups restored successfully; retention and deletion approved.
- [ ] Release tag/commit, deployment and rollback steps, CI results and known issues recorded.
- [ ] Hosting/database/domain renewals and credit expiry checked; unnecessary staging cancelled.
- [ ] Updated README and submission PDF reviewed; AI statements in non-handover documents reviewed.

## Generative AI Statement

Generative AI (GitHub Copilot) was used to draft and structure this maintenance plan and to summarise the repository files referenced above. No live hosting accounts, invoices, stakeholder agreements or production data were accessed to verify operational ownership or costs. The team must review the technical descriptions, confirm the pending decisions and approve the plan before submission or implementation.