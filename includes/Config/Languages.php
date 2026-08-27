<?php

declare(strict_types=1);

namespace RRZE\Codebox\Config;

defined('ABSPATH') || exit;

/**
 * Central language configuration — single source of truth.
 *
 * The slug must be a valid highlight.php language identifier.
 * Both PHP (Highlighter, REST endpoint) and JavaScript (block editor
 * via wp_localize_script) read from here. Never duplicate this list.
 */

class Languages
{
    /**
     * Returns all supported languages as slug => label pairs.
     *
     * @return array<string, string>
     */
    public static function getAll(): array
    {
        return [
            'c'          => __('C', 'rrze-codebox'),
            'cpp'        => __('C++', 'rrze-codebox'),
            'csharp'     => __('C#', 'rrze-codebox'),
            'css'        => __('CSS', 'rrze-codebox'),
            'xml'        => __('HTML / XML', 'rrze-codebox'),
            'java'       => __('Java', 'rrze-codebox'),
            'javascript' => __('JavaScript', 'rrze-codebox'),
            'json'       => __('JSON', 'rrze-codebox'),
            'perl'       => __('Perl', 'rrze-codebox'),
            'php'        => __('PHP', 'rrze-codebox'),
            'python'     => __('Python', 'rrze-codebox'),
            'scss'       => __('SCSS', 'rrze-codebox'),
            'sql'        => __('SQL', 'rrze-codebox'),
        ];
    }

    /**
     * Returns true when the given slug is a supported language identifier.
     */
    public static function isValid(string $slug): bool
    {
        return array_key_exists($slug, self::getAll());
    }
}