# Architecture notes for this blueprint

This document explains the choices baked into the scaffold and what to do
with it. It supplements, and never overrides, the RRZE WordPress Plugin
Engineering Standard.

## 1. Renaming this blueprint into a real plugin

Search and replace, in this order, across the whole repository:

| Placeholder | Replace with |
| --- | --- |
| `RRZE Example` (plugin name) | Actual plugin name |
| `rrze-codebox` (slug, text domain, option/transient prefixes, CSS classes, npm package name) | Actual slug |
| `RRZE\Codebox` (PHP namespace) | Actual namespace |
| `RRZE_CODEBOX_` (constant prefix) | Actual constant prefix |
| `rrze/codebox` (block name) | Actual `category-or-plugin-name/block-name` |
| `RRZE-Webteam/rrze-codebox` (repository URLs) | Actual repository |

Do this once, at project initialization, and keep it consistent afterward
(Standard section 4.3: "the AI MUST NOT invent multiple spellings of the
slug, namespace, text domain...").

Fill in Standard section 81's project initialization checklist explicitly
before writing feature code:

```text
PLUGIN_NAME=
PLUGIN_SLUG=
PHP_NAMESPACE=
TEXT_DOMAIN=
DESCRIPTION=
PLUGIN_URI=
AUTHOR=
AUTHOR_URI=
LICENSE=
MIN_WORDPRESS_VERSION=
MIN_PHP_VERSION=
INITIAL_VERSION=
MULTISITE_SUPPORT=
RRZE_CMS_TARGET=
USER_DOCUMENTATION_URL=
ADVANCED_SETTINGS=
NETWORK_LICENSE_KEYS=
BLOCK_EDITOR_INTEGRATION=
BLOCK_CATEGORY=
BLOCK_NAMES=
BLOCK_DEPRECATION_STRATEGY=
NETWORK_ACTIVATION_SUPPORT=
NETWORK_SETTINGS=
SITE_SETTINGS=
EXTERNAL_SERVICES=
THIRD_PARTY_RUNTIME_RESOURCES=
COOKIES=
LOCAL_STORAGE=
SESSION_STORAGE=
MAINTAINER=
USER_SUPPORT_CONTACT=
```

## 2. What is mandatory scaffolding vs. optional module

Mandatory, keep and adapt:

- `rrze-codebox.php` — header, autoloader, activation/deactivation hooks.
- `includes/Plugin.php` — composition root and migration hook pattern.
- `includes/Main.php` — small, genuinely plugin-wide behavior that has no
  other home (currently: the Plugins-screen "Settings" link and an
  optional documentation row-meta link). Do not turn this into a dumping
  ground; a new unrelated concern gets its own class instead.
- `includes/Config/Settings.php` (and its two view files) — the
  network/site configuration resolver and capability-gated settings
  screens (Standard sections 13, 15, 16, 18, 69).
- `includes/Blocks/Blocks.php` — block registration and the `rrze` block
  category filter (Standard section 31.1).
- `src/example-block/*` — the block itself: `block.json`, `edit.tsx`,
  `render.php` (dynamic rendering), `view.ts`, styles.
- `uninstall.php` — documented, deliberate cleanup (Standard section 23).
- `scripts/build-version.js` — canonical metadata sync (Standard section
  39.7).

Optional, delete if the real project does not need them:

- `includes/API/Client.php` — only if the plugin talks to an external
  service. If deleted, also remove the `EXTERNAL_SERVICES` /
  `THIRD_PARTY_RUNTIME_RESOURCES` README sections' content (leave the
  headings — Standard section 7.1 expects them to exist and state "none").
- `Settings::getNetworkApiKey()` and the network settings screen — only if
  the plugin needs a centrally managed, network-wide secret (Standard
  section 1.2.7/17). If the plugin has no network-owned configuration at
  all, remove `registerNetworkMenu()`/`renderNetworkPage()` and the
  `network_admin_menu` hook in `Plugin::run()` entirely rather than leaving
  an empty network screen.
- Custom database tables, custom post types, custom upload handling — none
  are scaffolded here because "eigene Datenhaltung" was left open-ended.
  Standard section 22/45.2 apply directly if added: prefer WordPress
  storage APIs first, and if a custom table is genuinely justified,
  document why and add versioned migrations to
  `Plugin::maybeMigrate()`.

## 3. Why a dynamic block, not a static one

Standard section 31.4 recommends dynamic rendering (PHP `render.php`) over
`save.tsx` "due to deprecation and maintenance" of static block markup. The
scaffold therefore ships no `save.tsx` and no `deprecated.tsx`. If a future
change genuinely needs a static block instead, add `save.tsx` and a
matching `deprecated.tsx` together in the same change, per Standard section
31.2 — never one without the other.

## 4. Why no Composer, no bundled React, no CDN assets

- No third-party PHP library is used, so a full `vendor/autoload.php` step
  would be an unjustified dependency (Standard section 9/42). A five-line
  PSR-4 autoloader in the main file covers this plugin's own classes.
- The block imports `@wordpress/element`/`@wordpress/components` etc. via
  the WordPress dependency-extraction mechanism built into `wp-scripts`;
  it does not bundle a second copy of React (Standard section 33).
- No fonts, scripts, or styles are loaded from a public CDN (Standard
  section 24.1). Everything ships from `build/`.

## 5. Versioning and the build/version scripts

