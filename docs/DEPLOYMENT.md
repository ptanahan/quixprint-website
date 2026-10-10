# Replace the existing Quixprint website

Production handoff — October 10, 2026. This package keeps the approved Revision 14 design and preserves Churches. No deployment, account change, or real email send has been performed here.

## 1. Back up and hold the current site

Open the existing Quixprint Netlify project. Record its currently published deploy ID and current build settings. In Deploys, select **Lock to stop auto publishing**. Builds continue, but they will not automatically replace the public website.

In GitHub Desktop, select the repository connected to that Netlify project and its production branch (check the branch in Netlify rather than assuming its name). Fetch/Pull the latest changes. Resolve or save any existing local edits first. Copy the repository folder to a separate backup location outside the working repository. Keep the existing Netlify environment variables, domain settings, and Brevo sender settings.

Do not change GoDaddy DNS or email records. The existing domain stays attached to the same Netlify project.

## 2. Set Netlify environment variables

In the existing project's configuration, open Environment variables. Set these for the Production deploy context. If scopes are available, include Functions; selecting all scopes is fine. Set before pushing the replacement so the new deploy picks them up.

| Variable | Production value |
| --- | --- |
| SITE_MODE | live |
| QUOTE_MODE | live |
| BREVO_API_KEY | Existing valid Brevo API key used for transactional email; not an SMTP password |
| QUOTE_FROM | A sender email address already verified in Brevo, normally sales@quixprint.com |
| CHURCH_QUOTE_FROM | Keep the existing value unchanged |

If QUOTE_FROM is omitted, the new handler falls back to the existing CHURCH_QUOTE_FROM. Preserve all other existing Churches settings. Never put secrets in source files or GitHub commits.

For branch/Deploy Preview contexts, set SITE_MODE and QUOTE_MODE to preview if configuring per-context runtime values. The new endpoint also checks Netlify's native deployment context and will not send mail outside production. The preserved Churches endpoint retains its original behavior; do not assume its preview submissions are disabled when credentials are available.

netlify.toml sets live production build values and preview build values for other contexts. It does not supply runtime secrets or runtime mode values. Do not create a CONTEXT environment variable: the handler uses Netlify's native context.deploy.context.

## 3. Copy the deployment source into the existing repository

Extract Quixprint-Production-Deploy.zip. Open its Quixprint-Production-Deploy folder. Copy its CONTENTS into the local repository's root, replacing matching website files and folders. Keep the repository's .git directory. Do not put the entire extracted folder inside another folder in the repository. Include the supplied .gitignore.

The root must now contain package.json, netlify.toml, src, scripts, data, lib, legacy-site, artwork, netlify, tests, and docs. Copy the entire supplied netlify folder, including both quote functions. The build's Churches source is legacy-site/churches; do not replace it with an empty directory. Old top-level static files are not published because the new publish directory is dist.

Do not commit the ZIP itself, .env files, node_modules, generated dist, or the standalone preview HTML. The supplied .gitignore excludes generated files. Review GitHub Desktop's Changes list and ensure no secrets are included.

## 4. Confirm build settings and push

Repository base directory: root (blank). Build command: npm run build. Publish directory: dist. Functions directory: netlify/functions. Node version: 22.

The supplied root netlify.toml sets command, publish directory, Node version, and functions directory. Clear any old base/package directory pointing to a different folder. Confirm the project still uses the existing production branch and repository.

In GitHub Desktop, commit the changes with a message such as “Launch redesigned Quixprint website,” then Push origin. Netlify should build automatically; if it does not, trigger a deploy from the production branch. Leave the old deploy locked while reviewing.

## 5. Review the successful deployment

Open the new successful deploy's unique URL. Check desktop and mobile layouts, Products hover menu and click navigation, product options, artwork version quantities, cart editing, checkout labels, journal article links, legal pages, and /churches/.

The production quote endpoint only accepts requests originating on quixprint.com or www.quixprint.com. Do not use the unique netlify.app URL to judge live form delivery: its submission is intentionally rejected. GA is also inactive on that URL. Perform the real submission and GA checks on the canonical domain immediately after publishing.

If the build fails, the locked current site remains online. Read the deploy log and fix the reported failure before publishing.

## 6. Publish

On the approved new deploy's detail page, select Publish deploy. This replaces the site served at the existing domain. Keep auto publishing locked until the live checks below pass.

## 7. Test on the real domain

- Open https://quixprint.com and https://www.quixprint.com; verify HTTPS and expected primary-domain behavior.
- Make one clearly marked TEST quote with two products and different artwork-version quantities, using an email address you control. Include a small supported artwork file under 3 MB.
- Confirm the sales notification arrives at sales@quixprint.com with the correct specifications, quantities, and attachment. Confirm the customer acknowledgement arrives at your test address and does not include internal purchasing notes or artwork attachments.
- Test the preserved Churches quote flow with a clearly marked test request, and confirm its email arrives.
- Visit several pages and check GA4 Realtime in property G-D2CW5LWNT1, preferably without an ad blocker.
- Check /robots.txt allows the public site, /sitemap.xml loads, and there is no preview banner on public pages.
- Recheck the menu, configurator, cart, and checkout on an actual phone.

Once these checks pass, optionally select Unlock to start auto publishing so future pushes publish normally.

## Rollback

If a launch problem prevents enquiries or breaks key pages, open the previous successful deploy in Netlify and select Publish deploy. Keep auto publishing locked. Revert the launch commit in GitHub Desktop before allowing later deployments to publish. See ROLLBACK.md for restoring original build settings if rebuilding old source.

## Verification performed on the package

47 automated tests pass against preview and production builds. Checks cover product dependencies, version quantities, cart interactions, validation, mocked email delivery/failures, analytics isolation, local links/assets, and Churches preservation. Production builds contain 75 HTML pages with one shared GA initializer each. No live Netlify build, browser/device session, real Brevo delivery, or GA receipt was tested here.

## Official references

- https://docs.netlify.com/build/functions/environment-variables/
- https://docs.netlify.com/build/functions/api/
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
- https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/
- https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop
