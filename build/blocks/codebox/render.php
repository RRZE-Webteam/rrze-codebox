<?php

/**
 * Server-side render template for rrze/codebox.
 *
 * Variables provided by WordPress:
 *   $attributes — block attribute values merged with block.json defaults
 *   $content    — inner block content (unused, no inner blocks)
 *   $block      — WP_Block instance
 */

if (!defined('ABSPATH')) {
    exit;
}

use RRZE\Codebox\Config\Languages;
use RRZE\Codebox\Highlighter\Highlighter;
use RRZE\Codebox\Helper;

// --- Attributes ---

$rawContent         = isset($attributes['content']) ? (string) $attributes['content'] : '';
$encoding           = $attributes['contentEncoding'] ?? 'raw';
$code               = 'base64' === $encoding ? Helper::decodeContent($rawContent) : $rawContent;
$language           = isset($attributes['language']) ? sanitize_key($attributes['language']) : 'javascript';
$theme              = isset($attributes['theme']) && 'dark' === $attributes['theme'] ? 'dark' : 'light';
$showLineNumbers    = !empty($attributes['showLineNumbers']);
$firstLineNumber    = isset($attributes['firstLineNumber']) ? max(1, (int) $attributes['firstLineNumber']) : 1;
$showLanguage       = !isset($attributes['showLanguage']) || (bool) $attributes['showLanguage'];
$syntaxHighlighting = !isset($attributes['syntaxHighlighting']) || (bool) $attributes['syntaxHighlighting'];
$caption            = isset($attributes['caption']) ? (string) $attributes['caption'] : '';
$captionUrl         = isset($attributes['captionUrl']) ? (string) $attributes['captionUrl'] : '';

if (!Languages::isValid($language)) {
    $language = 'javascript';
}

// --- Highlighting ---
$highlightedCode = $syntaxHighlighting
    ? Highlighter::highlight($code, $language)
    : Helper::escapeCode($code);

// --- Language label ---
$allLanguages  = Languages::getAll();
$languageLabel = $allLanguages[$language] ?? $language;

// --- Wrapper ---
$wrapperAttributes = get_block_wrapper_attributes([
    'class' => implode(' ', array_filter([
        'rrze-codebox',
        'rrze-codebox--' . $theme,
        $showLineNumbers ? 'rrze-codebox--line-numbers' : '',
    ])),
    'style' => $showLineNumbers ? '--rrze-codebox-first-line: ' . $firstLineNumber . ';' : '',
]);
?>
<div <?php echo $wrapperAttributes; ?>>

    <div class="rrze-codebox__header">
        <?php if ($showLanguage) : ?>
            <span class="rrze-codebox__language-label"><?php echo esc_html($languageLabel); ?></span>
        <?php endif; ?>

        <button
            type="button"
            class="rrze-codebox__copy-button"
            aria-label="<?php esc_attr_e('Copy code to clipboard', 'rrze-codebox'); ?>"
            data-copied-label="<?php esc_attr_e('Copied!', 'rrze-codebox'); ?>"
        >
            <svg class="rrze-codebox__copy-icon" aria-hidden="true" focusable="false"
                 width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span class="rrze-codebox__copy-label"><?php esc_html_e('Copy', 'rrze-codebox'); ?></span>
        </button>
    </div>

    <?php
    if ($showLineNumbers) :
        $lines     = explode("\n", str_replace("\r\n", "\n", rtrim($code, "\r\n")));
        $lineCount = max(1, count($lines));
        $rows      = str_repeat('<span></span>', $lineCount);
        $gutter    = '<span class="rrze-codebox__line-numbers-rows" aria-hidden="true">'
            . $rows . '</span>';
    else :
        $gutter = '';
    endif;
    ?>
    <div class="rrze-codebox__body">
        <pre
            class="rrze-codebox__pre"
            data-first-line="<?php echo esc_attr((string) $firstLineNumber); ?>"
        ><?php echo $gutter; ?><code class="rrze-codebox__code hljs language-<?php echo esc_attr($language); ?>"><?php
            // highlight.php escapes all user-supplied code via htmlspecialchars()
            // before wrapping it in <span> elements. $highlightedCode is therefore
            // safe HTML and must not be double-escaped — esc_html() would render
            // the <span> tags as visible text instead of applying syntax colours.
            echo $highlightedCode;
            ?></code></pre>

        <?php if ($caption || $captionUrl) : ?>
        <div class="rrze-codebox__caption">
            <?php if ($caption) : ?>
                <span class="rrze-codebox__caption-text"><?php echo esc_html($caption); ?></span>
            <?php endif; ?>
            <?php if ($captionUrl) : ?>
                <a href="<?php echo esc_url($captionUrl); ?>" class="rrze-codebox__caption-src"
                   rel="noopener noreferrer" target="_blank">
                    <?php esc_html_e('Source', 'rrze-codebox'); ?>
                </a>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
</div>

