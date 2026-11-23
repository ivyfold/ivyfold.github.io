"use client";

import { useEffect } from "react";

export function LeafiaScrollMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".app-page-leafia");
    if (!root || !("IntersectionObserver" in window)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-leafia-reveal]"));
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.classList.remove("will-reveal");
          target.classList.add("is-visible");
          observer.unobserve(target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
    );

    for (const target of revealTargets) {
      if (target.getBoundingClientRect().top < window.innerHeight * 0.94) {
        target.classList.add("is-visible");
      } else {
        target.classList.add("will-reveal");
        revealObserver.observe(target);
      }
    }
    root.classList.add("motion-ready");

    const story = root.querySelector<HTMLElement>(".leafia-story");
    const secondStep = story?.querySelector<HTMLElement>(".leafia-story-step-second");
    const storyObserver = secondStep
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              story?.classList.add("is-second");
            } else if (entry.boundingClientRect.top > 0) {
              story?.classList.remove("is-second");
            }
          },
          { threshold: 0.08, rootMargin: "0px 0px -30% 0px" },
        )
      : null;
    if (secondStep) storyObserver?.observe(secondStep);

    const showAll = () => {
      if (!reducedMotion.matches) return;
      root.classList.remove("motion-ready");
      for (const target of revealTargets) target.classList.remove("will-reveal");
    };
    reducedMotion.addEventListener("change", showAll);

    return () => {
      revealObserver.disconnect();
      storyObserver?.disconnect();
      reducedMotion.removeEventListener("change", showAll);
      root.classList.remove("motion-ready");
      for (const target of revealTargets) {
        target.classList.remove("will-reveal", "is-visible");
      }
    };
  }, []);

  return null;
}