This blueprint implements "Leitfaden: Einheitlicher Build- und
Versionsprozess für WordPress-Plugins", which is the concrete automation of
Standard section 6/39.7. Three scripts divide the work instead of one:

- `scripts/build-assets.js <dev|prod> [--watch]` — runs `wp-scripts`
  (`build` or `start`), controlling minification/source maps via
  `NODE_ENV`. Never touches any version number.
- `scripts/build-version.js <dev|prod|release|major>` — the only place
  that changes `package.json`'s `version` field, following
  `Major.Minor.Patch-Build`, and syncs the plugin header + the
  `RRZE_CODEBOX_VERSION` constant from the result.
- `scripts/build-readme.js` — syncs `readme.txt` (`Stable tag`,
  `Requires at least`, `Tested up to`, `Requires PHP`) from `package.json`.
  Deliberately separate from `build-version.js` so both stay independently
  runnable, exactly as the Leitfaden's example `package.json` composes them.

`package.json`'s `dev`/`build`/`prod`/`release`/`watch` scripts wire these
three together (see the table in `README.md#development`). Only
`version:major` is intentionally left out of that automatic chain: a MAJOR
bump is a deliberate, reviewed decision about a breaking change (Standard
section 6/59), never something a dev/prod/release run should trigger on its
own. Run `npm run version:major` by itself, review the diff, then continue
with the normal `dev`/`prod`/`release` flow.

**Migration note for anyone who used `npm run build` as their pre-commit
step in an older project (without this process):** that habit builds
production-ready-looking assets but never changes the version, so commits
become indistinguishable from one another after the fact — exactly the
problem this process exists to remove. The replacement is not `build`, it
is:

- `npm run prod` before a commit on `dev` (minifies, bumps `Patch`, resets `Build`);
- `npm run release` before merging `dev` into `main` (bumps `Minor`, resets `Patch`/`Build`).

`npm run build` and `npm run watch` remain purely local, no-commit-required
commands (see the table above) — that division is what the Leitfaden's own
workflow table ("Empfohlener Arbeitsablauf") specifies, even though its
"build" section's first sentence ("Erzeugt ausschließlich die
Produktions-Assets") is worded confusingly for a step that stays unminified
and never touches the version. Do not let that one sentence override the
table and the explicit "vor dem Commit bzw. Deployment: `npm run prod`"
guidance elsewhere in the same document.

**Why a hyphen, not the underscore in the Leitfaden's own examples
("2.5.3_17"):** `Major.Minor.Patch_Build` is not valid SemVer (checked
against the official regex from semver.org) and npm's own `npm version`
family of commands rejects it outright, even though `npm install`/`npm ci`
happen to tolerate it silently. `Major.Minor.Patch-Build` (e.g. `1.0.0-0`)
is valid SemVer — the hyphen is SemVer's own prerelease separator — and was
verified to work with `npm install`, `npm ci`, and npm's native
`npm version prerelease` bump (`1.0.0-0` → `1.0.0-1` → ...). PHP's
`version_compare()`, used in `Plugin::maybeMigrate()`, also orders
same-shaped hyphenated versions correctly. This is a deliberate deviation
from the literal example text in both the Standard and the Leitfaden —
both are explicitly still evolving documents, and technical correctness
against real tooling (npm, SemVer) was chosen over matching that text. If
either document settles on a different delimiter later, update
`VERSION_RE` and `formatVersion()` in `scripts/build-version.js` (and this
file, `README.md`, and every literal version string below) to match.

Trade-off to be aware of: SemVer treats any version with a `-prerelease`
suffix as lower precedence than the same version without one (`1.0.0-0` <
`1.0.0`). That is irrelevant here — this package is `private: true`, never
published, and never depended on via semver ranges — but would matter if
that ever changed.

The version string itself (e.g. `1.0.0-0`) is used verbatim everywhere —
`package.json`, the plugin header's `Version:` line, the
`RRZE_CODEBOX_VERSION` constant, and `readme.txt`'s `Stable tag` — so
Standard section 40's consistency check has exactly one canonical value to
compare against. The Changelog section of `readme.txt` is not
auto-generated; the `Build` counter has no meaning for an official release
(Leitfaden, "Versionsschema"), so changelog entries should reference the
`Major.Minor.Patch` portion only and are written by hand.

## 6. `build/` and Git branches

`main` must contain a directly executable plugin, including built block
assets (Standard section 39/39.1). `dev`/feature branches in this
blueprint's `.gitignore` exclude `/build/*` to avoid committing stale or
half-finished local builds during day-to-day development. When promoting
`dev` into `main`, the release step must run `npm run prod` (or `release`)
against the promoted commit and commit the resulting `build/` directory to
`main` (for example with `git add -f build/` if `main`'s `.gitignore` is
not adjusted, or by maintaining a release-specific `.gitignore` override).
Define and document the exact mechanism your team uses; do not let `main`
silently end up without built assets.

## 7. Known gaps a real project must still close

- `LICENSE` contains a shortened notice; replace it with the full GPLv3
  text before release.
- No PHPUnit/Jest/Playwright tests are scaffolded (Standard section 53).
  Add them once real behavior exists to test.
- No CI configuration is included (Standard section 56).
- Translations (`languages/`) are empty; run the actual `en_US`, `de_DE`,
  and `de_DE_formal` translation workflow for all block strings before
  release (Standard section 31.3).
- WordPress Plugin Check has not been run against this scaffold in this
  environment; it must be run and pass with zero errors before any
  production candidate ships (Standard section 54.1).
