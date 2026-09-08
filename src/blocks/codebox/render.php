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
$makeUrlsClickable = !empty($attributes['makeUrlsClickable']);

if (!Languages::isValid($language)) {
    $language = 'javascript';
}

// --- Highlighting ---

$highlightedCode = Highlighter::highlight($code, $language);

if ($makeUrlsClickable) {
    $highlightedCode = make_clickable($highlightedCode);
}

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
        'style' => $showLineNumbers ? '--cb-first-line:' . $firstLineNumber . ';' : '',

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
        ><?php esc_html_e('Copy', 'rrze-codebox'); ?></button>

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
            data-first-line="<?php echo esc_attr((string) $firstLineNumber); ?>"
            data-highlight-lines="<?php echo esc_attr($highlightLines); ?>"
    ><?php echo $gutter; ?><code class="rrze-codebox__code hljs language-<?php echo
        esc_attr($language);
        ?>"><?php echo $highlightedCode; ?></code></pre>



</div>

