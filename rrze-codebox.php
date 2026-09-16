<?php

/**
 * Plugin Name:        RRZE CodeBox
 * Plugin URI:         https://github.com/RRZE-Webteam/rrze-codebox
 * Version:            1.0.0-12
 * Description:        Adds a block for displaying syntax-highlighted code
 * Author:             RRZE Webteam
 * Author URI:         https://www.wp.rrze.fau.de/
 * License:            GNU General Public License Version 3
 * License URI:        https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:        rrze-codebox
 * Domain Path:        /languages
 * Requires at least:  6.8
 * Requires PHP:       8.2
 */

declare(strict_types=1);

namespace RRZE\Codebox;

defined('ABSPATH') || exit;

// Minimum requirements — const because these are simple string values only
// needed within this namespace (in systemRequirements() below).
const RRZE_CODEBOX_PHP_VERSION = '8.2';
const RRZE_CODEBOX_WP_VERSION = '6.8';

// Runtime constants — define() required because plugin_dir_path/url() are
// function calls, and these values must be accessible from all namespaces.
define('RRZE_CODEBOX_VERSION', '1.0.0-12');
define('RRZE_CODEBOX_FILE', __FILE__);
define('RRZE_CODEBOX_DIR', plugin_dir_path(__FILE__));
define('RRZE_CODEBOX_URL', plugin_dir_url(__FILE__));

// Composer handles autoloading for both the highlight.php package and our
// own classes (RRZE\Codebox\* → includes/) configured in composer.json.
require_once __DIR__ . '/vendor/autoload.php';

// Lifecycle hooks must be registered before plugins_loaded (Standard §49).
register_activation_hook(__FILE__, __NAMESPACE__ . '\activatePlugin');
register_deactivation_hook(__FILE__, __NAMESPACE__ . '\deactivatePlugin');

/**
 * Runs on plugin activation.
 *
 * Must remain fast — no remote calls, no heavy migrations (Standard §49).
 * No scheduled events or schema migrations in v1, so intentionally empty.
 */
function activatePlugin(): void
{
}


/**
 * Runs on plugin deactivation.
 *
 * Must NOT delete user data — that belongs in uninstall.php (Standard §23).
 * No scheduled events to clear in v1.
 */
function deactivatePlugin(): void
{
}


/**
 * Checks whether the server meets minimum PHP and WordPress requirements.
 *
 * Returns an empty string when all requirements are met, or a translated
 * error message describing the first unmet requirement.
 */
function systemRequirements(): string
{
    if (version_compare(PHP_VERSION, RRZE_CODEBOX_PHP_VERSION, '<')) {
        return sprintf(
        /* translators: 1: Current PHP version. 2: Required PHP version. */
            __('RRZE CodeBox requires PHP %2$s or higher. Your server is running PHP %1$s.', 'rrze-codebox'),
            PHP_VERSION,
            RRZE_CODEBOX_PHP_VERSION
        );
    }

    if (version_compare($GLOBALS['wp_version'], RRZE_CODEBOX_WP_VERSION, '<')) {
        return sprintf(
        /* translators: 1: Current WordPress version. 2: Required WordPress version. */
            __('RRZE CodeBox requires WordPress %2$s or higher. Your site is running WordPress %1$s.', 'rrze-codebox'),
            $GLOBALS['wp_version'],
            RRZE_CODEBOX_WP_VERSION
        );
    }

    return '';
}

/**
 * Displays an admin notice when system requirements are not met.
 *
 * Named function — not a closure — so it can be registered as a proper
 * hook callback (Standard §11). Only shown to users who can act on it
 * (Standard §68).
 */
function showRequirementsNotice(): void
{
    if (!current_user_can('activate_plugins')) {
        return;
    }

    $error = systemRequirements();

    if ($error === '') {
        return;
    }

    printf(
        '<div class="notice notice-error"><p>%s</p></div>',
        esc_html($error)
    );
}

/**
 * Plugin entry point, fired on plugins_loaded.
 *
 * Text domain is loaded first so error messages are already translatable.
 * Then requirements are checked. Only if both pass, Main bootstraps the
 * plugin subsystems.
 */
function initializePlugin(): void
{
    load_plugin_textdomain(
        'rrze-codebox',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );

    if (systemRequirements() !== '') {
        add_action('admin_notices', __NAMESPACE__ . '\showRequirementsNotice');
        return;
    }

    new Main();
}

add_action('plugins_loaded', __NAMESPACE__ . '\initializePlugin');

