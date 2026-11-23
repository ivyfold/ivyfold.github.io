import React, { useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import { asset } from "./museum.js";

export function ArtworkDialog({ art, copy, onClose }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement;
    const root = document.documentElement;
    const position = { top: scrollY, left: scrollX, behavior: "instant" };
    const { overflow, scrollBehavior } = root.style;
    root.style.overflow = "hidden";
    root.style.scrollBehavior = "auto";
    if (!dialog.open) dialog.showModal();
    window.scrollTo(position);
    return () => {
      root.style.overflow = overflow;
      focus?.focus({ preventScroll: true });
      window.scrollTo(position);
      root.style.scrollBehavior = scrollBehavior;
    };
  }, []);
  return (
    <dialog ref={ref} className="depth-artwork" aria-labelledby="depth-artwork-title" onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <article>
        <figure><img src={asset(art.image)} alt={art.room.name + " · " + art.title} width="736" height="1600" /></figure>
        <div>
          {art.title !== art.room.name && <p className="artwork-app">{art.room.name}</p>}
          <h2 id="depth-artwork-title">{art.title}</h2>
          <p>{art.description}</p>
          <div className="depth-artwork-links">
            <a href={art.room.detailsPath}>{copy.details}</a>
          {art.room.store && (
            <a href={art.room.store} target="_blank" rel="noopener noreferrer">{copy.appStore}</a>
          )}
          </div>
        </div>
        <button type="button" aria-label={copy.close} onClick={() => ref.current.close()}><X aria-hidden="true" /></button>
      </article>
    </dialog>
  );
}
