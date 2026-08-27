<?php

declare(strict_types=1);

namespace RRZE\Codebox;

defined('ABSPATH') || exit;

use RRZE\Codebox\Blocks\Blocks;
use RRZE\Codebox\REST\Endpoint;

/**
 * Composition root. Wires all plugin subsystems together.
 *
 * Deliberately small — only instantiation and wiring belong here.
 * Each subsystem registers its own hooks in its own init() method.
 */
class Main
{
    public function __construct()
    {
        $this->init();
    }


    private function init(): void
    {
        (new Blocks())->init();
        (new Endpoint())->init();
    }
}
