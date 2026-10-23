# MeFolio Maintenance and Contribution Wind-Down Plan

Prepared: 12 October 2026. Updated: 20 October 2026. Scope: the repository at the time of this update and the transition after the semester ends.

## 1. Purpose and Decision Status

This plan describes how student contributions will end, what happens to the hosted services, and how anyone can restart MeFolio later. Students have no obligation to provide ongoing development, support, on-call coverage or funding after the project ends.

**Decision: MeFolio stays live and maintained until final semester results on 3 December 2026. On or after 4 December 2026 it is shut down, because no one is paying for hosting after that date.** The system architects (Joy Jasmine Kaur, Joyce Leung and Jonah Rudzki) carry out the shutdown using the steps in [section 4](#4-shutdown-plan-on-or-after-4-december-2026).

The shutdown is not a dead end. The source code, a database backup and the Piper image are kept, and [section 5](#5-restarting-mefolio-later) explains how anyone can bring MeFolio back at any later point by taking over billing. As agreed with the tutor (12 Oct 2026), that future owner is not named in advance, because it cannot be known who will take it on.

| Decision | Status |
| --- | --- |
| System architects and code maintainers | Joy Jasmine Kaur (@JkGiThuB821), Jonah Rudzki (@jonahrudzki) and Joyce Leung (@jyc-leung02), recorded in [CODEOWNERS](.github/CODEOWNERS) |
| Hosting | Meteor Galaxy hosts the app and its MongoDB database. Staging: <https://mefolio-staging.sandbox.galaxycloud.app/login>. Production: <https://mefolio-production.sandbox.galaxycloud.app/login> |
| Voice narration (Piper) | Runs separately on Azure Container Apps (Azure for Students subscription), from the Docker Hub image `jask1/mefolio-piper:v1`. Live in production until 3 December 2026. See [section 6](#6-voice-narration-piper) |
| Service period | Live and maintained until final results on **3 December 2026** |
| Shutdown | On or after **4 December 2026**, by the system architects, because there is no payer for hosting after the semester |
| Payer | An outgoing team member's card pays for Galaxy until shutdown, after which it is removed. No payer after shutdown. A future owner who restarts MeFolio takes over billing (agreed with the tutor, 12 Oct 2026) |
| Data at shutdown | The production database is backed up, then deleted with the app. The backup is stored in the MeFolio admin account's storage (for example its Google Drive), never in Git, and deleted after 12 months (by 4 December 2027) if no one restarts MeFolio |
| Piper at shutdown | The Azure Container App is deleted. The public Docker Hub image is kept so Piper can be redeployed quickly |


## 2. Current Technical Baseline

- [Meteor release](mefolio/.meteor/release) pins Meteor `3.4`. The [application package](mefolio/package.json) uses React 18, React Router, Tailwind, Rspack, Mocha/Chai, ESLint and Prettier. Docker and CI use Node 20; this base must be reviewed against current security support and Meteor compatibility before future releases.
- [Docker Compose](mefolio/docker-compose.yml) starts the application on port `3000`, MongoDB 7 on host port `3001` and the Piper narration service on Docker's private network. MongoDB data is retained in `mongo_data`. The [Dockerfile](mefolio/Dockerfile) runs `meteor run`, mounts development files through Compose and is not a production-hardened image.
- [Server startup](mefolio/server/main.js) registers OAuth, portfolio methods/publications, indexes, recruiter tokens/visit notifications, GitHub integration and project narration. It also creates a sample account with a fixed password and seeds sample data. Anyone restarting MeFolio must disable production seeding and remove or secure the seeded account first; changing its password alone is not sufficient if startup can recreate it.
- [OAuth configuration](mefolio/server/oauth-login/oauth.js) loads Google and GitHub credentials from private Meteor settings. [GitHub API integration](mefolio/server/github-api.js) optionally uses `private.github.apiToken`, and is subject to external API availability and rate limits. Similarly, [Gemini API](mefolio/server/ai/gemini.js) optionally uses `private.gemini.apiKey`, and is subject to external API availability and rate limits.
- [Resume storage](mefolio/imports/api/files/resumeFiles.js) stores PDF files under `uploads/resumes`, with a 5 MB upload limit, and declares public downloads. Database backups do not include these files, and files written to a Galaxy container's disk are not guaranteed to survive a redeploy. The repository does not configure a production object-storage service.
- [Project narration](mefolio/server/project-narration.js) sends narration text to a Piper text-to-speech service over HTTP. It is optional and can be switched off without affecting anything else (see [section 6](#6-voice-narration-piper)).
- The checked-in [test workflow](.github/workflows/CI-Tests.yml) and [lint/format workflow](.github/workflows/CI-Linter-Formatter.yml) run on PRs to `main` and `dev`. They do not deploy the app.

## 3. Winding Down Contributions

| When | Action | Responsibility |
| --- | --- | --- |
| Until 3 December 2026 | Keep staging and production running for marking. Fix only issues that block assessment. | System architects |
| On or after 4 December 2026 | Carry out the [shutdown plan](#4-shutdown-plan-on-or-after-4-december-2026). | System architects |
| After shutdown | Students' contribution and support commitments end. Future work is voluntary and follows the README's PR strategy. | Future owner, if any |

Use GitHub issues as the future technical work register. Do not make personal student email addresses the ongoing support mechanism or assume that former contributors will answer requests.

## 4. Shutdown Plan (on or after 4 December 2026)

The system architects carry out these steps in order. Do not cancel billing before the backup in step 2 is complete and verified.

1. **Notify users.** If anyone other than the team uses MeFolio, tell them the closure date at least a week before, and that published portfolio and recruiter links will stop working.
2. **Back up the production database.** Copy the `MONGO_URL` connection string from the production app's Galaxy settings, install the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/), and run:

   ```sh
   mongodump --uri "<MONGO_URL>" --gzip --archive=mefolio-production-2026-12-04.archive.gz
   ```

   Check that the archive restores into a local MongoDB (for example the Docker Compose one on port `3001`):

   ```sh
   mongorestore --uri "mongodb://localhost:3001" --gzip --archive=mefolio-production-2026-12-04.archive.gz
   ```

   Upload the archive to the MeFolio admin account's storage (for example its Google Drive). Never commit it to Git. Record the backup date and its deletion date (4 December 2027) in this document.
3. **Stop and delete the Galaxy apps.** In the Galaxy dashboard, stop the production and staging apps, then delete them along with their hosted databases.
4. **Remove billing.** Remove the outgoing team member's card from the Galaxy account, and confirm that no plan, add-on or database remains that could still charge.
5. **Delete the Azure Piper service.** In the Azure portal, delete the `mefolio-tts` resource group. This removes the Container App, its environment and its log workspace in one step. Keep the Docker Hub image `jask1/mefolio-piper`.
6. **Revoke credentials.** Delete or rotate the production Google and GitHub OAuth app secrets and any GitHub API token, so the old settings files become useless.
7. **Keep the repository.** Leave the repository, this plan, the README and the Docker Hub image available so MeFolio can be restarted later. Archive the repository only if the team agrees no one will continue it.
8. **On 4 December 2027:** if no one has restarted MeFolio, delete the database backup from the admin account's storage and note the deletion here.

Shutdown keeps the ability to restart from source, the backup and the Piper image. It does not keep the live URLs, user sessions or uploaded resume files.

## 5. Restarting MeFolio Later

Anyone can restart MeFolio at any point by taking over billing. These instructions apply whenever that happens.

### 5.1 Take over the accounts and billing

The Galaxy account logs in with the MeFolio admin email. As agreed with the tutor (12 Oct 2026), the future owner is not named in advance: whoever takes over deployment takes over billing.

1. Get access to the MeFolio admin email and Galaxy account from the system architects through a secure channel, never through Git or a shared document. Move the admin email's recovery details and multi-factor authentication to yourself.
2. Add yourself as an account administrator and add your own or your organisation's card as the billing method.
3. Change the account password, and set a billing alert or spending cap.

Card numbers, passwords and invoices must not be recorded in this repository.

### 5.2 Bring the app back

1. Resolve the sample-account and seed-data issue in [section 2](#2-current-technical-baseline) before going public.
2. Create new OAuth apps (Google and GitHub) with callback URLs for the new app address, and put their credentials in the production settings file.
3. Deploy with the README's Galaxy deployment runbook, using a settings file kept outside Git.
4. Restore the database backup, if it still exists, with `mongorestore --uri "<new MONGO_URL>" --gzip --archive=<backup file>`.
5. To bring narration back, follow [section 6.4](#64-hosting-piper). Otherwise leave it switched off with the kill switch in [section 6.3](#63-switching-narration-off).
6. Run the smoke checks: login, portfolio editing and publishing, public portfolio, recruiter link, resume upload and narration.

There is no service-level agreement or guaranteed uptime from the outgoing team. A future owner must agree any support hours and recovery objectives themselves before making availability promises to users.

## 6. Voice Narration (Piper)

[Piper](https://github.com/OHF-Voice/piper1-gpl) is a free, open-source text-to-speech engine. MeFolio uses it to read a short narration of each project aloud. Because it is a separate open-source service run by us rather than a paid API, it can go down or be removed independently, so narration is built to be optional: it can be switched off at any time without affecting anything else in MeFolio.

### 6.1 How it works

1. A visitor presses play on a project card. The browser asks the MeFolio server for audio; it never contacts Piper directly.
2. The server checks that narration is switched on, picks the project's narration text, and sends that text and the chosen voice to Piper's `/synthesize` endpoint.
3. Piper returns WAV audio, which the server passes back to the browser. The server keeps recent audio in memory, so replaying the same narration in the same voice is instant.

The narration text is the project's **custom case-study narration** when the owner has switched custom narration on, otherwise the **project description**. Custom narration text never reaches visitors' browsers; they only receive the audio.

Visitors can choose from three voices, defined in [narrationVoices.js](mefolio/imports/api/narrationVoices.js) and downloaded into the image by [piper/Dockerfile](mefolio/piper/Dockerfile): US female (`en_US-lessac-medium`), US male (`en_US-ryan-medium`) and UK male (`en_GB-alan-medium`).

If Piper is down or slow, the player shows an error message, the server stops waiting after 60 seconds, and the rest of the portfolio keeps working.

### 6.2 Configuration

The server finds Piper through the first of these that is set:

1. `private.piper.url` in the Meteor settings file
2. the `PIPER_URL` environment variable (on Galaxy, under `galaxy.meteor.com` → `env` in the app settings)
3. `http://127.0.0.1:5000/synthesize` (local default)

Locally, Docker Compose sets `PIPER_URL` to `http://piper:5000/synthesize`. That address only works inside Docker's private network: a deployed app needs the full HTTPS address of a separately hosted Piper service, ending in `/synthesize`.

### 6.3 Switching narration off

There are three switches, from widest to narrowest:

| Switch | Who uses it | Effect |
| --- | --- | --- |
| **Site-wide kill switch**: set `"public": { "features": { "projectNarration": false } }` in the Meteor settings and redeploy | Whoever deploys MeFolio | Narration disappears everywhere: no players, no narration fields, and the server never calls Piper. Use this if Piper is unavailable or not hosted |
| **Portfolio switch**: the "Narration" switch in the builder's Projects tab | Each portfolio owner | Turns narration off for their portfolio. Applies to the draft preview immediately and to the live portfolio on the next publish |
| **Custom narration switch**: on each project card in the builder | Each portfolio owner | Chooses whether that project reads its custom case study or its description |

### 6.4 Hosting Piper

Piper runs from the public Docker Hub image `jask1/mefolio-piper:v1`, which already contains all three voices. Any container host that provides an HTTPS address can run it. To redeploy it on Azure Container Apps, as used until 3 December 2026:

1. In the Azure portal, create a **Container App** with a new **Consumption** environment. Pick a region your subscription allows that is close to the Galaxy app's region (Azure for Students only allows certain regions).
2. **Container:** image source **Docker Hub or other registries**, image type **Public**, registry `docker.io`, image `jask1/mefolio-piper:v1`, **1 CPU and 2 Gi memory**.
3. **Ingress:** enabled, accepting traffic from anywhere, type **HTTP**, target port **5000**.
4. **Scale:** max replicas `1`. Min replicas `0` stays within the free monthly grant, but the first narration after an idle period can take more than 60 seconds while Piper starts, so that one request fails. Min replicas `1` avoids this but is billed continuously.
5. Set a budget alert in **Cost Management**.
6. Copy the app's URL and set `PIPER_URL` in the Galaxy app settings to `https://<app URL>/synthesize`, then redeploy MeFolio.

Measured with the `v1` image: Piper starts in about 8 seconds and narrates a paragraph in about 20–30 seconds on 1 CPU, using about 1 GB of memory with all three voices loaded. Hosts with less than 1 GB of memory or a fraction of a CPU (for example Render's free tier) are too small: the narration takes longer than the 60-second limit and loading a second voice runs out of memory.

### 6.5 Updating Piper

To change voices or the Piper version:

1. Edit [piper/Dockerfile](mefolio/piper/Dockerfile) and [narrationVoices.js](mefolio/imports/api/narrationVoices.js) together; every voice offered in the app must be downloaded in the image.
2. Build and push a new version tag (from the `mefolio` folder):

   ```sh
   docker build --platform linux/amd64 -t <dockerhub-user>/mefolio-piper:v2 ./piper
   docker push <dockerhub-user>/mefolio-piper:v2
   ```

3. Point the hosted container at the new tag and redeploy it. Hosts do not pick up a new image automatically.

Use a new tag for every change rather than overwriting an existing one, so a faulty release can be rolled back by switching the tag back.

### 6.6 Known limitations

- The Piper endpoint has no authentication. Anyone who finds its URL could use it, which is why the URL is kept out of this repository. A future owner should add a shared-secret check before relying on it long term.
- Narrations near the 5,000-character limit can exceed the 60-second timeout on 1 CPU.
- A Piper that is missing a requested voice silently falls back to its default voice. Rebuild the image whenever voices change.

## 7. Running Costs and Who Bears Them

**Hosting costs money, and no one is paying for it after 3 December 2026.** Free tiers and student credits expire and must not be assumed to cover operation.

| Cost area | Until 3 December 2026 | After shutdown / on restart |
| --- | --- | --- |
| Meteor Galaxy app hosting (staging and production) | Paid by an outgoing team member's card | Removed at shutdown. A future owner pays on restart |
| Galaxy-hosted MongoDB | Included with the Galaxy apps | Deleted at shutdown, after the backup |
| Database backup storage | Not applicable | Free, in the MeFolio admin account's storage; deleted by 4 December 2027 |
| Piper on Azure Container Apps | Azure for Students credit and free monthly grant | Deleted at shutdown. A future owner hosts it on their own subscription, or leaves narration switched off |
| Docker Hub image | Free public repository | Kept, free |
| CI (GitHub Actions) and external APIs | GitHub's free quotas; optional GitHub and Credly APIs | Unchanged; only used if development continues |
| Gemini AI | Free tier using key from personal Google AI projects | Deleted at shutdown. Future owner may re-enable using their own credentials |
| Maintenance labour | Outgoing team, until 3 December 2026 | No student commitment after shutdown |

The outgoing students are **not committing to bear any cost after 3 December 2026**. Anyone restarting MeFolio should check the current Galaxy and Azure prices before taking over billing.

## 8. Minimum Maintenance if MeFolio Is Restarted

These are proposed duties for a future maintainer, not automated features or completed checks:

| Frequency/trigger | Maintenance action |
| --- | --- |
| Daily automated checks, reviewed on alerts | Check application availability, errors, database/storage capacity and backup completion. No alerting service is set up in the repository. |
| Daily backups and before releases | Back up the database and resume files securely, with an agreed retention period and access controls. |
| Weekly | Review incidents, OAuth/GitHub failures, recruiter-token access issues, narration errors and billing/usage alerts. |
| Monthly | Review dependency/runtime security advisories, hosting credits/renewals and user access. Test patches in staging and submit a PR with CI evidence. |
| Quarterly and before major changes | Restore database and resume backups in an isolated environment and smoke-test critical workflows. |
| Every release | Use semantic versioning, pass CI, back up state, document data changes/rollback and test both authorised and unauthorised access. |
| Security incident | Restrict affected access, rotate compromised secrets, and follow the owner's notification/privacy obligations. |

For a failed release, stop further deployment and redeploy the last verified release. Restore data only when necessary; incompatible schema changes need an explicit migration/rollback plan. Never use `docker compose down -v` as production recovery.

## 9. Checklist

### Restart (future owner)

- [ ] Admin email and Galaxy account transferred; own card added; password changed; billing alert set.
- [ ] Sample-account and seed-data issue resolved before going public.
- [ ] New OAuth apps and settings file created outside Git.
- [ ] Database restored from backup, if available.
- [ ] Piper hosted and `PIPER_URL` set, or narration switched off with the kill switch.
- [ ] Smoke checks passed on staging, then production.

## Generative AI Statement

Generative AI was used in preparing this plan. GitHub Copilot was used for structuring the original plan and summarising the repository files referenced above. Claude was used to review the shutdown and restart sections, and update this plan with the team's decisions. No live hosting accounts, invoices or production data were accessed by either tool. The service URLs, dates and decisions were supplied by the team, who reviewed and approved this plan.
