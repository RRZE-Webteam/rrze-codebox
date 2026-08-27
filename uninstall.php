<?php

/**
 * Uninstall handler.
 *
 * Runs only when the plugin is deleted through the WordPress admin, never
 * on plain deactivation (Standard section 23). Destructive cleanup MUST be
 * deliberate; document below what is removed and what is intentionally
 * retained.
 *
 * Currently removed:
 * - rrze_codebox_settings (site option)
 * - rrze_codebox_schema_version (site option)
 *
 * Currently retained:
 * - rrze_codebox_network_settings (network option): intentionally kept so
 *   a Network Admin does not lose central configuration if one site's
 *   plugin row is removed. Remove this comment and add explicit cleanup if
 *   the project decides otherwise.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

/*
 * uninstall.php runs standalone: WordPress does not load the main plugin
 * file or its autoloader first. Use the literal option name here rather
 * than RRZE\Codebox\Config\Settings::SITE_OPTION to avoid a fatal error
 * from an unresolved class reference; keep this value in sync with that
 * constant if it ever changes.
 */
function rrze_codebox_uninstall_single_site()
{
    delete_option('rrze_codebox_settings');
    delete_option('rrze_codebox_schema_version');
}

if (is_multisite()) {
    $siteIds = get_sites(['fields' => 'ids']);

    // Standard section 23/48: do not iterate a large Multisite network
    // synchronously without limits. For very large networks, batch this
    // via a scheduled cleanup job instead of running it inline here.
    foreach ($siteIds as $siteId) {
        switch_to_blog($siteId);
        rrze_codebox_uninstall_single_site();
        restore_current_blog();
    }
} else {
    rrze_codebox_uninstall_single_site();
}
