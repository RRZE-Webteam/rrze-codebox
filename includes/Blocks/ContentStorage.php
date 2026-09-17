<?php

declare(strict_types=1);

namespace RRZE\Codebox\Blocks;

defined('ABSPATH') || exit;

/**
 * Protects legacy code attributes before WordPress sanitizes a saved post.
 * Also covers saves outside the block editor, such as wp_update_post().
 */
class ContentStorage
{
    public function init(): void
    {
        // WordPress runs wp_filter_post_kses at priority 10.
        add_filter('content_save_pre', [$this, 'prepareForSave'], 8);
    }

    /**
     * content_save_pre receives and returns slashed post content.
     */
    public function prepareForSave(string $content): string
    {
        if (!str_contains($content, '<!-- wp:rrze/codebox')) {
            return $content;
        }

        $blocks = parse_blocks(wp_unslash($content));
        $changed = false;
        $blocks = $this->encodeBlocks($blocks, $changed);

        return $changed ? wp_slash(serialize_blocks($blocks)) : $content;
    }

    /**
     * @param array<int, array<string, mixed>> $blocks
     * @return array<int, array<string, mixed>>
     */
    private function encodeBlocks(array $blocks, bool &$changed): array
    {
        foreach ($blocks as &$block) {
            if (($block['blockName'] ?? null) === 'rrze/codebox') {
                $attributes = $block['attrs'];
                $encoding = $attributes['contentEncoding'] ?? 'raw';
                $code = $attributes['content'] ?? null;

                if ($encoding === 'raw' && is_string($code)) {
                    $block['attrs']['content'] = base64_encode($code);
                    $block['attrs']['contentEncoding'] = 'base64';
                    $changed = true;
                }
            }

            if (!empty($block['innerBlocks'])) {
                $block['innerBlocks'] = $this->encodeBlocks($block['innerBlocks'], $changed);
            }
        }
        unset($block);

        return $blocks;
    }
}
