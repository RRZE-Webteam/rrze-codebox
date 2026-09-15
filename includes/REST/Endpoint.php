<?php

declare(strict_types=1);

namespace RRZE\Codebox\REST;

defined('ABSPATH') || exit;

use RRZE\Codebox\Config\Languages;
use RRZE\Codebox\Highlighter\Highlighter;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * REST endpoint for the block editor live preview.
 *
 * POST /rrze-codebox/v1/highlight
 *
 * Returns highlighted HTML using the same PHP logic as the frontend
 * render — editor preview and published output are always identical.
 */
class Endpoint
{
    private const REST_NAMESPACE = 'rrze-codebox/v1';
    private const REST_ROUTE = '/highlight';

    public function init(): void
    {
        add_action('rest_api_init', [$this, 'register']);
    }


    /**
     * Registers the route with WordPress.
     */
    public function register(): void
    {
        register_rest_route(
            self::REST_NAMESPACE,
            self::REST_ROUTE,
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'handle'],
                'permission_callback' => [$this, 'checkPermission'],
                'args' => $this->getArgs(),
            ]
        );
    }


    /**
     * Only users who can edit posts may call this endpoint.
     * The block editor is only accessible to such users anyway.
     */
    public function checkPermission(): bool
    {
        return current_user_can('edit_posts');
    }


    /**
     * Handles the request and returns highlighted HTML.
     */
    public function handle(WP_REST_Request $request): WP_REST_Response
    {
        $code = (string)$request->get_param('code');
        $language = (string)$request->get_param('language');

        $html = Highlighter::highlight($code, $language);

        return new WP_REST_Response(['html' => $html], 200);
    }


    /**
     * @return array<string, mixed>
     */
    private function getArgs(): array
    {
        return [
            'code' => [
                'required' => true,
                'type' => 'string',
                'validate_callback' => [$this, 'validateCode'],
                'sanitize_callback' => [$this, 'sanitizeCode'],
            ],
            'language' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => [$this, 'sanitizeLanguage'],
                'validate_callback' => [$this, 'validateLanguage'],
            ],
        ];
    }


    /**
     * Rejects code payloads longer than 200.000 characters.
     *
     * Prevents authenticated users from sending arbitrarily large
     * inputs to highlight.php, which would consume excessive CPU.
     */
    public function validateCode(string $value): bool|\WP_Error
    {
        $maxLength = 200000;

        if (mb_strlen($value, 'UTF-8') > $maxLength) {
            return new \WP_Error(
                'rest_code_too_long',
                sprintf(
                /* translators: %s: maximum allowed character count */
                    __('The code must not exceed %s characters.', 'rrze-codebox'),
                    number_format_i18n($maxLength)
                ),
                ['status' => 400]
            );
        }

        return true;
    }


    /**
     * Ensures the code value is a string.
     *
     * No content sanitization — raw source code must be preserved as-is.
     * Output escaping happens in Highlighter::highlight().
     */
    public function sanitizeCode(mixed $value): string
    {
        return (string)$value;
    }


    /**
     * Reduces the language value to a safe slug.
     */
    public function sanitizeLanguage(string $value): string
    {
        return sanitize_key($value);
    }


    /**
     * Returns true when the language slug exists in the supported list.
     */
    public function validateLanguage(string $value): bool
    {
        return Languages::isValid(sanitize_key($value));
    }
}
