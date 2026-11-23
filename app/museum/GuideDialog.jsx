import React, { useId, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import "./GuideDialog.css";

function focusAfterClose(trigger, previous) {
  const gallery = document.getElementById("exhibition");
  const href = trigger?.getAttribute("href");
  const equivalentLinks = Array.from(gallery?.querySelectorAll('a[aria-haspopup="dialog"]') ?? [])
    .filter((link) => href && link.getAttribute("href") === href);
  const focusTarget = [trigger, ...equivalentLinks, previous, gallery].find((element) =>
    element?.isConnected && element !== document.body && !element.closest("[inert], [hidden]")
    && getComputedStyle(element).visibility === "visible" && element.getClientRects().length);
  focusTarget?.focus({ preventScroll: true });
}

export function GuideDialog({ title, appName, closeLabel, returnFocus, onClose, children }) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const originalFocus = useRef();
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const scrollPosition = { top: window.scrollY, left: window.scrollX, behavior: "instant" };
    const { overflow, scrollBehavior } = root.style;
    originalFocus.current ??= document.activeElement;

    root.style.overflow = "hidden";
    root.style.scrollBehavior = "auto";
    if (!dialog.open) dialog.showModal();
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(scrollPosition);

    return () => {
      root.style.overflow = overflow;
      focusAfterClose(returnFocus, originalFocus.current);
      window.scrollTo(scrollPosition);
      root.style.scrollBehavior = scrollBehavior;
    };
  }, [returnFocus]);

  function closeOnBackdrop(event) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <dialog className="museum-guide-dialog" ref={dialogRef} aria-labelledby={titleId}
      onClose={onClose} onClick={closeOnBackdrop}>
      <article className="museum-guide-paper">
        <header className="museum-guide-header">
          <p>{appName}</p>
          <h2 ref={headingRef} id={titleId} tabIndex={-1}>{title}</h2>
          <button type="button" aria-label={closeLabel} onClick={() => dialogRef.current.close()}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="museum-guide-body">{children}</div>
      </article>
    </dialog>
  );
}
