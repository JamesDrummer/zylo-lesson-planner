"use client";

import { useState } from "react";
import type { LessonDetailsForm } from "@/types";
import { submitLessonDetails } from "@/lib/api";

export default function Step1LessonDetails({
  value,
  onChange,
  onNext,
}: {
  value: LessonDetailsForm;
  onChange: (value: LessonDetailsForm) => void;
  onNext: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<LessonDetailsForm>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-zylo-blue">Lesson Details</h2>
        <p className="text-sm text-zylo-gray mt-1">Tell us about your upcoming lesson.</p>
      </div>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            // Simple validation
            if (!value.lessonsToGenerate || !value.firstLessonDate || !value.school || !value.groupSize || !value.concept1) {
              throw new Error("Please complete all required fields.");
            }
            await submitLessonDetails(value);
            onNext();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div>
          <label className="label">Lessons to generate</label>
          <input
            type="number"
            min={1}
            required
            value={value.lessonsToGenerate}
            onChange={(e) => update({ lessonsToGenerate: Number(e.target.value) })}
            className="mt-1 input"
            placeholder="6"
          />
        </div>

        <div>
          <label className="label">First lesson of the term</label>
          <input
            type="date"
            required
            value={value.firstLessonDate}
            onChange={(e) => update({ firstLessonDate: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">School</label>
          <input
            type="text"
            required
            value={value.school}
            onChange={(e) => update({ school: e.target.value })}
            className="mt-1 input"
            placeholder="Zylo Performance Academy"
          />
        </div>

        <div>
          <label className="label">Group</label>
          <input
            type="number"
            min={1}
            required
            value={value.groupSize}
            onChange={(e) => update({ groupSize: Number(e.target.value) })}
            className="mt-1 input"
            placeholder="25"
          />
        </div>

        <div>
          <label className="label">Concept 1</label>
          <input
            type="text"
            required
            value={value.concept1}
            onChange={(e) => update({ concept1: e.target.value })}
            className="mt-1 input"
            placeholder="rhythm"
          />
        </div>

        <div>
          <label className="label">Concept 2 (optional)</label>
          <input
            type="text"
            value={value.concept2 || ""}
            onChange={(e) => update({ concept2: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Concept 3 (optional)</label>
          <input
            type="text"
            value={value.concept3 || ""}
            onChange={(e) => update({ concept3: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Concept 4 (optional)</label>
          <input
            type="text"
            value={value.concept4 || ""}
            onChange={(e) => update({ concept4: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Concept 5 (optional)</label>
          <input
            type="text"
            value={value.concept5 || ""}
            onChange={(e) => update({ concept5: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Skip Date 1 (optional)</label>
          <input
            type="date"
            value={value.skipDate1 || ""}
            onChange={(e) => update({ skipDate1: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Skip Date 2 (optional)</label>
          <input
            type="date"
            value={value.skipDate2 || ""}
            onChange={(e) => update({ skipDate2: e.target.value })}
            className="mt-1 input"
          />
        </div>

        <div>
          <label className="label">Skip Date 3 (optional)</label>
          <input
            type="date"
            value={value.skipDate3 || ""}
            onChange={(e) => update({ skipDate3: e.target.value })}
            className="mt-1 input"
          />
        </div>

        {error && (
          <div className="sm:col-span-2 text-sm text-red-600">{error}</div>
        )}

        <div className="sm:col-span-2 flex items-center gap-3 justify-end">
          <button className="btn-secondary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Next Step"}
          </button>
        </div>
      </form>
    </div>
  );
}


