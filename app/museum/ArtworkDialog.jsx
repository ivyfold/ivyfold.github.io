import React, { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { asset } from "./museum.js";
import "./ExhibitOverview.css";

function ExhibitOverview({ art, copy, onClose }) {
  const { room } = art;
  return (
    <article className="exhibit-overview-layout">
      <button className="exhibit-overview-close" type="button" aria-label={copy.close} onClick={onClose}>
        <X aria-hidden="true" />
      </button>
      <div className="exhibit-overview-copy">
        <div className="exhibit-overview-identity">
          <img src={asset(room.slug + "-display-icon.webp")} alt="" width="112" height="112" />
          <h2 id="depth-artwork-title">{art.title}</h2>
        </div>
        <p className="exhibit-overview-summary">{room.summary}</p>
        <p className="exhibit-overview-description">{art.description}</p>
        <div className="exhibit-overview-links">
          {room.store && (
            <a className="exhibit-overview-primary" href={room.store} target="_blank" rel="noopener noreferrer">
              {copy.appStore}
            </a>
          )}
          <a className={room.store ? "exhibit-overview-detail" : "exhibit-overview-primary"} href={room.detailsPath}>
            {copy.details} <ArrowUpRight className="ui-icon" aria-hidden="true" />
          </a>
          {!room.store && <span className="exhibit-overview-status">{copy.inDevelopment}</span>}
        </div>
      </div>
      <div className="exhibit-overview-stage">
        <img className="exhibit-overview-scene" src={asset(room.slug + "-exhibit-stage.webp")}
          alt="" width="800" height="1000" />
        <figure className="exhibit-overview-phone">
          <img src={asset(art.image)} alt={room.name + " · " + copy.appScreen} width="736" height="1600" />
        </figure>
      </div>
    </article>
  );
}

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
  const overview = art.kind === "app";
  const close = () => ref.current.close();
  return (
    <dialog ref={ref} className={overview ? "exhibit-overview" : "depth-artwork"} data-app={art.room.slug}
      aria-labelledby="depth-artwork-title" onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {overview ? <ExhibitOverview art={art} copy={copy} onClose={close} /> : (
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
          <button type="button" aria-label={copy.close} onClick={close}><X aria-hidden="true" /></button>
        </article>
      )}
    </dialog>
  );
}
