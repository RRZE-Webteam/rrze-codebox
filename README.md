[![Aktuelle Version](https://img.shields.io/github/package-json/v/rrze-webteam/rrze-codebox/main?label=Version)](https://github.com/RRZE-Webteam/rrze-codebox) [![Release Version](https://img.shields.io/github/v/release/rrze-webteam/rrze-codebox?label=Release+Version)](https://github.com/rrze-webteam/rrze-codebox/releases/) [![GitHub License](https://img.shields.io/github/license/rrze-webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox) [![GitHub issues](https://img.shields.io/github/issues/RRZE-Webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox/issues)

# RRZE CodeBox

Displays syntax-highlighted code blocks in posts and pages via a WordPress
block. Highlighting runs server-side using
[highlight.php](https://github.com/scrivo/highlight.php) — no client-side
JavaScript highlighting engine, no flash of unstyled code.

## Purpose

RRZE CodeBox provides a single block (`rrze/codebox`) for editors
who need to embed formatted source code. Supported features in v1:

- Syntax highlighting for 13 languages (server-side, via highlight.php)
- Light and dark (FAU Blue) theme, switchable per block
- Optional line numbers with configurable start number
- Syntax highlighting toggle per block
- Language label display toggle
- Caption with optional source URL
- Copy-to-clipboard button (vanilla JS, no jQuery)

No shortcodes. No global settings page. All configuration lives in the
block's toolbar and inspector controls.

## User documentation

`USER_DOCUMENTATION_URL = <to be defined>`

## Support and maintainer

`MAINTAINER = <named, reachable person or team>`
`USER_SUPPORT_CONTACT = <to be defined>`

## Requirements

- WordPress 6.8+
- PHP 8.2+
- Node.js 20+ / npm 10+ for building block assets
- Composer for PHP dependencies

## Installation

```bash
git clone https://github.com/RRZE-Webteam/rrze-codebox.git
cd rrze-codebox
composer install
npm ci
npm run build
```

Activate the plugin on a single site or network-activate it on Multisite.

## Configuration

All configuration is per block, set in the block toolbar and inspector
controls. There is no global settings page in v1.

| Control | Location | Description |
| --- | --- | --- |
| Light / Dark theme | Block Toolbar | Switches between FAU Light and FAU Blue theme |
| Language | Block Toolbar + Inspector | Selects the syntax highlighting language |
| Show line numbers | Inspector | Toggles line number display |
| First line number | Inspector | Sets the starting line number (default: 1) |
| Syntax highlighting | Inspector | Enables or disables syntax highlighting |
| Show language label | Inspector | Toggles the language label in the block header |
| Caption | Inspector | Description text shown below the code block |
| Source URL | Inspector | Link to the original source, shown next to the caption |

## Multisite behavior

Fully Multisite-capable. Block attributes are stored per post and are
site-specific by nature. No network-wide configuration exists in v1.

## Development

Versioning follows `Major.Minor.Patch-Build` (e.g. `1.0.0-1`; hyphen instead
of the underscore in the Leitfaden's examples — see `doc/architecture.md`):

| Command | Assets | Version effect | Typical use |
| --- | --- | --- | --- |
| `npm run start` | unminified, source maps, rebuilds on change | none | during active development |
| `npm run build` | unminified, source maps | none | just (re)build assets |
| `npm run dev` | unminified, source maps | `Build` +1 | before a commit on `dev` |
| `npm run prod` | minified, no source maps | `Patch` +1, `Build` → 0 | before a deployable commit |
| `npm run release` | minified, no source maps | `Minor` +1, `Patch`/`Build` → 0 | before merging `dev` → `main` |
| `npm run version:major` | — | `Major` +1, rest → 0 | manual only, breaking change |

`scripts/build-version.js` and `scripts/build-readme.js` keep `package.json`,
the plugin header, and `readme.txt` in sync automatically.

Before a production release, run the plugin through **WordPress Plugin
Check (PCP)** and resolve all reported errors.

## Accessibility

Target: WCAG 2.2 AA. The copy button and theme toggle are keyboard-operable
with visible focus indicators. The code block output uses semantic HTML.
Both themes have been designed against FAU color guidelines with sufficient
contrast. Re-verify after any CSS changes.

## External services

None. `highlight.php` (`scrivo/highlight.php`) is a Composer package bundled
with the plugin and runs entirely server-side. No data is sent to any external
host.

## Third-party runtime resources and consent

None. No fonts, scripts, or styles are loaded from third-party hosts or public
CDNs. All block assets are built and shipped locally.

## Cookies and browser storage

None. This plugin sets no cookies and uses no `localStorage` or
`sessionStorage`.

## Data storage

Block attributes are stored as block comment metadata in post content by
WordPress. No plugin-specific database options or tables are created.

| Data | Storage | Scope |
| --- | --- | --- |
| Code content | Block attribute in post content | Per post |
| Language, theme, display options | Block attributes in post content | Per post |

See `uninstall.php` — no plugin-specific options are created, so no cleanup
is required beyond deactivation.

## Hooks and APIs

- REST route `POST /rrze-codebox/v1/highlight`: accepts `code` and `language`,
  returns highlighted HTML. Used by the block editor for live preview.
  Requires `edit_posts` capability.
- Block `rrze/codebox`: dynamic, server-rendered via `render.php`.

## Release process

1. Develop against `dev`; never commit directly to `main`.
2. Before a commit on `dev`: `npm run dev` (bumps `Build`).
3. Before a deployable state on `dev`: `npm run prod` (bumps `Patch`).
4. For an official release: `npm run release` (bumps `Minor`), update
   changelog, commit on `dev`.
5. Merge the tested, fully built `dev` state into `main`. Add built assets
   and vendor directory: `git add -f build/ vendor/`.
6. `main` must be directly executable without a production-server build step.

## Maintainers

`<to be defined>`
