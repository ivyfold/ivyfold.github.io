import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { asset } from "./museum.js";
import { projectIcon, renderEntrance } from "./renderEntrance.js";
import { useIconOrbit } from "./useIconOrbit.js";
import "./Entrance.css";

export function Entrance({ gallery, copy, alternateLanguagePath }) {
  const apps = useMemo(() => [gallery[0], gallery[2], gallery[1]], [gallery]);
  const canvas = useRef(null);
  const engine = useRef(null);
  const tiles = useRef(null);
  const pose = useRef(0);
  const [fallback, setFallback] = useState(false);

  function placeIconTargets(position) {
    const stage = tiles.current;
    if (!stage) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    Array.from(stage.children).forEach((icon, i) => {
      const view = projectIcon(i, position, width, height);
      icon.style.left = view.x + "px";
      icon.style.top = (view.y - (fallback ? 0 : view.scale * .243)) + "px";
      icon.style.width = view.scale + "px";
      icon.style.zIndex = Math.round(10 * view.depth) + 12;
      const lens = fallback ? "perspective(600px) " : "";
      icon.style.transform = `translate(-50%, -100%) ${lens}rotateY(${view.yaw}rad)`;
    });
  }

  function hitIcon(event) {
    if (fallback) return event.target.closest?.("[data-orbit-tile]")?.dataset.orbitTile;
    return engine.current?.pick(event.clientX, event.clientY);
  }

  function selectApp(id) {
    const appIndex = apps.findIndex((app) => app.id === id);
    if (appIndex >= 0) select(appIndex);
  }

  const { index, dragging, pointer, move, select } = useIconOrbit(position => {
    pose.current = position;
    engine.current?.setPosition(position);
    placeIconTargets(position);
  }, { hitTest: hitIcon, onTap: selectApp });

  useEffect(() => {
    if (fallback) return;
    engine.current = renderEntrance(canvas.current, apps, () => setFallback(true));
    engine.current?.setPosition(pose.current);
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, [apps, fallback]);

  useLayoutEffect(() => {
    const update = () => placeIconTargets(pose.current);
    const observer = new ResizeObserver(update);
    observer.observe(tiles.current);
    update();
    return () => observer.disconnect();
  }, [fallback]);

  function keyboard(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  }

  return (
    <section id="entrance" className="ivy-entrance" aria-label={copy.entranceLabel}>
      <picture className="ivy-room" aria-hidden="true">
        <source media="(max-width: 700px)" srcSet={asset("ivy-rotunda-mobile.jpg")} />
        <img src={asset("ivy-rotunda.jpg")} alt="" width="1536" height="1024" draggable="false" fetchPriority="high" />
      </picture>
      <div className="ivy-room-shade" aria-hidden="true" />
      <a className="ivy-language-switch" href={alternateLanguagePath}
        hrefLang={copy.alternateLanguage} lang={copy.alternateLanguage} aria-label={copy.switchLanguage}>
        {copy.alternateLanguage.toUpperCase()}
      </a>
      <header className="ivy-intro">
        <p className="ivy-brand">ivy develop</p>
        <h1>{copy.title}</h1>
        <p className="ivy-catch">{copy.catchphrase}</p>
        <p className="ivy-description">
          <span className="ivy-copy-line">{copy.introPhrases.map((phrase) => <span key={phrase}>{phrase}</span>)}</span>
          <span className="ivy-copy-line">{copy.introEnd}</span>
        </p>
      </header>
      <div className="ivy-orbit" role="group" aria-roledescription="カルーセル" aria-label={copy.carouselLabel}
        aria-describedby="ivy-swipe-hint" tabIndex="0" onKeyDown={keyboard} data-dragging={dragging}
        data-current-app={apps[index].id} {...pointer}
        onPointerMove={(event) => {
          pointer.onPointerMove(event);
          if (event.pointerType === "mouse" && !dragging) {
            event.currentTarget.toggleAttribute("data-icon-hovered", Boolean(hitIcon(event)));
          }
        }}
        onPointerLeave={(event) => {
          pointer.onPointerLeave(event);
          event.currentTarget.removeAttribute("data-icon-hovered");
        }}>
        {!fallback && <canvas className="ivy-canvas" ref={canvas} aria-hidden="true" />}
        <div ref={tiles} className={fallback ? "ivy-icon-targets ivy-fallback" : "ivy-icon-targets"}>
          {apps.map((app, appIndex) => (
            <button key={app.id} type="button" className="ivy-icon-target" data-orbit-tile={app.id}
              aria-label={app.name} aria-pressed={appIndex === index} onClick={(event) => {
                if (event.detail === 0) selectApp(app.id);
              }}>
              {fallback && <img src={asset(app.id + "-icon.png")} alt="" draggable="false" />}
            </button>
          ))}
        </div>
        <div className="ivy-actions">
          <h2 className="ivy-app-name" aria-live="polite" aria-atomic="true">{apps[index].name}</h2>
          <nav className="ivy-swipe" aria-label={copy.carouselLabel}>
            <button type="button" aria-label={copy.previous} onClick={() => move(-1)}>
              <ChevronLeft aria-hidden="true" strokeWidth={1.6} />
            </button>
            <span id="ivy-swipe-hint">{copy.swipeHint}</span>
            <button type="button" aria-label={copy.next} onClick={() => move(1)}>
              <ChevronRight aria-hidden="true" strokeWidth={1.6} />
            </button>
          </nav>
          <p className="ivy-scroll-cue">
            {copy.scrollToGallery}
            <ChevronDown className="ui-icon" aria-hidden="true" strokeWidth={1.5} />
          </p>
        </div>
      </div>
    </section>
  );
}
