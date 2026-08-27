/**
 * Frontend script for rrze/codebox.
 *
 * Handles copy-to-clipboard for each block on the page.
 * Uses the Clipboard API with silent fallback — if the API is unavailable
 * the button simply does nothing (progressive enhancement).
 */

document.addEventListener( 'DOMContentLoaded', initCopyButtons );

function initCopyButtons(): void {
    const buttons = document.querySelectorAll< HTMLButtonElement >(
        '.rrze-codebox__copy-button'
    );

    buttons.forEach( ( button ) => {
        button.addEventListener( 'click', handleCopy );
    } );
}

function handleCopy( event: Event ): void {
    const button = event.currentTarget as HTMLButtonElement;
    const wrapper = button.closest( '.rrze-codebox' );
    const codeEl = wrapper?.querySelector< HTMLElement >(
        '.rrze-codebox__code'
    );

    if ( ! codeEl || ! navigator.clipboard ) {
        return;
    }

    const code = codeEl.textContent ?? '';

    navigator.clipboard
        .writeText( code )
        .then( () => markAsCopied( button ) )
        .catch( () => {
            // Clipboard write failed — no action needed.
        } );
}

function markAsCopied( button: HTMLButtonElement ): void {
    const copiedLabel = button.dataset.copiedLabel ?? 'Copied!';
    const originalLabel = button.getAttribute( 'aria-label' ) ?? '';
    const originalText = button.textContent ?? '';

    button.textContent = copiedLabel;
    button.setAttribute( 'aria-label', copiedLabel );
    button.setAttribute( 'aria-pressed', 'true' );
    button.disabled = true;

    setTimeout( () => {
        button.textContent = originalText;
        button.setAttribute( 'aria-label', originalLabel );
        button.removeAttribute( 'aria-pressed' );
        button.disabled = false;
    }, 2000 );
}

