"use client";

import { useEffect, useState } from "react";
import type { DownloadsPayload } from "@/types";
import { getDownloads } from "@/lib/api";

export default function Step5FinalDownload({ onBack, onRestart }: { onBack: () => void; onRestart?: () => void }) {
  const [payload, setPayload] = useState<DownloadsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDownloads();
        if (!mounted) return;
        setPayload(data);
      } catch {
        setError("Failed to load downloads.");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const status = payload?.status ?? (loading ? "pending" : "failed");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-zylo-blue">Final Download</h2>
        <p className="text-sm text-zylo-gray mt-1">Download your completed materials.</p>
      </div>

      {status === "pending" && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-zylo-gray">
          Generating files... please wait.
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {payload && payload.status === "ready" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <h3 className="font-semibold text-zylo-green">Success!</h3>
            <p className="text-sm text-zylo-gray mt-1">
              {payload.summary.lessonsCreated} lesson plans created. Song: {payload.summary.selectedSongTitle} ({payload.summary.selectedSongVersion}).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payload.files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-black/10 bg-white p-4 hover:shadow-sm transition"
              >
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-zylo-gray">{f.type.toUpperCase()} {f.sizeBytes ? `• ${(f.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : ""}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button className="btn-outline" onClick={onBack}>Back</button>
        <div className="flex items-center gap-2">
          {onRestart && (
            <button className="btn-secondary" onClick={onRestart}>Start New Lesson Plan</button>
          )}
        </div>
      </div>
    </div>
  );
}


