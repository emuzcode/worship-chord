/**
 * Wraps a navigation in document.startViewTransition when supported, so
 * elements that share a view-transition-name morph between routes instead
 * of swapping instantly. Falls through to the navigation as-is on browsers
 * without the API (older Safari, Firefox).
 */
type StartViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

export function navigateWithTransition(navigate: () => void) {
  if (typeof document === "undefined") {
    navigate();
    return;
  }
  const doc = document as StartViewTransitionDoc;
  if (typeof doc.startViewTransition !== "function") {
    navigate();
    return;
  }
  doc.startViewTransition(() => navigate());
}
