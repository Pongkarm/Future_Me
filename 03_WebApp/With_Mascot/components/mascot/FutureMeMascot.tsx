"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import Mascot from "@/lib/mascot/mascot";
import {
  MASCOT_SIZES,
  type MascotCrop,
  type MascotEmotion,
  type MascotPose,
  type MascotSize,
} from "@/lib/mascot/states";

/**
 * The FutureMe mascot as a live, state-driven character.
 *
 * Use this only where the mascot's state changes with the product — the
 * interview companion, a result screen, a notice. For a fixed picture (the
 * five faces on the interest scale) use the exported SVGs in public/mascot/
 * instead: they are a plain <img>, so they cost one request and no hydration.
 *
 * The markup comes from lib/mascot/mascot.js, the same builder the design lab
 * and the asset exporter use, so there is exactly one drawing of this character
 * in the codebase. It is injected rather than written as JSX because
 * hand-porting ~200 SVG nodes would immediately fork the source; the string is
 * generated from our own module with no user input in it.
 */
export interface FutureMeMascotProps {
  emotion?: MascotEmotion;
  pose?: MascotPose;
  crop?: MascotCrop;
  size?: MascotSize | number;
  /** Idle motion and blinking. Ignored when the reader prefers reduced motion. */
  animated?: boolean;
  /**
   * Set this only when the mascot's state carries something the surrounding
   * text does not. Pass a localised string — never a literal. With no label the
   * mascot is hidden from assistive technology, which is the right default for
   * decoration.
   */
  ariaLabel?: string;
  className?: string;
}

export default function FutureMeMascot({
  emotion = "smile",
  pose = "idle",
  crop = "full",
  size = "md",
  animated = true,
  ariaLabel,
  className,
}: FutureMeMascotProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const width = typeof size === "number" ? size : MASCOT_SIZES[size];

  /*
   * Gradient ids must match between the server render and the client, or the
   * fills resolve to nothing and the character renders solid black. useId is
   * stable across both; the strip is because useId returns ":r0:" and a colon
   * is awkward to carry through a url(#...) reference.
   */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  /*
   * Built once per framing. Emotion and pose changes are attribute writes on
   * the existing nodes, which is what lets mascot.css transition the change
   * rather than pop to it.
   */
  const html = useMemo(
    () => Mascot.mascotSVG({ crop, uid, emotion, pose, ariaLabel }),
    // Deliberately not reacting to emotion/pose/ariaLabel: the effect below
    // updates those in place. Re-running here would rebuild the DOM and kill
    // the transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crop, uid],
  );

  useEffect(() => {
    const svg = hostRef.current?.firstElementChild;
    if (!svg) return;
    svg.setAttribute("data-emotion", emotion);
    svg.setAttribute("data-pose", pose);
    if (ariaLabel) svg.setAttribute("aria-label", ariaLabel);
  }, [emotion, pose, ariaLabel]);

  /*
   * Blinking is scheduled in JS because a CSS loop can only be regular, and a
   * metronome blink is the fastest way to make a character look dead. Level 5
   * already has its eyes closed, so it is skipped there.
   */
  useEffect(() => {
    if (!animated) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let blinkTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      blinkTimer = setTimeout(() => {
        const svg = hostRef.current?.firstElementChild;
        // Skip while the tab is hidden: the timer would queue up blinks that
        // all fire at once when the learner comes back.
        if (svg && !document.hidden && svg.getAttribute("data-emotion") !== "very-happy") {
          svg.setAttribute("data-blink", "1");
          closeTimer = setTimeout(() => svg.removeAttribute("data-blink"), 150);
        }
        schedule();
      }, 3000 + Math.random() * 4000);
    };

    schedule();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(closeTimer);
    };
  }, [animated]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width, maxWidth: "100%", flex: "none" }}
      data-fm-anim={animated ? "on" : "off"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
