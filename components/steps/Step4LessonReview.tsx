"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { approveLessonPlans, loadLessonPlans, refineLessonPlans } from "@/lib/api";

export default function Step4LessonReview({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string | null;
  onChange: (plan: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState("");
  const [refining, setRefining] = useState(false);
  const [approving, setApproving] = useState(false);

  // Guard against React Strict Mode double-invocation and ensure
  // we only call the resume URL once to generate the plan. Further
  // resume calls only happen on user actions (refine/approve).
  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (hasRequestedRef.current || value) return;
    hasRequestedRef.current = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await loadLessonPlans();
        onChange(p);
      } catch {
        setError("Failed to generate plan. Try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-zylo-pink">Lesson Plan Review</h2>
        <p className="text-sm text-zylo-gray mt-1">Review the generated lesson plan before downloading.</p>
      </div>

      {loading && <p className="text-sm text-zylo-gray">Generating plan...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {value && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-zylo-green mb-2">Generated Lesson Plan</h3>
            <div className="rounded-xl border border-black/10 bg-white p-3 overflow-auto max-h-[70vh] prose prose-zinc">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-zylo-pink mb-2">Request Changes</h3>
            <textarea
              className="textarea"
              rows={16}
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Describe adjustments you want..."
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="btn-outline"
                onClick={() => setChanges("")}
              >
                Clear
              </button>
              <button
                className="btn-secondary"
                disabled={refining}
                onClick={async () => {
                  if (refining) return;
                  setRefining(true);
                  try {
                    const refined = await refineLessonPlans({ changes });
                    onChange(refined);
                    setChanges("");
                  } finally {
                    setRefining(false);
                  }
                }}
              >
                {refining ? "Refining..." : "Request Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button className="btn-outline" onClick={onBack}>Back</button>
        <div className="flex items-center gap-2">
          <button
            className="btn-primary"
            disabled={!value || approving}
            onClick={async () => {
              if (approving) return;
              setApproving(true);
              try {
                await approveLessonPlans();
                onNext();
              } finally {
                // Don't reset approving state since we're navigating away
              }
            }}
          >
            {approving ? "Generating..." : "Generate Final Materials"}
          </button>
        </div>
      </div>
    </div>
  );
}


