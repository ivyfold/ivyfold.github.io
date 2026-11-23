import React from "react";
import { ArrowRight } from "lucide-react";
import { guideLinks } from "./museum.js";
import "./SupportPlaques.css";

function SupportPlaque({ room, copy, attach, onFollow }) {
  return (
    <nav ref={attach} className="depth-support-plaque" data-room={room.id} inert={true}
      aria-label={room.name + " " + copy.appGuide}>
      <div className="depth-support-heading" aria-hidden="true">
        <span className="depth-support-name">{room.name}</span>
        <span className="depth-support-label">{copy.appGuide}</span>
      </div>
      <ul id={"depth-support-panel-" + room.id} className="depth-support-panel">
        {guideLinks(room, copy).map(({ kind, href, label }) => (
          <li key={href}>
            <a href={href} aria-haspopup="dialog" onClick={(event) => onFollow(event, room.id, kind)}>
              {label}<ArrowRight aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SupportPlaques({ copy, rooms, anchorsRef, onFollow }) {
  return rooms.map((room, index) => (
    <SupportPlaque key={room.id} room={room} copy={copy}
      attach={(node) => { anchorsRef.current[index] = node; }} onFollow={onFollow} />
  ));
}
