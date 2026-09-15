import {encodeContent, decodeContent, lineNumberRows} from '../../utils/helpers';
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
    ToolbarDropdownMenu,
    ToolbarButton,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import {useState, useEffect} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

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
    showLanguage: boolean;
    syntaxHighlighting: boolean;
    caption: string;
    captionUrl: string;
}

interface HighlightResponse {
    html: string;
}

interface EditProps {
    attributes: Attributes;
    setAttributes: (attrs: Partial<Attributes>) => void;
    isSelected: boolean;
}

const iconLight = (
    <svg width="20" height="20" viewBox="0 0 24 24"
         aria-hidden="true" focusable="false"
         fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="4" y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
);

const iconDark = (
    <svg width="20" height="20" viewBox="0 0 24 24"
         aria-hidden="true" focusable="false"
         fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
);

export default function Edit({attributes, setAttributes, isSelected}: EditProps) {
    const {
        content,
        language,
        theme,
        showLineNumbers,
        firstLineNumber,
        showLanguage,
        syntaxHighlighting,
        caption,
        captionUrl,
    } = attributes;

    const decodedContent = decodeContent(content);

    const [previewHtml, setPreviewHtml] = useState<string>('');

    const blockProps = useBlockProps({
        className: [
            'rrze-codebox',
            `rrze-codebox--${theme}`,
            showLineNumbers ? 'rrze-codebox--line-numbers' : '',
        ].filter(Boolean).join(' '),
    });

    // Fetch highlighted preview from PHP — same logic as the frontend render.
    // AbortController cancels the previous request when content or language
    // changes before the debounce fires, preventing race conditions.
    useEffect(() => {
        if (!syntaxHighlighting || !decodedContent.trim()) {
            setPreviewHtml('');
            return;
        }

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            apiFetch<HighlightResponse>({
                path: '/rrze-codebox/v1/highlight',
                method: 'POST',
                data: {code: decodedContent, language},
                signal: controller.signal,
            })
                .then((response) => setPreviewHtml(response.html))
                .catch((error) => {
                    if (error?.name !== 'AbortError') {
                        setPreviewHtml('');
                    }
                })
        }, 400);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [decodedContent, language, syntaxHighlighting]);

    const languageOptions = Object.entries(rrzeCodeboxData.languages).map(
        ([value, label]) => ({value, label})
    );

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={iconLight}
                        label={__('Light theme', 'rrze-codebox')}
                        isPressed={'light' === theme}
                        onClick={() => setAttributes({theme: 'light'})}
                    />
                    <ToolbarButton
                        icon={iconDark}
                        label={__('Dark theme', 'rrze-codebox')}
                        isPressed={'dark' === theme}
                        onClick={() => setAttributes({theme: 'dark'})}
                    />
                    <ToolbarDropdownMenu
                        icon={
                            <span style={{
                                fontSize: '0.9em',
                                fontWeight: 500,
                                lineHeight: 1,
                            }}>
                            {languageOptions.find(o => o.value === language)?.label ?? language}
                            </span>
                        }
                        label={__('Language', 'rrze-codebox')}
                        controls={languageOptions.map(({value, label}) => ({
                            title: label,
                            isActive: value === language,
                            onClick: () => setAttributes({language: value}),
                        }))}
                    />
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Code settings', 'rrze-codebox')}>
                    <SelectControl
                        label={__('Language', 'rrze-codebox')}
                        value={language}
                        options={languageOptions}
                        onChange={(value) => setAttributes({language: value})}
                    />
                    <ToggleControl
                        label={__('Show line numbers', 'rrze-codebox')}
                        checked={showLineNumbers}
                        onChange={(value) => setAttributes({showLineNumbers: value})}
                    />
                    {showLineNumbers && (
                        <NumberControl
                            label={__('First line number', 'rrze-codebox')}
                            value={firstLineNumber}
                            min={1}
                            onChange={(value) => setAttributes({firstLineNumber: parseInt(value ?? '1', 10),})}
                        />
                    )}
                    <ToggleControl
                        label={__('Syntax highlighting', 'rrze-codebox')}
                        checked={syntaxHighlighting}
                        onChange={(value) => setAttributes({syntaxHighlighting: value})}
                    />
                    <ToggleControl
                        label={__('Show language label', 'rrze-codebox')}
                        checked={showLanguage}
                        onChange={(value) => setAttributes({showLanguage: value})}
                    />
                </PanelBody>
                <PanelBody title={__('Caption', 'rrze-codebox')} initialOpen={false}>
                    <TextControl
                        label={__('Description', 'rrze-codebox')}
                        value={caption}
                        onChange={(value) => setAttributes({caption: value})}
                    />
                    <TextControl
                        label={__('Source URL', 'rrze-codebox')}
                        value={captionUrl}
                        type="url"
                        onChange={(value) => setAttributes({captionUrl: value})}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {isSelected ? (
                    <PlainText
                        value={decodedContent}
                        onChange={(value) => setAttributes({content: encodeContent(value)})}
                        placeholder={__('Paste or type your code here…', 'rrze-codebox')}
                        aria-label={__('Code input', 'rrze-codebox')}
                        style={{minHeight: `${Math.max(3, decodedContent.split('\n').length) * 1.5}em`}}
                    />
                ) : (
                    <div className="rrze-codebox__body">
                        {syntaxHighlighting && previewHtml ? (
                            <pre
                                className="rrze-codebox__pre"
                                style={showLineNumbers ? {'--rrze-codebox-first-line': firstLineNumber} as React.CSSProperties : {}}
                            >
                                {showLineNumbers && lineNumberRows(previewHtml)}
                                {/* Safe: HTML comes from our own REST endpoint
                                    (edit_posts required) and highlight.php escapes
                                    all user input via htmlspecialchars(). */}
                                <code
                                    className={`rrze-codebox__code hljs language-${language}`}
                                    dangerouslySetInnerHTML={{__html: previewHtml}}
                                />
                            </pre>
                        ) : (
                            decodedContent && (
                                <pre className="rrze-codebox__pre">
                                    <code className={`rrze-codebox__code language-${language}`}>
                                        {decodedContent}
                                    </code>
                                </pre>
                            )
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

