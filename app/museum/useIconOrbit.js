import { useLayoutEffect, useRef, useState } from "react";

const iconCount = 3;
const dragThreshold = 7;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(value, maximum));
const selectionAt = (position) => ((Math.round(position) % iconCount) + iconCount) % iconCount;

export function useIconOrbit(onPose, { hitTest, onTap } = {}) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pose = useRef(onPose);
  const orbit = useRef({ position: 0, destination: 0, activeIndex: 0, frame: null, gesture: null });

  useLayoutEffect(() => {
    pose.current = onPose;
  }, [onPose]);

  useLayoutEffect(() => {
    const state = orbit.current;
    pose.current(state.position);
    return () => {
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      state.frame = null;
      state.gesture = null;
    };
  }, []);

  function publish(position) {
    const state = orbit.current;
    state.position = position;
    pose.current(position);
    const selected = selectionAt(position);
    if (selected !== state.activeIndex) {
      state.activeIndex = selected;
      setIndex(selected);
    }
  }

  function stop(state) {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null;
  }

  function settle(destination) {
    const state = orbit.current;
    stop(state);
    state.destination = destination;
    const from = state.position;
    if (Math.abs(destination - from) < 0.002 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      publish(destination);
      return;
    }

    const startedAt = performance.now();
    const duration = 240 + Math.min(Math.abs(destination - from), 1) * 200;
    function step(now) {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const ease = 1 - (1 - progress) ** 3;
      publish(from + (destination - from) * ease);
      state.frame = progress < 1 ? requestAnimationFrame(step) : null;
    }
    state.frame = requestAnimationFrame(step);
  }

  function move(direction) {
    const state = orbit.current;
    if (state.gesture?.started) return;
    const base = state.frame === null ? Math.round(state.position) : state.destination;
    settle(base + direction);
  }

  function select(nextIndex) {
    const nearestTurn = Math.round((orbit.current.position - nextIndex) / iconCount);
    settle(nearestTurn * iconCount + nextIndex);
  }

  function onPointerDown(event) {
    const state = orbit.current;
    if (!event.isPrimary || event.button !== 0 || state.gesture
      || event.target.closest?.("a, button:not([data-orbit-tile])")) return;
    state.gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      hit: hitTest?.(event),
      lastX: event.clientX,
      lastAt: performance.now(),
      velocity: 0,
      started: false,
    };
  }

  function onPointerMove(event) {
    const state = orbit.current;
    const gesture = state.gesture;
    if (!gesture || event.pointerId !== gesture.id) return;
    const horizontal = event.clientX - gesture.x;
    if (!gesture.started) {
      const vertical = event.clientY - gesture.y;
      if (Math.hypot(horizontal, vertical) >= dragThreshold) gesture.hit = null;
      if (Math.abs(vertical) >= dragThreshold && Math.abs(vertical) > Math.abs(horizontal)) {
        state.gesture = null;
        return;
      }
      if (Math.abs(horizontal) < dragThreshold || Math.abs(horizontal) <= Math.abs(vertical)) return;
      stop(state);
      gesture.started = true;
      gesture.origin = state.position;
      gesture.stepWidth = clamp(event.currentTarget.clientWidth * 0.36, 120, 370);
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }

    const now = performance.now();
    const recentVelocity = (gesture.lastX - event.clientX) / Math.max(8, now - gesture.lastAt);
    gesture.velocity = 0.45 * recentVelocity + 0.55 * gesture.velocity;
    gesture.lastX = event.clientX;
    gesture.lastAt = now;
    publish(gesture.origin - horizontal / gesture.stepWidth);
  }

  function endGesture(event) {
    const state = orbit.current;
    const gesture = state.gesture;
    if (!gesture || event.pointerId !== gesture.id) return;
    state.gesture = null;
    const released = event.type === "pointerup";
    if (!gesture.started) {
      const travel = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
      if (released && travel < dragThreshold && gesture.hit && gesture.hit === hitTest?.(event)) {
        onTap?.(gesture.hit);
      }
      return;
    }
    setDragging(false);
    const current = released ? gesture.origin + (gesture.x - event.clientX) / gesture.stepWidth : state.position;
    const flick = released && performance.now() - gesture.lastAt < 90;
    const momentum = flick ? clamp(gesture.velocity * 90 / gesture.stepWidth, -0.32, 0.32) : 0;
    publish(current);
    settle(Math.round(current + momentum));
  }

  const pointer = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
    onLostPointerCapture: endGesture,
    onPointerLeave: (event) => {
      if (!orbit.current.gesture?.started) endGesture(event);
    },
  };
  return { index, dragging, pointer, move, select };
}
