# Restoring the original website

The source supplied for this project remains in `legacy-site/`. The separately supplied `Quixprint-Original-Backup.zip` is a byte-for-byte copy of the original uploaded main-site ZIP. Its Churches files match the separately supplied Churches backup.

## If the rebuild has not been launched

Nothing needs restoring. The production site, production GitHub repository, DNS, and Netlify configuration were not changed by this work.

## If you later launch and want to revert

1. Keep auto publishing locked. Open the previous successful production deployment in Netlify and select Publish deploy as the immediate rollback.
2. Revert the production GitHub repository to the commit made before the rebuild, or restore the original ZIP contents to a clean branch.
3. Restore the original build command `python3 scripts/generate_sitemap.py` and publish directory `.`. Preserve `netlify/functions` as the functions directory.
4. Preserve the original Churches environment variables and verified Brevo sender settings.
5. Redeploy the restored source and verify the homepage, blog, `/churches/`, quote flow, policies, favicon, and sitemap.

The uploaded source backups do not include Netlify account settings, DNS configuration, build-history snapshots, or environment-variable values. Record those in the account before a future launch. They cannot be reconstructed from the ZIP alone, and are not claimed as backed up here.
