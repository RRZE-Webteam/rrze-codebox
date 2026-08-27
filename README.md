[![Aktuelle Version](https://img.shields.io/github/package-json/v/rrze-webteam/rrze-codebox/main?label=Version)](https://github.com/RRZE-Webteam/rrze-codebox) [![Release Version](https://img.shields.io/github/v/release/rrze-webteam/rrze-codebox?label=Release+Version)](https://github.com/rrze-webteam/rrze-codebox/releases/) [![GitHub License](https://img.shields.io/github/license/rrze-webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox) [![GitHub issues](https://img.shields.io/github/issues/RRZE-Webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox/issues)

# RRZE Codebox

**This repository is a blueprint, not a finished product.** It is a working
scaffold that satisfies the RRZE WordPress Plugin Engineering Standard
(v1.15) end to end, including one dynamic block. Use it as the starting
point for a real plugin: rename the slug/namespace/text domain throughout
(see `doc/architecture.md`), replace the placeholder block with the actual
feature, and delete the optional modules (network API key, external API
client) that the real project does not need.

Short description: reference implementation of the mandatory RRZE plugin
architecture, used to bootstrap new RRZE-CMS plugins that need a block.

## Purpose

Provide a compliant, minimal starting architecture — bootstrap, config
resolver, one settings screen per level (site + network), one dynamic
block — so a new plugin begins from a structure that already satisfies the
Standard, instead of retrofitting compliance later.

## User documentation

Placeholder: replace with the canonical, non-technical, web-hosted
end-user documentation URL for the real plugin before release (Standard
section 1.2.4). Repository-only documentation is not sufficient.

`USER_DOCUMENTATION_URL = <to be defined>`

## Support and maintainer

`MAINTAINER = <named, reachable person or team>`
`USER_SUPPORT_CONTACT = <to be defined>`

A one-time AI-generated implementation without a durable maintainer and
support responsibility is not acceptable for production (Standard section
1.1/78).

## Requirements

- WordPress 6.8+
- PHP 8.2+
- Node.js 20+ / npm 10+ for building block assets

## Installation

```bash
git clone https://github.com/RRZE-Webteam/rrze-codebox.git
cd rrze-codebox
npm ci
npm run build
```

Activate the plugin on a single site, or network-activate it if the
project's `Network:` header decision (Standard section 5) requires it. This
blueprint does not set `Network: true`; it supports per-site activation on
Multisite as well as network activation of its hooks.

## Configuration

Site-level settings: **Settings → RRZE Codebox** (capability
`manage_options`).

Network-level settings (Multisite only): **Network Admin → Settings →
RRZE Codebox** (capability `manage_network_options`).

Resolution order implemented in `includes/Config/Settings.php`:
runtime/filter override → site option → network option → default.

## Multisite behavior

Fully Multisite-capable, per Standard section 1.2.1/14: site-specific
display settings are stored with `get_option()`/`update_option()`;
infrastructure-wide configuration (the optional network API key) is stored
as a network option and is never exposed or editable at site level.

## Development

Versioning follows the RRZE build/version process (`Major.Minor.Patch-Build`,
e.g. `1.0.0-0`; see `doc/architecture.md` for why this uses a hyphen instead
of the underscore in the Leitfaden's own examples):

| Command | Assets | Version effect | Typical use |
| --- | --- | --- | --- |
| `npm run watch` | unminified, source maps, rebuilds on change | none | during active development |
| `npm run build` | unminified, source maps | none | just (re)build assets, e.g. after `npm ci` |
| `npm run dev` | unminified, source maps | `Build` +1 | mark a new development snapshot |
| `npm run prod` | minified, no source maps | `Patch` +1, `Build` → 0 | before a commit/deployment on `dev` |
| `npm run release` | minified, no source maps | `Minor` +1, `Patch`/`Build` → 0 | official release, before merging `dev` → `main` |
| `npm run version:major` | — (no build) | `Major` +1, rest → 0 | manual only, for a breaking change — never automated |

`npm run lint:js` / `npm run lint:css` / `npm run format` run the usual
`wp-scripts` checks. `scripts/build-version.js` and `scripts/build-readme.js`
keep `package.json`, the plugin header, and `readme.txt` in sync
automatically as part of `dev`/`prod`/`release` (Standard section 39.7) —
they are not meant to be edited by hand.

Before a production release, run the plugin through **WordPress Plugin
Check (PCP)** and resolve all reported errors (Standard section 54.1).

## Accessibility

Target: WCAG 2.2 AA generally, WCAG 2.2 AAA for the settings-page form
workflows (Standard section 2.2). The block and settings screens use
native HTML controls, associated labels, and visible focus; no information
is conveyed by color alone. Re-verify this whenever the real feature
replaces the placeholder block markup.

## External services

None by default. `includes/API/Client.php` is optional scaffolding for a
future external API integration — if kept and used, document here:
provider, purpose, transmitted data, authentication method, timeout and
failure behavior, privacy implications, and whether data leaves FAU
infrastructure (Standard section 7.1/24/44). If not used, delete the file.

## Third-party runtime resources and consent

None. No fonts, scripts, or styles are loaded from third-party hosts or
public CDNs (Standard section 24.1). All block assets are built and shipped
locally by `wp-scripts`.

## Cookies and browser storage

None. This blueprint sets no cookies and uses no `localStorage` or
`sessionStorage`. Document any addition here per Standard section 43.1
(name, purpose, lifetime, consent requirement) before release.

## Data storage

| Data | Storage | Scope |
| --- | --- | --- |
| Display mode | `rrze_codebox_settings` (site option) | Per site |
| Schema version | `rrze_codebox_schema_version` (site option) | Per site |
| Network toggle | `rrze_codebox_network_settings` (network option) | Network-wide |
| Optional API key | `rrze_settings` (managed by the `rrze-settings` plugin) | Network-wide |

See `uninstall.php` for what is deleted vs. intentionally retained on
plugin removal.

## Hooks and APIs

- Filter `rrze_codebox_config_{key}`: override any resolved configuration
  value at runtime.
- Filter `rrze_codebox_documentation_url`: returns the canonical end-user
  documentation URL shown as plugin row meta; empty by default.
- Block `rrze/example-block`: dynamic, server-rendered via `render.php`.

## Release process

1. Develop against `dev`; never commit directly to `main` (Standard
   section 57). Use `npm run watch` / `npm run dev` for day-to-day work;
   neither commit is required for those (see table above).
2. Before committing a deployable state on `dev`: `npm run prod`, then
   lint and Plugin Check; commit the result (bumps `Patch`, resets `Build`).
3. For an official release: `npm run release` (bumps `Minor`, resets
   `Patch`/`Build`), review the diff, update the changelog, commit on `dev`.
4. Merge the tested, fully built `dev` state into `main`. `main` must be
   directly executable by RRZE's Git-based updater without a
   production-server build step (Standard section 39).
5. A breaking change additionally requires `npm run version:major`, run
   deliberately and reviewed on its own — never as part of the automated
   `dev`/`prod`/`release` chain (Standard section 6).

## Maintainers

`<to be defined per project>`
