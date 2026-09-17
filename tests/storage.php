<?php

/**
 * Database-free integration checks against the installed WordPress parser,
 * save filters and KSES. Run: php tests/storage.php [WordPress root]
 */
define('ABSPATH', rtrim($argv[1] ?? dirname(__DIR__, 4), '/') . '/');
if (!is_file(ABSPATH . 'wp-includes/blocks.php')) {
    fwrite(STDERR, "Supply the WordPress root as the first argument.\n");
    exit(1);
}

// Only services outside the parser/filter stack are stubbed. No DB is loaded.
function wp_json_encode($value, $flags = 0, $depth = 512) {
    return json_encode($value, $flags, $depth);
}
function wp_allowed_protocols() { return ['http', 'https']; }
function get_option($key) { return 'UTF-8'; }
function _canonical_charset($value) { return $value; }
function is_utf8_charset(...$args) { return true; }
function wp_is_valid_utf8($value) { return mb_check_encoding($value, 'UTF-8'); }

require ABSPATH . 'wp-includes/plugin.php';
require ABSPATH . 'wp-includes/formatting.php';
if (is_file(ABSPATH . 'wp-includes/class-wp-token-map.php')) {
    require ABSPATH . 'wp-includes/class-wp-token-map.php';
}
foreach ([
    'html5-named-character-references.php',
    'class-wp-html-attribute-token.php',
    'class-wp-html-span.php',
    'class-wp-html-doctype-info.php',
    'class-wp-html-text-replacement.php',
    'class-wp-html-decoder.php',
    'class-wp-html-tag-processor.php',
] as $file) {
    if (is_file(ABSPATH . 'wp-includes/html-api/' . $file)) {
        require ABSPATH . 'wp-includes/html-api/' . $file;
    }
}
require ABSPATH . 'wp-includes/kses.php';
require ABSPATH . 'wp-includes/class-wp-block-parser.php';
require ABSPATH . 'wp-includes/blocks.php';
require __DIR__ . '/../includes/Blocks/ContentStorage.php';
require __DIR__ . '/../includes/Helper.php';

use RRZE\Codebox\Blocks\ContentStorage;
use RRZE\Codebox\Helper;

function same($expected, $actual, string $label): void {
    if ($expected !== $actual) {
        throw new RuntimeException($label . '\nExpected: ' . var_export($expected, true)
            . '\nActual: ' . var_export($actual, true));
    }
    echo "PASS: $label\n";
}

function codeBlock(array $attributes): string {
    return '<!-- wp:rrze/codebox ' . serialize_block_attributes($attributes) . ' /-->';
}

$storage = new ContentStorage();
$storage->init();
add_filter('content_save_pre', 'wp_filter_post_kses');
add_filter('pre_kses', 'wp_pre_kses_block_attributes', 10, 3);

// No code editing is involved: this is the server path when a title is changed.
$code = "<script>alert(\"Ä 😀\")</script>\n<?php echo 'C:\\tmp'; ?>\n&lt;div&gt; &amp;\n\n";
$legacy = codeBlock(['content' => $code, 'caption' => '<script>unsafe</script>caption']);
$saved = wp_unslash(apply_filters('content_save_pre', wp_slash($legacy)));
$attributes = parse_blocks($saved)[0]['attrs'];
same('base64', $attributes['contentEncoding'], 'save adds explicit encoding marker');
same($code, Helper::decodeContent($attributes['content']), 'KSES preserves untouched legacy code');
same('unsafecaption', $attributes['caption'], 'KSES still filters non-code attributes');
same(wp_slash($saved), apply_filters('content_save_pre', wp_slash($saved)), 'repeated saves are idempotent');
same($code, html_entity_decode(Helper::escapeCode($code), ENT_QUOTES, 'UTF-8'), 'entities remain literal in output');

foreach (['test', 'YWJj', '', 'a'] as $raw) {
    $prepared = wp_unslash($storage->prepareForSave(wp_slash(codeBlock(['content' => $raw]))));
    same($raw, Helper::decodeContent(parse_blocks($prepared)[0]['attrs']['content']), 'raw text is never guessed: ' . json_encode($raw));
}

$encoded = codeBlock(['content' => base64_encode($code), 'contentEncoding' => 'base64']);
same(wp_slash($encoded), $storage->prepareForSave(wp_slash($encoded)), 'encoded blocks are not encoded twice');
$unrelated = '<!-- wp:paragraph --><p>Keep &amp; preserve whitespace.</p><!-- /wp:paragraph -->';
same(wp_slash($unrelated), $storage->prepareForSave(wp_slash($unrelated)), 'posts without codebox remain byte-for-byte unchanged');
$nested = '<!-- wp:group --><div class="wp-block-group">' . $unrelated
    . codeBlock(['content' => $code, 'contentEncoding' => 'raw']) . '</div><!-- /wp:group -->';
$result = parse_blocks(wp_unslash(apply_filters('content_save_pre', wp_slash($nested))))[0];
same($code, Helper::decodeContent($result['innerBlocks'][1]['attrs']['content']), 'nested legacy block survives KSES');
same(parse_blocks($nested)[0]['innerBlocks'][0], $result['innerBlocks'][0], 'unrelated sibling is preserved');

echo "All storage checks passed.\n";
