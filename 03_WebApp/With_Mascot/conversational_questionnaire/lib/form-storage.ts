/**
 * Which form the learner chose.
 *
 * Kept in its own key rather than added to `GuestSession`. The session schema
 * is versioned with a repair path and a suite of tests around it; adding a
 * field there for a presentation choice would mean a migration and a version
 * bump for something that can be safely defaulted.
 *
 * Defaulting matters: anything unreadable, missing, or from an older visit
 * resolves to `full`, which is the behaviour the product had before short forms
 * existed. A learner can never lose evidence by this value going missing —
 * they can only be asked more questions than they picked.
 */
import { isFormId, type FormId } from "./forms";

export const FORM_KEY = "futureme.form.v1";

export function loadFormId(): FormId {
  if (typeof window === "undefined") return "full";
  try {
    const raw = window.localStorage.getItem(FORM_KEY);
    return isFormId(raw) ? raw : "full";
  } catch {
    return "full";
  }
}

export function saveFormId(id: FormId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FORM_KEY, id);
  } catch {
    /* storage unavailable; the default of `full` is a safe fallback */
  }
}

export function clearFormId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FORM_KEY);
  } catch {
    /* nothing useful to do here */
  }
}
