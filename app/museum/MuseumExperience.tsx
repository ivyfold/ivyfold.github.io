"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Language } from "../site-data";
import { Entrance } from "./Entrance";
import { ArtworkDialog } from "./ArtworkDialog";
import { GuideDialog } from "./GuideDialog";
import { DepthGallery } from "./DepthGallery";
import { museumCopy } from "./copy";
import { galleryFor } from "./museum";
import { clamp, createRooms, exhibitionAnchor, finish, start } from "./gallery-path";
import "./museum.css";

type MuseumProfile = {
  name: string;
  slug: string;
  store: string | null;
  supportPath: string;
  privacyPath: string | null;
  termsPath: string | null;
};
type MuseumArtwork = {
  kind?: "app";
  title: string;
  image: string;
  description: string;
  room: { name: string; slug: string; summary: string; store: string | null; detailsPath: string };
};
type MuseumAppId = "leafia" | "widgetgame" | "studyseed";
type GuideKind = "support" | "privacy" | "terms";
type MuseumModal =
  | { type: "artwork"; artwork: MuseumArtwork }
  | { type: "guide"; appId: MuseumAppId; kind: GuideKind; returnFocus: HTMLElement };

const arrivalScreens = .94;
// The extra walk to the courtyard keeps the existing exhibits at the same scroll positions.
const corridorScreens = (finish - start) / 6.775;
const tourScreens = arrivalScreens + corridorScreens;
const foyerDistance = .15;

function exhibitOffset(distance: number) {
  const portion = (distance - start) / (finish - start);
  return (arrivalScreens + portion * corridorScreens) * 100;
}

function fade(from: number, to: number, progress: number) {
  const blend = clamp((progress - from) / (to - from), 0, 1);
  return blend * blend * (3 - 2 * blend);
}

export function MuseumExperience({
  language,
  alternateLanguagePath,
  profiles,
  nextNotice,
  documents,
}: {
  language: Language;
  alternateLanguagePath: string;
  profiles: Record<MuseumAppId, MuseumProfile>;
  nextNotice: { title: string; body: string };
  documents: Record<MuseumAppId, Record<GuideKind, ReactNode>>;
}) {
  const [modal, setModal] = useState<MuseumModal | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(foyerDistance);
  const [phase, setPhase] = useState<"entrance" | "arriving" | "gallery">("entrance");
  const [webGLUnavailable, setWebGLUnavailable] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const staticMode = webGLUnavailable || reduceMotion;
  const gallery = useMemo(() => galleryFor(language, profiles), [language, profiles]);
  const rooms = useMemo(() => createRooms(gallery), [gallery]);
  const copy = museumCopy[language];
  const guideTitles = { support: copy.supportLink, privacy: copy.privacyLink, terms: copy.termsLink };
  const fallbackToDocument = useCallback(() => setWebGLUnavailable(true), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (staticMode) {
      const anchor = window.location.hash.slice(1);
      if (anchor === "exhibition" || anchor.startsWith("exhibition-")) {
        document.getElementById(anchor)?.scrollIntoView({ block: "start", behavior: "instant" });
      }
      return;
    }
    const rail = track.current;
    const view = viewport.current;
    if (!rail || !view) return;
    let frame = 0;

    function update() {
      frame = 0;
      if (!rail || !view) return;
      const travel = rail.offsetHeight - view.offsetHeight;
      if (travel <= 0) return;
      const steps = clamp((-rail.getBoundingClientRect().top / travel) * tourScreens, 0, tourScreens);
      const arrival = clamp(steps / arrivalScreens, 0, 1);
      const opening = fade(.38, .63, arrival);
      const shadow = fade(.19, .46, arrival) * (1 - fade(.53, .86, arrival));
      view.style.setProperty("--museum-opening", String(opening));
      view.style.setProperty("--museum-approach", String(fade(0, .62, arrival)));
      view.style.setProperty("--museum-shadow", String(shadow));
      view.style.setProperty("--museum-intro-ui", String(1 - fade(.04, .32, arrival)));
      view.style.setProperty("--museum-gallery-ui", String(fade(.68, .93, arrival)));
      setPhase(arrival < .25 ? "entrance" : arrival < .73 ? "arriving" : "gallery");
      setDistance(steps < arrivalScreens
        ? foyerDistance + arrival * (start - foyerDistance)
        : start + (steps - arrivalScreens) * (finish - start) / corridorScreens);
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(view);
    window.addEventListener("scroll", schedule, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [staticMode]);

  function openGuide(appId: MuseumAppId, kind: GuideKind, returnFocus: HTMLElement) {
    if (!documents[appId]?.[kind]) return false;
    setModal({ type: "guide", appId, kind, returnFocus });
    return true;
  }

  return (
    <div className="museum-experience">
      <div id="entrance" ref={track} className="museum-track" data-static={staticMode}
        style={staticMode ? undefined : { height: `calc(100dvh + ${tourScreens * 100}svh)` }}>
        {!staticMode && (
          <>
            <span id="exhibition" className="museum-scroll-anchor" style={{ top: `${exhibitOffset(start)}svh` }} aria-hidden="true" />
            {rooms.map((room: { slug: string; startAt: number }) => (
              <span key={room.slug} id={exhibitionAnchor(room)} className="museum-scroll-anchor"
                style={{ top: `calc(${exhibitOffset(room.startAt)}svh + 2px)` }} aria-hidden="true" />
            ))}
            <span id="exhibition-courtyard" className="museum-scroll-anchor"
              style={{ top: `calc(${tourScreens * 100}svh + 2px)` }} aria-hidden="true" />
          </>
        )}
        <div ref={viewport} className="museum-view">
          <div className="museum-entry-layer" inert={!staticMode && phase !== "entrance"}>
            <Entrance gallery={gallery} copy={copy} alternateLanguagePath={alternateLanguagePath} />
          </div>
          <div className="museum-gallery-layer" inert={!staticMode && phase !== "gallery"}>
            <DepthGallery
              rooms={rooms}
              copy={copy}
              distance={distance}
              staticMode={staticMode}
              onUnavailable={fallbackToDocument}
              nextNotice={nextNotice}
              onInspect={(artwork: MuseumArtwork) => setModal({ type: "artwork", artwork })}
              onOpenGuide={openGuide}
            />
          </div>
        </div>
      </div>
      {modal?.type === "artwork" && (
        <ArtworkDialog art={modal.artwork} copy={copy} onClose={() => setModal(null)} />
      )}
      {modal?.type === "guide" && (
        <GuideDialog
          title={guideTitles[modal.kind]}
          appName={profiles[modal.appId].name}
          closeLabel={copy.closeGuide}
          returnFocus={modal.returnFocus}
          onClose={() => setModal(null)}
        >
          {documents[modal.appId][modal.kind]}
        </GuideDialog>
      )}
    </div>
  );
}
