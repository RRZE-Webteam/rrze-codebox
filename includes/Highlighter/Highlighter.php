<?php

declare(strict_types=1);

namespace RRZE\Codebox\Highlighter;

defined('ABSPATH') || exit;

use Highlight\Highlighter as HLHighlighter;
use RRZE\Codebox\Config\Languages;
use RRZE\Codebox\Helper;

/**
 * Syntax highlighting — single source of truth.
 *
 * All code that needs highlighted HTML goes through this class.
 * Never call the highlight.php library directly from anywhere else.
 */
class Highlighter
{
    /**
     * Returns syntax-highlighted HTML for the given code and language.
     *
     * Falls back to plain escaped output when the language is unsupported
     * or when highlight.php throws an exception, so the block always
     * renders something useful instead of breaking the page.
     *
     * @param string code     Raw source code.
     * @param string language A valid highlight.php language identifier.
     * @return string         HTML with inline span markup — not escaped,
     *                        already safe to echo inside a pre/codeelement.
     */
    public static function highlight(string $code, string $language): string
    {
        if (!Languages::isValid($language)) {
            Helper::log(
                sprintf('Unknown language slug "%s" — falling back to plain output.', $language),
                'warning',
                ['language' => $language]
            );

            return Helper::escapeCode($code);
        }

        static $hl = null;

        try {
            if ($hl === null) {
                $hl = new HLHighlighter();
            }

            $result = $hl->highlight($language, $code);

            return $result->value;

        } catch (\Exception $e) {
            Helper::log(
                sprintf('Highlighting failed for "%s": %s', $language, $e->getMessage()),
                'error',
                ['language' => $language]
            );

            return Helper::escapeCode($code);
        }
    }

}
