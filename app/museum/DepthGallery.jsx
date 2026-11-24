import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Maximize2 } from "lucide-react";
import { asset, guideLinks } from "./museum.js";
import { courtyardStart, currentRoom, distanceLabel, exhibitionAnchor, finish } from "./gallery-path.js";
import { renderGallery } from "./renderGallery.js";
import { SupportPlaques } from "./SupportPlaques.jsx";
import "./DepthGallery.css";

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
    <section id="exhibition" className="depth-fallback" tabIndex={-1} aria-label={copy.hallLabel}>
      <h2>{copy.artworks}</h2>
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
      <div id="exhibition-courtyard" className="depth-fallback-courtyard">
        <picture>
          <source media="(max-width: 620px)" srcSet={asset("courtyard-portrait.webp")} />
          <img src={asset("courtyard.webp")} width="1672" height="941" alt="" loading="lazy" />
        </picture>
        <NextNotice notice={nextNotice} className="depth-fallback-next" />
      </div>
    </section>
  );
}

function frameInView(room, distance) {
  if (distance < room.phoneAt + .12) return null;
  return room.frames.find((frame) => frame.at > distance + .70) ?? room.frames.at(-1);
}

export function DepthGallery({ rooms, copy, distance, staticMode, nextNotice, onInspect, onOpenGuide, onUnavailable }) {
  const canvas = useRef(null);
  const renderer = useRef(null);
  const pressed = useRef(null);
  const anchorsRef = useRef([]);
  const position = useRef(distance);
  const [ready, setReady] = useState(false);
  const [readableGuide, setReadableGuide] = useState(null);

  useLayoutEffect(() => {
    position.current = distance;
    renderer.current?.setDistance(distance);
  }, [distance]);

  useEffect(() => {
    const surface = canvas.current;
    if (staticMode || !surface) return;
    setReady(false);
    setReadableGuide(null);

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

    const gallery = renderer.current = renderGallery(
      surface, rooms, () => setReady(true), onUnavailable, updatePlaques, copy, nextNotice,
    );
    if (!gallery) return;
    gallery.setDistance(position.current);
    return () => {
      gallery.dispose();
      renderer.current = null;
    };
  }, [rooms, copy, nextNotice, staticMode, onUnavailable]);

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || !ready) return;
    pressed.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event) {
    if (event.pointerType === "mouse" && ready) {
      renderer.current?.hover(event.clientX, event.clientY);
    }
  }

  function onPointerUp(event) {
    const origin = pressed.current;
    if (!origin || origin.id !== event.pointerId) return;
    pressed.current = null;
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) >= 6) return;
    const selected = renderer.current?.pick(event.clientX, event.clientY);
    if (selected) onInspect(selected);
  }

  function clearPointer() {
    pressed.current = null;
    renderer.current?.clearHover();
  }

  function followGuide(event, appId, kind) {
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (onOpenGuide(appId, kind, event.currentTarget)) event.preventDefault();
  }

  if (staticMode) {
    return <GalleryFallback rooms={rooms} copy={copy} nextNotice={nextNotice}
      onInspect={onInspect} onFollow={followGuide} />;
  }

  const room = currentRoom(rooms, distance);
  const atEnd = distance >= finish - .10;
  const inCourtyard = distance >= courtyardStart;
  const frame = frameInView(room, distance);
  const openNearby = () => onInspect(frame ? { ...frame, room } : {
    room, title: room.name, image: room.phone, description: room.summary,
  });

  return (
    <section id="museum-gallery-panel" className="depth-gallery" tabIndex={-1}
      aria-label={copy.hallLabel}
      data-distance={distanceLabel(distance)} data-app={room.id} data-ready={ready}
      data-courtyard={inCourtyard}>
      <canvas ref={canvas} className="depth-canvas" aria-hidden="true"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        onPointerLeave={clearPointer} onPointerCancel={clearPointer} />
      <div className="depth-shade" aria-hidden="true" />
      <div className="depth-plaque-stage" hidden={!ready}>
        <SupportPlaques copy={copy} rooms={rooms} anchorsRef={anchorsRef} onFollow={followGuide} />
      </div>
      <header className="depth-header">
        <span>{copy.hallBrand}</span>
      </header>
      {!ready ? <p className="depth-loading" role="status">{copy.loading}</p> : (
        inCourtyard ? (
          <>
            <NextNotice notice={nextNotice} className="depth-end-copy" />
            {atEnd && (
              <>
                <p className="depth-courtyard-mobile-title" aria-hidden="true">{nextNotice.title}</p>
                <p className="depth-scroll-note"><ArrowUp className="ui-icon" aria-hidden="true" />{copy.scrollBack}</p>
              </>
            )}
          </>
        ) : (
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
        )
      )}
    </section>
  );
}
