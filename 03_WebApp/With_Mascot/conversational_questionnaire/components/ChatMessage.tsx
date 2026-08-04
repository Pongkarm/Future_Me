"use client";

import FutureMeMascot from "@/components/mascot/FutureMeMascot";
import type { MascotEmotion, MascotPose } from "@/lib/mascot/states";

/**
 * One message bubble.
 *
 * The speaker label is visually hidden rather than absent: without it a
 * transcript read from the top is an undifferentiated wall of sentences, and
 * the visual grouping that separates Buddy from learner does not survive being
 * read aloud.
 */
export function BuddyMessage({
  children,
  speakerLabel,
  showMascot = false,
  emotion = "neutral",
  pose = "idle",
  muted = false,
}: {
  children: React.ReactNode;
  speakerLabel: string;
  showMascot?: boolean;
  emotion?: MascotEmotion;
  pose?: MascotPose;
  muted?: boolean;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-10 shrink-0 sm:w-12">
        {showMascot ? (
          /* Decorative: the message text carries everything the mascot shows. */
          <FutureMeMascot emotion={emotion} pose={pose} size={48} crop="face" animated={false} />
        ) : null}
      </div>
      <div
        className={[
          "max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-surface2 px-4 py-3 text-base leading-relaxed",
          muted ? "text-muted" : "text-ink",
        ].join(" ")}
      >
        <span className="sr-only">{speakerLabel}: </span>
        {children}
      </div>
    </div>
  );
}

export function UserMessage({
  children,
  speakerLabel,
  editedLabel,
  superseded = false,
}: {
  children: React.ReactNode;
  speakerLabel: string;
  editedLabel?: string;
  superseded?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <div
        className={[
          "max-w-[85%] rounded-2xl rounded-br-sm border px-4 py-2.5 text-base",
          superseded
            ? "border-line bg-transparent text-muted line-through"
            : "border-mint/50 bg-mint/10 text-ink",
        ].join(" ")}
      >
        <span className="sr-only">{speakerLabel}: </span>
        {children}
        {superseded && editedLabel ? (
          <span className="ml-2 text-[11px] no-underline">({editedLabel})</span>
        ) : null}
      </div>
    </div>
  );
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-1 text-center text-[11px] font-semibold uppercase tracking-widest text-muted">
      {children}
    </p>
  );
}
