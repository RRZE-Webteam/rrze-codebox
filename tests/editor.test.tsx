import {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {TextEncoder, TextDecoder} from 'util';
import apiFetch from '@wordpress/api-fetch';
import Edit from '../src/blocks/codebox/edit';
import {encodeContent, decodeContent} from '../src/utils/helpers';

jest.mock('@wordpress/i18n', () => ({__: (text: string) => text}));
jest.mock('@wordpress/element', () => jest.requireActual('react'));
jest.mock('@wordpress/api-fetch', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@wordpress/block-editor', () => ({
    useBlockProps: (props: object) => props,
    BlockControls: () => null,
    InspectorControls: () => null,
    PlainText: () => null,
}));
jest.mock('@wordpress/components', () => ({
    PanelBody: () => null, ToggleControl: () => null, TextControl: () => null,
    SelectControl: () => null, ToolbarGroup: () => null,
    ToolbarDropdownMenu: () => null, ToolbarButton: () => null,
    __experimentalNumberControl: () => null,
}));

Object.assign(globalThis, {
    TextEncoder, TextDecoder, IS_REACT_ACT_ENVIRONMENT: true,
    rrzeCodeboxData: {languages: {javascript: 'JavaScript'}},
});

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement('div');
    root = createRoot(container);
});
afterEach(() => {
    act(() => root.unmount());
    jest.useRealTimers();
});

const defaults = {
    content: '', contentEncoding: 'raw' as const, language: 'javascript',
    theme: 'light' as const, showLineNumbers: true, firstLineNumber: 7,
    showLanguage: true, syntaxHighlighting: true, caption: '', captionUrl: '',
};

test.each(['test', 'YWJj', '<script>alert("Ä 😀")</script>\n&lt;div&gt;']) (
    'migrates an untouched legacy block without interpreting its text: %s', (content) => {
        const setAttributes = jest.fn();
        act(() => root.render(<Edit attributes={{...defaults, content}} setAttributes={setAttributes} isSelected={false}/>));
        expect(container.querySelector('code')?.textContent).toBe(content);
        expect(setAttributes).toHaveBeenCalledTimes(1);
        const migrated = setAttributes.mock.calls[0][0];
        expect(migrated.contentEncoding).toBe('base64');
        expect(decodeContent(migrated.content)).toBe(content);

        act(() => root.render(<Edit attributes={{...defaults, ...migrated}} setAttributes={setAttributes} isSelected={false}/>));
        expect(setAttributes).toHaveBeenCalledTimes(1);
        expect(container.querySelector('code')?.textContent).toBe(content);
    }
);

test('already encoded content uses the text fallback without migrating again', () => {
    const content = '<script>"Ä 😀"</script> &lt;div&gt;';
    const setAttributes = jest.fn();
    act(() => root.render(<Edit attributes={{...defaults, content: encodeContent(content), contentEncoding: 'base64'}} setAttributes={setAttributes} isSelected={false}/>));
    expect(container.querySelector('code')?.textContent).toBe(content);
    expect(container.querySelector('code script')).toBeNull();
    expect(setAttributes).not.toHaveBeenCalled();
});

test('highlighted previews count source lines, not HTML closing tags', async () => {
    jest.mocked(apiFetch).mockResolvedValue({html: '<span class="hljs-comment">&lt;!-- comment\n\n</span>'});
    act(() => root.render(<Edit attributes={{...defaults, content: encodeContent('<!-- comment\n\n'), contentEncoding: 'base64'}} setAttributes={jest.fn()} isSelected={false}/>));
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(container.querySelector('.hljs-comment')).not.toBeNull();
    expect(container.querySelectorAll('.rrze-codebox__line-numbers-rows > span')).toHaveLength(1);
});
