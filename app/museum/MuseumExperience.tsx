"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Language } from "../site-data";
import { Entrance } from "./Entrance";
import { ArtworkDialog } from "./ArtworkDialog";
import { GuideDialog } from "./GuideDialog";
import { DepthGallery } from "./DepthGallery";
import { museumCopy } from "./copy";
import { galleryFor } from "./museum";
import { createRooms, exhibitionAnchor } from "./gallery-path";
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
  title: string;
  image: string;
  description: string;
  room: { name: string; store: string | null; detailsPath: string };
};
type MuseumAppId = "leafia" | "widgetgame" | "studyseed";
type GuideKind = "support" | "privacy" | "terms";
type MuseumModal =
  | { type: "artwork"; artwork: MuseumArtwork }
  | { type: "guide"; appId: MuseumAppId; kind: GuideKind; returnFocus: HTMLElement };

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
  const [entry, setEntry] = useState<{ distance: number } | null>(null);
  const gallery = useMemo(() => galleryFor(language, profiles), [language, profiles]);
  const rooms = useMemo(() => createRooms(gallery), [gallery]);
  const copy = museumCopy[language];
  const guideTitles = { support: copy.supportLink, privacy: copy.privacyLink, terms: copy.termsLink };

  function enterApp(id: string) {
    const room = rooms.find((candidate: { id: string }) => candidate.id === id);
    if (!room) return;
    const anchor = exhibitionAnchor(room);
    setEntry({ distance: room.startAt });
    if (window.location.hash === "#" + anchor) {
      document.getElementById(anchor)?.scrollIntoView({ block: "start" });
    } else {
      window.location.hash = anchor;
    }
  }

  function openGuide(appId: MuseumAppId, kind: GuideKind, returnFocus: HTMLElement) {
    if (!documents[appId]?.[kind]) return false;
    setModal({ type: "guide", appId, kind, returnFocus });
    return true;
  }

  return (
    <div className="museum-experience">
      <Entrance key={language} gallery={gallery} copy={copy} onEnterApp={enterApp}
        alternateLanguagePath={alternateLanguagePath} />
      <DepthGallery
        key={language}
        rooms={rooms}
        copy={copy}
        entry={entry}
        nextNotice={nextNotice}
        onInspect={(artwork: MuseumArtwork) => setModal({ type: "artwork", artwork })}
        onOpenGuide={openGuide}
      />
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
