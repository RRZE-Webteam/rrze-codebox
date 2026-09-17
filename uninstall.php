<?php

/**
 * Uninstall handler.
 *
 * Runs only when the plugin is deleted through the WordPress admin,
 * never on plain deactivation (Standard section 23).
 *
 * v1 stores no plugin-specific options, transients, or database tables.
 * Block attributes live in post content and are managed by WordPress.
 * Nothing to clean up.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}
