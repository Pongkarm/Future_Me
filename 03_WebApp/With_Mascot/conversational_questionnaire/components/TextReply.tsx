"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

/**
 * Free-text reply, used for the one optional context question.
 *
 * Optional means genuinely skippable: the skip control is a peer of submit, not
 * hidden behind it. The field is never required to advance.
 */
export default function TextReply({
  value,
  onSubmit,
  onSkip,
  labelledBy,
  submitLabel,
  skipLabel,
  testId,
}: {
  value: string;
  onSubmit: (value: string) => void;
  onSkip: () => void;
  labelledBy: string;
  submitLabel: string;
  skipLabel: string;
  testId: string;
}) {
  const [draft, setDraft] = useState(value);

  // Keep the field in step when the learner navigates back to it.
  useEffect(() => setDraft(value), [value]);

  return (
    <div className="grid gap-2">
      <textarea
        aria-labelledby={labelledBy}
        data-testid={testId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        className="w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onSubmit(draft.trim())} disabled={draft.trim() === ""}>
          {submitLabel}
        </Button>
        <Button variant="secondary" onClick={onSkip}>
          {skipLabel}
        </Button>
      </div>
    </div>
  );
}
