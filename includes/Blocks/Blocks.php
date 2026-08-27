<?php

declare(strict_types=1);

namespace RRZE\Codebox\Blocks;

defined('ABSPATH') || exit;

use RRZE\Codebox\Config\Languages;

/**
 * Registers the codebox block type and the RRZE block category.
 *
 * Block assets are loaded conditionally by WordPress — only on pages
 * where the block is actually present.
 */
class Blocks
{
    /** @var string[] */
    private array $blockDirectories = ['codebox'];

    public function init(): void
    {
        add_action('init', [$this, 'registerBlocks']);
        add_filter('block_categories_all', [$this, 'registerBlockCategory'], 10, 1);
    }

    /**
     * Adds the RRZE category to the block inserter if not already present.
     *
     * Only blocks developed by or accepted by RRZE may use this category.
     *
     * @param array<int, array<string, string>> categories
     * @return array<int, array<string, string>>
     */
    public function registerBlockCategory(array $categories): array
    {
        foreach ($categories as $category) {
            if ('rrze' === $category['slug']) {
                return $categories;
            }
        }

        $categories[] = [
            'slug'  => 'rrze',
            'title' => __('RRZE', 'rrze-codebox'),
        ];

        return $categories;
    }

    /**
     * Registers each block from its build directory and passes the
     * language list to the editor script via wp_localize_script.
     */
    public function registerBlocks(): void
    {
        foreach ($this->blockDirectories as $directory) {
            $path = RRZE_CODEBOX_DIR . 'build/blocks/' . $directory;

            if (!file_exists($path . '/block.json')) {
                // Build output missing — fail quietly instead of a fatal
                // error so a fresh checkout without npm run build is usable.
                  continue;
              }

            $blockType = register_block_type($path);

            if (!$blockType instanceof \WP_Block_Type) {
                continue;
            }

            foreach ($blockType->editor_script_handles as $handle) {
                wp_localize_script(
                    $handle,
                    'rrzeCodeboxData',
                    ['languages' => Languages::getAll()]
                );
            }
        }
    }
}

