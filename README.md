[![Aktuelle Version](https://img.shields.io/github/package-json/v/rrze-webteam/rrze-codebox/main?label=Version)](https://github.com/RRZE-Webteam/rrze-codebox) 
[![Release Version](https://img.shields.io/github/v/release/rrze-webteam/rrze-codebox?label=Release+Version)](https://github.com/rrze-webteam/rrze-codebox/releases/) 
[![GitHub License](https://img.shields.io/github/license/rrze-webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox) 
[![GitHub issues](https://img.shields.io/github/issues/RRZE-Webteam/rrze-codebox)](https://github.com/RRZE-Webteam/rrze-codebox/issues)

# RRZE CodeBox

Displays syntax-highlighted code blocks in posts and pages via a WordPress
block. Highlighting runs server-side using
[highlight.php](https://github.com/scrivo/highlight.php) — no client-side
JavaScript highlighting engine, no flash of unstyled code.

## Features

- Syntax highlighting for 13 languages (server-side, via highlight.php)
- Light and dark (FAU Blue) theme, switchable per block
- Optional line numbers with configurable start number
- Syntax highlighting toggle per block
- Language label display toggle
- Caption with optional source URL
- Copy-to-clipboard button (vanilla JS, no jQuery)

No shortcodes. No global settings page. All configuration lives in the
block's toolbar and inspector controls.

## Documentation

https://www.wp.rrze.fau.de/plugins/inhaltsseiten-mit-funktionen-erweitern/rrze-codebox/.


## Requirements

- WordPress 6.8+
- PHP 8.2+

## Installation

Download the latest release from
[GitHub](https://github.com/RRZE-Webteam/rrze-codebox/releases).
Activate the plugin on a single site or network-activate it on Multisite.

## Multisite

Fully Multisite-capable. Block attributes are stored per post.
No network-wide configuration in v1.

## Development checks

```bash
npm run test:unit -- --runInBand
npm run test:php
npm run build
```

The PHP checks use the surrounding WordPress installation's parser and HTML
filters without loading its database or activating plugins. For a standalone
checkout, pass the WordPress root: `npm run test:php -- /path/to/wordpress`.

Code is stored as UTF-8 Base64 with an explicit `contentEncoding: "base64"`
attribute. Unmarked content is treated as raw text, never guessed from its
appearance. The editor converts legacy raw blocks on load; a server save filter
also converts them before WordPress filters the HTML, including nested blocks
and saves where the code was not edited. Existing encoded blocks are preserved.
Base64 is a storage encoding, not encryption; output is still escaped or passed
through the syntax highlighter.

## Maintainer

RRZE Webteam ([webmaster@fau.de](mailto:webmaster@fau.de))

---

No external services, no cookies, no browser storage,
no plugin-specific database tables or options.
