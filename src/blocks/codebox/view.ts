/**
 * Frontend script for rrze/codebox.
 * Handles copy-to-clipboard and line-number rendering.
 */

document.addEventListener( 'DOMContentLoaded', () => {
    initCopyButtons();
} );


// ─── Copy to clipboard

function initCopyButtons(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.rrze-codebox__copy-button');
    buttons.forEach( ( button ) => {
        // aria-label für den Reset merken
        const ariaLabel = button.getAttribute( 'aria-label' );
        if ( ariaLabel ) {
            button.dataset.originalAriaLabel = ariaLabel;
        }
        button.addEventListener( 'click', handleCopy );
    } );
}

function handleCopy( event: Event ): void {
    const button  = event.currentTarget as HTMLButtonElement;
    const wrapper = button.closest( '.rrze-codebox' );
    const codeEl  = wrapper?.querySelector<HTMLElement>('.rrze-codebox__code');

    if ( ! codeEl ) {
        return;
    }

    const text = codeEl.textContent ?? '';

    if ( navigator.clipboard ) {
        navigator.clipboard
            .writeText( text )
            .then( () => markAsCopied( button ) )
            .catch( () => {} );
    } else {
        // Fallback for non-secure HTTP contexts (e.g. local dev)
        const textarea = document.createElement( 'textarea' );
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild( textarea );
        textarea.select();
        try {
            document.execCommand( 'copy' );
            markAsCopied( button );
        } catch ( _e ) {}
        document.body.removeChild( textarea );
    }
}

function markAsCopied( button: HTMLButtonElement ): void {
    const copiedLabel = button.dataset.copiedLabel ?? 'Copied!';
    const labelEl     = button.querySelector(
        '.rrze-codebox__copy-label' );
    const originalText = labelEl?.textContent ?? '';

    if ( labelEl ) {
        labelEl.textContent = copiedLabel;
    }
    button.setAttribute( 'aria-label', copiedLabel );
    button.setAttribute( 'aria-pressed', 'true' );
    button.disabled = true;

    setTimeout( () => {
        if ( labelEl ) {
            labelEl.textContent = originalText;
        }
        button.setAttribute(
            'aria-label',
            button.dataset.originalAriaLabel ?? 'Copy code to clipboard'
        );
        button.removeAttribute( 'aria-pressed' );
        button.disabled = false;
    }, 2000 );
}
