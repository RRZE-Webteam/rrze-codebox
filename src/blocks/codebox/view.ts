/**
 * Frontend script for rrze/codebox.
 * Handles copy-to-clipboard and line-number rendering.
 */

document.addEventListener( 'DOMContentLoaded', () => {
    initCopyButtons();
} );


// ─── Copy to clipboard

  function initCopyButtons(): void {
      const buttons = document.querySelectorAll< HTMLButtonElement >(
          '.rrze-codebox__copy-button'
      );
      buttons.forEach( ( button ) => {
          button.addEventListener( 'click', handleCopy );
      } );
  }

function handleCopy( event: Event ): void {
    const button  = event.currentTarget as HTMLButtonElement;
    const wrapper = button.closest( '.rrze-codebox' );
    const codeEl  = wrapper?.querySelector< HTMLElement >(
        '.rrze-codebox__code' );

    if ( ! codeEl || ! navigator.clipboard ) {
        return;
    }

    navigator.clipboard
        .writeText( codeEl.textContent ?? '' )
        .then( () => markAsCopied( button ) )
        .catch( () => {} );
}

function markAsCopied( button: HTMLButtonElement ): void {
    const copiedLabel   = button.dataset.copiedLabel ?? 'Copied!';
    const originalLabel = button.getAttribute( 'aria-label' ) ?? '';
    const originalText  = button.textContent ?? '';

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
