import type { MascotEmotion, MascotPose } from "@/lib/mascot/states";
import type { ConversationStep } from "../types";

export type { ConversationStep };

export interface MascotPoseForStep {
  emotion: MascotEmotion;
  pose: MascotPose;
}
