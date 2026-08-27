import {__} from '@wordpress/i18n';
import {
    useBlockProps,
    BlockControls,
    InspectorControls,
    PlainText,
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl,
    TextControl,
    SelectControl,
    ToolbarGroup,
    ToolbarButton,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import {useState, useEffect} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type {BlockEditProps} from '@wordpress/blocks';

// Provided by Blocks.php via wp_localize_script.
declare const rrzeCodeboxData: {
    languages: Record<string, string>;
};

interface Attributes {
    content: string;
    language: string;
    theme: 'light' | 'dark';
    showLineNumbers: boolean;
    firstLineNumber: number;
    highlightLines: string;
    showLanguage: boolean;
    makeUrlsClickable: boolean;
}

interface HighlightResponse {
    html: string;
}

export default function Edit({
                                 attributes,
                                 setAttributes,
                             }: BlockEditProps<Attributes>) {
    const {
        content,
        language,
        theme,
        showLineNumbers,
        firstLineNumber,
        highlightLines,
        showLanguage,
        makeUrlsClickable,
    } = attributes;

    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const blockProps = useBlockProps({
        className: `rrze-codebox rrze-codebox--${theme}`,
    });

    // Fetch highlighted preview from PHP — same logic as the frontend render.
    // AbortController cancels the previous request when content or language
    // changes before the debounce fires, preventing race conditions.
    useEffect(() => {
        if (!content.trim()) {
            setPreviewHtml('');
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);

        const timeout = setTimeout(() => {
            apiFetch<HighlightResponse>({
                path: '/rrze-codebox/v1/highlight',
                method: 'POST',
                data: {code: content, language},
                signal: controller.signal,
            })
                .then((response) => setPreviewHtml(response.html))
                .catch((error) => {
                    if (error?.name !== 'AbortError') {
                        setPreviewHtml('');
                    }
                })
                .finally(() => setIsLoading(false));
        }, 400);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [content, language]);

    const languageOptions = Object.entries(rrzeCodeboxData.languages).map(
        ([value, label]) => ({value, label})
    );

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon="visibility"
                        label={__('Light theme', 'rrze-codebox')}
                        isPressed={'light' === theme}
                        onClick={() => setAttributes({theme: 'light'})}
                    />
                    <ToolbarButton
                        icon="hidden"
                        label={__('Dark theme', 'rrze-codebox')}
                        isPressed={'dark' === theme}
                        onClick={() => setAttributes({theme: 'dark'})}
                    />
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Code settings', 'rrze-codebox')}>
                    <SelectControl
                        label={__('Language', 'rrze-codebox')}
                        value={language}
                        options={languageOptions}
                        onChange={(value) =>
                            setAttributes({language: value})
                        }
                    />
                    <ToggleControl
                        label={__('Show line numbers', 'rrze-codebox')}
                        checked={showLineNumbers}
                        onChange={(value) =>
                            setAttributes({showLineNumbers: value})
                        }
                    />
                    {showLineNumbers && (
                        <NumberControl
                            label={__('First line number', 'rrze-codebox')}
                            value={firstLineNumber}
                            min={1}
                            onChange={(value) =>
                                setAttributes({
                                    firstLineNumber: parseInt(
                                        value ?? '1',
                                        10
                                    ),
                                })
                            }
                        />
                    )}
                    <TextControl
                        label={__('Highlight lines', 'rrze-codebox')}
                        help={__('Example: 1,5,10-20', 'rrze-codebox')}
                        value={highlightLines}
                        onChange={(value) =>
                            setAttributes({highlightLines: value})
                        }
                    />
                    <ToggleControl
                        label={__('Show language label', 'rrze-codebox')}
                        checked={showLanguage}
                        onChange={(value) =>
                            setAttributes({showLanguage: value})
                        }
                    />
                    <ToggleControl
                        label={__('Make URLs clickable', 'rrze-codebox')}
                        checked={makeUrlsClickable}
                        onChange={(value) =>
                            setAttributes({makeUrlsClickable: value})
                        }
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <PlainText
                    value={content}
                    onChange={(value) =>
                        setAttributes({content: value})
                    }
                    placeholder={__(
                        'Paste or type your code here…', 'rrze-codebox'
                    )}
                    aria-label={__('Code input', 'rrze-codebox')}
                />
                {isLoading && (
                    <p
                        className="rrze-codebox__editor-loading"
                        aria-live="polite"
                    >
                        {__('Updating preview…', 'rrze-codebox')}
                    </p>
                )}
                {previewHtml && !isLoading && (
                    <div
                        className="rrze-codebox__editor-preview"
                        aria-hidden="true"
                        // Safe: output comes from our own highlight.php endpoint.
                        dangerouslySetInnerHTML={{__html: previewHtml}}
                    />
                )}
            </div>
        </>
    );
}

