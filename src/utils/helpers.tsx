/**
 * Encodes a string to Base64, safe for Unicode (UTF-8).
 *
 * btoa() alone only handles Latin-1. TextEncoder converts the string
 * to UTF-8 bytes first, which are then passed as Latin-1 code points
 * to btoa(). This preserves umlauts, emoji, and other non-ASCII input.
 */
export function encodeContent(raw: string): string {
    return btoa(
        new TextEncoder().encode(raw).reduce(
            (acc, byte) => acc + String.fromCodePoint(byte), ''
        )
    );
}

/**
 * Decodes a Base64-encoded string back to Unicode (UTF-8).
 *
 * Returns the original string unchanged if decoding fails —
 * this handles legacy blocks that stored raw content.
 */
export function decodeContent(encoded: string): string {
    try {
        return new TextDecoder().decode(
            Uint8Array.from(atob(encoded), (c) => c.codePointAt(0)!)
        );
    } catch {
        return encoded;
    }
}

/**
 * Builds the line-number gutter for the code preview.
 *
 * Extracted from the JSX template so the render return stays readable.
 *
 * @param code      The code string (HTML or plain text; newlines determine count).
 */
export function lineNumberRows(code: string): JSX.Element {
    const trimmed = code.replace(/[\r\n]+$/, '');
    const count = Math.max(1, (trimmed.match(/\n/g) ?? []).length + 1);
    return (
        <span className="rrze-codebox__line-numbers-rows" aria-hidden>
         {Array.from({length: count}).map((_, i) => <span key={i}/>)}
        </span>
);
}
