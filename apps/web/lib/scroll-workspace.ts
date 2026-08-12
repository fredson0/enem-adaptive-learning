/** Scroll do container principal do workspace (não é o window — usa overflow interno). */
export function scrollWorkspaceToTop(behavior: ScrollBehavior = "smooth") {
  const containers = document.querySelectorAll<HTMLElement>(
    "[data-workspace-scroll]",
  );
  if (containers.length > 0) {
    containers.forEach((container) => {
      container.scrollTo({ top: 0, behavior });
      container.scrollTop = 0;
    });
    return;
  }
  window.scrollTo({ top: 0, behavior });
}
