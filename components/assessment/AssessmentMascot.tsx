import LiveFutureMeMascot from "@/components/mascot/FutureMeMascot";
import type { MascotState } from "@/components/FutureMeMascot";
import { CHAT_MASCOT_STATES } from "@/lib/mascot/chat-states";

/**
 * The one full-body interviewer model used by the active assessment scene.
 * State timing lives in the page controller so question, reply and mascot
 * transitions cannot race each other.
 */
export default function AssessmentMascot({
  state,
  status,
  forceMotion = false,
  onToggleMotion,
  toggleMotionLabel,
  testIdPrefix = "interview",
}: {
  state: MascotState;
  status: string;
  forceMotion?: boolean;
  onToggleMotion?: () => void;
  toggleMotionLabel?: string;
  testIdPrefix?: string;
}) {
  const visual = CHAT_MASCOT_STATES[state];

  return (
    <div
      className="interview-mascot-stage mx-auto flex w-full max-w-[190px] min-w-0 flex-col items-center justify-start gap-2"
      data-mascot-force-motion={forceMotion ? "on" : "system"}
      data-mascot-state={state}
      data-testid={`${testIdPrefix}-mascot-stage`}
    >
      <div
        aria-hidden="true"
        data-mascot-animated="true"
        data-mascot-force-motion={forceMotion ? "on" : "system"}
        data-mascot-state={state}
        data-testid={`${testIdPrefix}-mascot`}
        className="interview-mascot-scene relative flex min-h-[190px] w-full items-end justify-center overflow-hidden rounded-[42%]"
      >
        <span
          aria-hidden="true"
          className="interview-mascot-aura"
          data-testid={`${testIdPrefix}-mascot-aura`}
        />
        <span aria-hidden="true" className="interview-mascot-orbit" />
        <span aria-hidden="true" className="interview-mascot-spark interview-mascot-spark-one" />
        <span aria-hidden="true" className="interview-mascot-spark interview-mascot-spark-two" />
        <span aria-hidden="true" className="interview-mascot-spark interview-mascot-spark-three" />
        <LiveFutureMeMascot
          emotion={visual.emotion}
          pose={visual.pose}
          crop="full"
          size={165}
          animated
          motion={forceMotion ? "on" : "system"}
          className="interview-mascot-model relative z-10"
        />
      </div>
      <div className="interview-mascot-status-pill flex items-center gap-1.5 rounded-full border border-indigo/40 bg-indigo/10 px-3 py-1.5 shadow-sm">
        <span
          aria-hidden="true"
          className="interview-mascot-status-dot h-1.5 w-1.5 rounded-full"
          data-testid={`${testIdPrefix}-mascot-status-dot`}
        />
        <span
          className="text-center text-[11px] font-bold leading-tight text-indigoText"
          data-testid={`${testIdPrefix}-mascot-status`}
        >
          {status}
        </span>
      </div>
      {onToggleMotion && toggleMotionLabel ? (
        <button
          type="button"
          onClick={onToggleMotion}
          aria-pressed={forceMotion}
          data-testid={`${testIdPrefix}-motion-toggle`}
          className="rounded-full border border-indigo/35 bg-indigo/5 px-3 py-1.5 text-[10px] font-semibold text-muted shadow-sm transition hover:border-indigo/70 hover:bg-indigo/15 hover:text-indigoText"
        >
          {toggleMotionLabel}
        </button>
      ) : null}
    </div>
  );
}
