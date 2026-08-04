/**
 * Types for `mascot.js`, which is copied verbatim from the design lab and must
 * stay byte-identical to it (see scripts/sync-mascot.mjs). That is why the
 * types live in a sibling declaration file rather than in the source: editing
 * the source here would break the drift check on the next sync.
 */

export interface MascotStateOption {
  id: string;
  label: string;
  labelTh: string;
}

export interface MascotEmotionOption extends MascotStateOption {
  value: number;
  scale: string;
}

export interface MascotSVGOptions {
  emotion?: string;
  pose?: string;
  view?: string;
  crop?: string;
  size?: number;
  /**
   * Gradient id suffix. Always pass a stable value on the server — the module's
   * own fallback is a counter, which produces different ids on the server and
   * the client and breaks hydration.
   */
  uid?: string;
  ariaLabel?: string;
  className?: string;
}

declare const FutureMeMascot: {
  EMOTIONS: MascotEmotionOption[];
  POSES: MascotStateOption[];
  VIEWS: { id: string; label: string }[];
  SIZES: Record<string, number>;
  GEOMETRY: Record<string, unknown>;
  PALETTE: Record<string, string>;
  mascotSVG(opts?: MascotSVGOptions): string;
};

export default FutureMeMascot;
