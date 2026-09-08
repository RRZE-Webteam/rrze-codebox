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

interface EditProps {
    attributes: Attributes;
    setAttributes: (attrs: Partial<Attributes>) => void;
    isSelected: boolean;
}

const iconLight = (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="white" stroke="#C0CBDA" strokeWidth="1.5"/>
    </svg>
);

const iconDark = (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="#04316A" stroke="white" strokeWidth="1.5"/>
    </svg>
);

export default function Edit({attributes, setAttributes, isSelected}: EditProps) {
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

    const iconLight = (
        <svg width="24" height="24" viewBox="0 0 24 24"
             aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="white" stroke="#C0CBDA"
                    strokeWidth="1.5"/>
        </svg>
    );

    const iconDark = (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="#04316A"  stroke="white" strokeWidth="1.5"/>
        </svg>
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
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Code settings', 'rrze-codebox')}>
                    <SelectControl
                        label={__('Language', 'rrze-codebox')}
                        value={language}
                        options={languageOptions}
                        onChange={(value) => setAttributes({language: value})
                        }
                    />
                    <ToggleControl
                        label={__('Show line numbers', 'rrze-codebox')}
                        checked={showLineNumbers}
                        onChange={(value) => setAttributes({showLineNumbers: value})
                        }
                    />
                    {showLineNumbers && (
                        <NumberControl
                            label={__('First line number', 'rrze-codebox')}
                            value={firstLineNumber}
                            min={1}
                            onChange={(value) => setAttributes({
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
                {isSelected ? (
                    <PlainText
                        value={content}
                        onChange={(value) => setAttributes({content: value})}
                        placeholder={__('Paste or type your code here…', 'rrze-codebox')}
                        aria-label={__('Code input', 'rrze-codebox')}
                    />
                ) : (
                    previewHtml && (
                        <pre className="rrze-codebox__pre" aria-hidden={true}
                             style={showLineNumbers ? {'--cb-first-line': firstLineNumber} as
                                 React.CSSProperties : {}}>
              {showLineNumbers && (() => {
                  const count = Math.max(1, (previewHtml.match(/\n/g) ?? []).length + 1);
                  return (
                      <span className="rrze-codebox__line-numbers-rows" aria-hidden>
                          {Array.from({length: count}).map((_, i) => <span key={i}/>)}
                      </span>
                  );
              })()}
                            <code
                                className={`rrze-codebox__code hljs language-${language}`}
                                dangerouslySetInnerHTML={{__html: previewHtml}}
                            />
          </pre>

                    )
                )}
                {isLoading && (
                    <p className="rrze-codebox__editor-loading" aria-live="polite">
                        {__('Updating preview…', 'rrze-codebox')}
                    </p>
                )}
            </div>
        </>
    );
}

function parseHighlightLines(spec: string): Set<number> {
    const result = new Set<number>();
    if (!spec.trim()) return result;
    for (const part of spec.split(',')) {
        const range = part.trim().split('-');
        if (range.length === 2) {
            for (let i = parseInt(range[0], 10); i <= parseInt(range[1],
                10); i++) {
                result.add(i);
            }
        } else {
            const n = parseInt(part.trim(), 10);
            if (!isNaN(n)) result.add(n);
        }
    }
    return result;
}
