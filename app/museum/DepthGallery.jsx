import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Maximize2 } from "lucide-react";
import { asset, guideLinks } from "./museum.js";
import { clamp, currentRoom, distanceLabel, exhibitionAnchor, finish, start } from "./gallery-path.js";
import { renderGallery } from "./renderGallery.js";
import { SupportPlaques } from "./SupportPlaques.jsx";
import "./DepthGallery.css";

const guideHistoryKey = "ivyMuseumGuide";

function NextNotice({ notice, className }) {
  return (
    <section className={className}>
      <h2>{notice.title}</h2>
      <p>{notice.body}</p>
    </section>
  );
}

function GalleryFallback({ rooms, copy, nextNotice, onInspect, onFollow }) {
  return (
    <section id="exhibition" className="depth-fallback" aria-label={copy.hallLabel}>
      <header><h2>{copy.artworks}</h2><a href="#entrance">{copy.backToEntrance}</a></header>
      {rooms.map((room) => (
        <section key={room.id} id={exhibitionAnchor(room)} aria-label={room.name}>
          <h3>{room.name}</h3>
          <a href={room.detailsPath}>{copy.details}</a>
          <nav className="depth-fallback-guide" aria-label={room.name + " " + copy.appGuide}>
            <ul>
              {guideLinks(room, copy).map(({ kind, href, label }) => (
                <li key={href}>
                  <a href={href} aria-haspopup="dialog" onClick={(event) => onFollow(event, room.id, kind)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="fallback-frames">
            {room.frames.map((frame) => (
              <button key={frame.image} type="button" aria-haspopup="dialog"
                onClick={() => onInspect({ ...frame, room })}>
                <img src={asset(frame.image)} width="736" height="1600" alt="" loading="lazy" />
                <strong>{frame.title}</strong>
                <span className="fallback-caption">{frame.caption}</span>
                <span className="fallback-frame-details">
                  {copy.artworkDetails} <Maximize2 className="ui-icon" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <NextNotice notice={nextNotice} className="depth-fallback-next" />
    </section>
  );
}

function frameInView(room, distance) {
  if (distance < room.phoneAt + .12) return null;
  return room.frames.find((frame) => frame.at > distance + .70) ?? room.frames.at(-1);
}

export function DepthGallery({ rooms, copy, entry, nextNotice, onInspect, onOpenGuide }) {
  const canvas = useRef(null);
  const renderer = useRef(null);
  const pointer = useRef(null);
  const anchorsRef = useRef([]);
  const exact = useRef(start);
  const [distance, setDistance] = useState(start);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [readableGuide, setReadableGuide] = useState(null);

  const goTo = useCallback((position) => {
    const value = clamp(position, start, finish);
    if (value === exact.current) return;
    exact.current = value;
    renderer.current?.setDistance(value);
    setDistance(value);
  }, []);

  useEffect(() => {
    function visitHash() {
      const room = rooms.find((candidate) => window.location.hash === "#" + exhibitionAnchor(candidate));
      if (room) goTo(room.startAt);
    }

    const previousGuide = window.history.state?.[guideHistoryKey];
    if (Number.isFinite(previousGuide?.distance)) goTo(previousGuide.distance);
    else visitHash();

    window.addEventListener("hashchange", visitHash);
    return () => window.removeEventListener("hashchange", visitHash);
  }, [rooms, goTo]);

  useEffect(() => {
    if (entry) goTo(entry.distance);
  }, [entry, goTo]);

  useEffect(() => {
    if (!unavailable || !window.location.hash.startsWith("#exhibition-")) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [unavailable]);

  useEffect(() => {
    const surface = canvas.current;

    function updatePlaques(positions) {
      let visibleGuide = null;
      positions.forEach(({ transform, scale, visible }, index) => {
        const plaque = anchorsRef.current[index];
        if (!plaque) return;
        const readable = visible && scale >= .42;
        plaque.inert = !readable;
        plaque.style.visibility = readable ? "visible" : "hidden";
        if (readable) {
          plaque.style.setProperty("--depth-plaque-scale", scale);
          plaque.style.transform = transform;
          visibleGuide = rooms[index].id;
        }
      });
      setReadableGuide(visibleGuide);
    }

    const room = renderer.current = renderGallery(
      surface, rooms, () => setReady(true), () => setUnavailable(true), updatePlaques, copy, nextNotice,
    );
    if (!room) return;
    room.setDistance(exact.current);

    function wheel(event) {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const { top } = surface.getBoundingClientRect();
      if (Math.abs(top) > 28) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface.clientHeight : 1;
      const next = clamp(exact.current + event.deltaY * unit / 97, start, finish);
      if (next === exact.current) return;
      event.preventDefault();
      goTo(next);
    }

    surface.addEventListener("wheel", wheel, { passive: false });
    return () => {
      surface.removeEventListener("wheel", wheel);
      if (renderer.current === room) {
        room.dispose();
        renderer.current = null;
      }
    };
  }, [rooms, copy, nextNotice, goTo]);

  useEffect(() => {
    if (unavailable && renderer.current) {
      renderer.current.dispose();
      renderer.current = null;
    }
  }, [unavailable]);

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || !ready) return;
    renderer.current?.clearHover();
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: exact.current, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    const held = pointer.current;
    if (!held || held.id !== event.pointerId) {
      if (event.pointerType === "mouse" && ready) {
        renderer.current?.hover(event.clientX, event.clientY);
      }
      return;
    }
    const delta = event.clientY - held.y;
    if (!held.moved && Math.hypot(event.clientX - held.x, delta) < 6) return;
    if (!held.moved) {
      held.moved = true;
      setDragging(true);
    }
    goTo(held.distance + delta / 72);
  }

  function onPointerEnd(event) {
    const held = pointer.current;
    if (!held || held.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (event.type !== "pointerup") return;
    if (held.moved) {
      goTo(held.distance + (event.clientY - held.y) / 72);
      return;
    }
    const selected = renderer.current?.pick(event.clientX, event.clientY);
    if (selected) onInspect(selected);
  }

  function keyboard(event) {
    if (event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest(".depth-support-plaque, .depth-caption-guide")) return;
    const step = { ArrowDown: .88, ArrowUp: -.88, PageDown: 3, PageUp: -3 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    goTo(exact.current + step);
  }

  function followGuide(event, appId, kind) {
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (onOpenGuide(appId, kind, event.currentTarget)) event.preventDefault();
  }

  if (unavailable) {
    return <GalleryFallback rooms={rooms} copy={copy} nextNotice={nextNotice}
      onInspect={onInspect} onFollow={followGuide} />;
  }

  const room = currentRoom(rooms, distance);
  const atEnd = distance >= finish - .10;
  const frame = frameInView(room, distance);
  const openNearby = () => onInspect(frame ? { ...frame, room } : {
    room, title: room.name, image: room.phone, description: room.summary,
  });

  return (
    <section id="exhibition" className="depth-gallery" tabIndex="0" onKeyDown={keyboard}
      aria-label={copy.hallLabel} aria-describedby="depth-guide"
      data-distance={distanceLabel(distance)} data-app={room.id} data-dragging={dragging} data-ready={ready}>
      {rooms.map((exhibit) => (
        <span key={exhibit.id} id={exhibitionAnchor(exhibit)} className="depth-exhibit-anchor" aria-hidden="true" />
      ))}
      <canvas ref={canvas} className="depth-canvas" aria-hidden="true"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd}
        onPointerLeave={() => renderer.current?.clearHover()}
        onPointerCancel={onPointerEnd} onLostPointerCapture={onPointerEnd} />
      <div className="depth-shade" aria-hidden="true" />
      <div className="depth-plaque-stage" hidden={!ready}>
        <SupportPlaques copy={copy} rooms={rooms} anchorsRef={anchorsRef} onFollow={followGuide} />
      </div>
      <header className="depth-header">
        <span>{copy.hallBrand}</span><a href="#entrance">{copy.backToEntrance}</a>
      </header>
      {!ready ? <p className="depth-loading" role="status">{copy.loading}</p> : (
        <>
          {atEnd ? <NextNotice notice={nextNotice} className="depth-end-copy" /> : (
          <aside className="depth-caption" data-viewing-artwork={Boolean(frame)} aria-label={copy.currentExhibit}>
            <h2>{room.name}</h2>
            <div className="depth-caption-links"><button type="button" onClick={openNearby} aria-haspopup="dialog"
              aria-label={frame ? frame.title + " · " + frame.caption + " · " + copy.artworkDetails : undefined}>
              {frame ? frame.title + " · " + copy.artworkDetails : copy.viewScreen} <Maximize2 className="ui-icon" aria-hidden="true" />
            </button><a href={room.detailsPath}>{copy.details}</a></div>
            {readableGuide !== room.id && (
              <nav className="depth-caption-guide" aria-label={room.name + " " + copy.appGuide}>
                {guideLinks(room, copy).map(({ kind, href, label }) => (
                  <a href={href} key={href} aria-haspopup="dialog"
                    onClick={(event) => followGuide(event, room.id, kind)}>{label}</a>
                ))}
              </nav>
            )}
          </aside>
          )}
          <nav className="depth-controls" aria-label={copy.walkControls}>
            <button type="button" aria-label={copy.back} aria-disabled={distance === start}
              onClick={() => goTo(exact.current - .88)}><ArrowUp className="ui-icon" aria-hidden="true" /></button>
            <span id="depth-guide">{atEnd ? copy.dragBack : copy.drag}</span>
            <button type="button" aria-label={copy.forward} aria-disabled={distance === finish}
              onClick={() => goTo(exact.current + .88)}><ArrowDown className="ui-icon" aria-hidden="true" /></button>
          </nav>
        </>
      )}
    </section>
  );
}
