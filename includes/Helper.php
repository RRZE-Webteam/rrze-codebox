<?php

declare(strict_types=1);

namespace RRZE\Codebox;

defined('ABSPATH') || exit;

/**
 * Static utility methods shared across plugin subsystems.
 *
 * Keep this small. A method that belongs exclusively to one subsystem
 * lives in that subsystem's class, not here.
 */
class Helper
{
    /**
     * Logs a message via the rrze-log plugin.
     *
     * If rrze-log is not active the do_action() call has no listeners
     * and nothing happens — the plugin continues running normally.
     * Never use error_log() directly in production.
     *
     * @param string $message Log message.
     * @param string $level error | warning | notice |info
     * @param array<string, mixed> $context Optional structured context.
     */
    public static function log(string $message, string $level = 'info', array $context = []): void
    {
        $context = array_merge(['plugin' => 'rrze-codebox'], $context);

        $action = match ($level) {
            'error' => 'rrze.log.error',
            'warning' => 'rrze.log.warning',
            'notice' => 'rrze.log.notice',
            default => 'rrze.log.info',
        };

        do_action($action, $message, $context);
    }


    /**
     * Returns true when WordPress debug mode is active.
     */
    public static function isDebug(): bool
    {
        return defined('WP_DEBUG') && WP_DEBUG;
    }
}


