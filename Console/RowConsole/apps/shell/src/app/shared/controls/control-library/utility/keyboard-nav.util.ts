/**
 * Utility class to handle keyboard navigation between form controls.
 */
export class KeyboardNavUtil {
  /**
   * Focuses the element with the given ID.
   * @param elementId The ID of the form control to focus (usually the field key).
   */
  static focus(elementId: string): void {
    if (!elementId) return;

    const element = document.getElementById(elementId);
    
    if (element) {
      // Focus the element
      element.focus();

      // If it's an input or textarea, optionally select the text for quick editing
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        // Checking if select is supported (e.g. not 'email' or 'number' in some browsers/contexts)
        try {
          element.select();
        } catch (e) {
          // Ignore selection errors for types that don't support it
        }
      }
    } else {
      console.warn(`[KeyboardNav] Element with ID '${elementId}' not found.`);
    }
  }
}