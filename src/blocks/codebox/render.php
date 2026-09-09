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

// --- Attributes ---

$code = isset($attributes['content']) ? (string)
$attributes['content'] : '';
$language = isset($attributes['language']) ? sanitize_key($attributes['language']) : 'javascript';
$theme = isset($attributes['theme']) && 'dark' === $attributes['theme'] ? 'dark' : 'light';
$showLineNumbers = !empty($attributes['showLineNumbers']);
$firstLineNumber = isset($attributes['firstLineNumber']) ? max(1, (int)
$attributes['firstLineNumber']) : 1;
$highlightLines = isset($attributes['highlightLines']) ? (string)
$attributes['highlightLines'] : '';
$showLanguage = !isset($attributes['showLanguage']) || (bool)
        $attributes['showLanguage'];
$syntaxHighlighting = !isset($attributes['syntaxHighlighting']) || (bool) $attributes['syntaxHighlighting'];
$caption    = isset($attributes['caption']) ? (string) $attributes['caption'] : '';
$captionUrl = isset($attributes['captionUrl']) ? esc_url_raw($attributes['captionUrl']) : '';

if (!Languages::isValid($language)) {
    $language = 'javascript';
}

// --- Highlighting ---

$highlightedCode = $syntaxHighlighting
        ? Highlighter::highlight($code, $language)
        : esc_html($code);

// --- Language label ---

$allLanguages = Languages::getAll();
$languageLabel = $allLanguages[$language] ?? $language;

// --- Wrapper ---

$wrapperAttributes = get_block_wrapper_attributes([
        'class' => implode(' ', array_filter([
                'rrze-codebox',
                'rrze-codebox--' . $theme,
                $showLineNumbers ? 'rrze-codebox--line-numbers' : '',
        ])),
        'style' => $showLineNumbers ? '--cb-first-line: ' . $firstLineNumber . ';' : '',

]);
?>
<div <?php echo $wrapperAttributes; ?>>

    <div class="rrze-codebox__header">

        <?php if ($showLanguage) : ?>
            <span class="rrze-codebox__language-label">
                  <?php echo esc_html($languageLabel); ?>
              </span>
        <?php endif; ?>

        <button
                type="button"
                class="rrze-codebox__copy-button"
                aria-label="<?php esc_attr_e('Copy code to clipboard', 'rrze-codebox'); ?>"
                data-copied-label="<?php esc_attr_e('Copied!', 'rrze-codebox'); ?>"
        >
            <span class="rrze-codebox__copy-label">
                <?php esc_html_e('Copy', 'rrze-codebox'); ?>
            </span>
        </button>

    </div>

    <?php
    if ($showLineNumbers) :
        $lineCount = max(1, substr_count(rtrim($highlightedCode, "\n"), "\n") + 1);
        $rows = str_repeat('<span></span>', $lineCount);
        $gutter = '<span class="rrze-codebox__line-numbers-rows" aria-hidden="true">' .
                $rows . '</span>';
    else :
        $gutter = '';
    endif;
    ?>
    <pre
            class="rrze-codebox__pre"
            data-first-line="<?php echo esc_attr((string)$firstLineNumber); ?>"
            data-highlight-lines="<?php echo esc_attr($highlightLines); ?>"
    ><?php echo $gutter; ?><code class="rrze-codebox__code hljs language-<?php echo
        esc_attr($language);
        ?>"><?php echo $highlightedCode; ?></code></pre>

    <?php if ($caption || $captionUrl) : ?>
    <footer class="rrze-codebox__caption">
        <?php if ($caption) : ?>
            <span class="rrze-codebox__caption-text"><?php echo esc_html($caption); ?></span>
        <?php endif; ?>
        <?php if ($captionUrl) : ?>
            <a href="<?php echo esc_url($captionUrl); ?>" class="rrze-codebox__caption-src" rel="noopener noreferrer" target="_blank">
                <?php esc_html_e('Source', 'rrze-codebox'); ?>
            </a>
        <?php endif; ?>
    </footer>
    <?php endif; ?>

</div>

