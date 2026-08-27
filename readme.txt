=== RRZE Example ===
Contributors: rrzewebteam
Tags: block, rrze, blueprint
Requires at least: 6.8
Tested up to: 6.8
Requires PHP: 8.2
Stable tag: 1.0.0-0
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Blueprint/reference plugin implementing the RRZE WordPress Plugin Engineering Standard, including a block-first content integration example.

== Description ==

This plugin is a compliance blueprint, not a finished feature. It provides
the mandatory RRZE plugin architecture (namespaced OOP, Multisite-aware
configuration resolver, capability-gated settings screens, one dynamic
block) so a new project starts from a structure that already satisfies the
RRZE WordPress Plugin Engineering Standard.

== Installation ==

1. Upload or `git clone` into `wp-content/plugins/`.
2. Run `npm ci && npm run build`.
3. Activate the plugin.

== Changelog ==

= 1.0.0 =
* Initial blueprint scaffold.
