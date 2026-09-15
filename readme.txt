=== RRZE CodeBox ===
Contributors: rrzewebteam
Tags: block, syntax highlighting, code, rrze
Requires at least: 6.8
Tested up to: 6.8
Requires PHP: 8.2
Stable tag: 1.0.0-8
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Displays syntax-highlighted code blocks in posts and pages via a block. Server-side highlighting — no flash of unstyled code.

== Description ==

RRZE CodeBox adds a single block (`rrze/codebox`) for editors who need to
embed formatted source code in posts and pages.

Syntax highlighting runs server-side using highlight.php — no client-side
JavaScript highlighting engine, no flash of unstyled code.

Features:

* Syntax highlighting for 13 languages (C, C++, C#, CSS, HTML/XML, Java, JavaScript, JSON, Perl, PHP, Python, SCSS, SQL)
* Light and dark (FAU Blue) theme, switchable per block
* Optional line numbers with configurable start number
* Syntax highlighting toggle per block
* Language label display toggle
* Caption with optional source URL
* Copy-to-clipboard button (no jQuery)

No shortcodes. No global settings page. All configuration lives in the block toolbar and inspector controls.

== Installation ==

1. Clone the repository into `wp-content/plugins/rrze-codebox/`.
2. Run `composer install` to install PHP dependencies.
3. Run `npm ci && npm run build` to build block assets.
4. Activate the plugin on a single site or network-activate it on Multisite.

== Changelog ==

= 1.0.0 =
* Initial release.
