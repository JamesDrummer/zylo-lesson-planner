"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@/types";
import { loadActivities, selectActivities } from "@/lib/api";

export default function Step3ActivitySelection({
  selectedWarmup,
  selectedGame,
  onChange,
  onBack,
  onNext,
}: {
  selectedWarmup: Activity | null;
  selectedGame: Activity | null;
  onChange: (payload: { warmup: Activity | null; game: Activity | null }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  // Removed unused loading state to satisfy lint rules
  const [results, setResults] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setError(null);
      try {
        const acts = await loadActivities();
        setResults(acts);
      } catch {
        setError("Failed to load activities.");
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.difficulty.toLowerCase().includes(q)
    );
  }, [query, results]);

  // Sort by match quality: Perfect > Great > Good
  const relevanceScore: Record<string, number> = { Perfect: 3, Great: 2, Good: 1 };
  const byRelevanceDesc = (a: Activity, b: Activity) =>
    (relevanceScore[b.relevance] ?? 0) - (relevanceScore[a.relevance] ?? 0);

  const warmups = filtered
    .filter((a) => a.category === "Warmup")
    .sort(byRelevanceDesc)
    .slice(0, 5);
  const games = filtered
    .filter((a) => a.category === "Game")
    .sort(byRelevanceDesc)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-zylo-pink">Activity Selection</h2>
        <p className="text-sm text-zylo-gray mt-1">Search and choose activities to reinforce concepts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-zylo-blue/30"
          placeholder="Search activities (concept, difficulty, type)"
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        />
        <div className="hidden sm:block" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="font-semibold mb-3">🔥 Warmup Activities</h3>
          <div className="space-y-3">
            {warmups.map((act) => {
              const isSelected = selectedWarmup?.id === act.id;
              return (
                <div
                  key={act.id}
                  role="button"
                  aria-selected={isSelected}
                  className={`rounded-2xl glass p-4 shadow-sm relative overflow-visible transition z-10 hover:z-50 ${
                    isSelected
                      ? "bg-zylo-green/10 ring-2 ring-zylo-green"
                      : "ring-1 ring-black/10 hover:ring-zylo-blue/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{act.title}</h4>
                      <p className="text-xs text-zylo-gray">{act.difficulty}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      act.relevance === "Perfect"
                        ? "bg-zylo-green text-white"
                        : act.relevance === "Great"
                        ? "bg-zylo-pink text-white"
                        : "bg-zylo-yellow"
                    }`}>{act.relevance} Match</span>
                  </div>
                  <div className="mt-2 relative inline-block group">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black">Instructions</span>
                    <div className="pointer-events-none absolute left-0 mt-2 w-80 max-w-[90vw] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[999]">
                      <div className="rounded-xl shadow-lg ring-1 ring-black/10 bg-white p-3">
                        <p className="text-sm leading-snug whitespace-pre-wrap">{act.instructions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 relative inline-block group">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black">
                      {act.concepts.length} concepts
                    </span>
                    <div className="pointer-events-none absolute left-0 mt-2 w-64 max-w-[80vw] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[999]">
                      <div className="rounded-xl shadow-lg ring-1 ring-black/10 bg-white p-3">
                        <div className="grid grid-cols-2 gap-1">
                          {act.concepts.map((c) => (
                            <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-zylo-yellow/20 text-zylo-gray truncate">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      className={`${isSelected ? "btn-primary" : "btn-secondary"} w-full`}
                      disabled={isSelected}
                      onClick={() => onChange({ warmup: act, game: selectedGame })}
                    >
                      {isSelected ? "Selected" : "Select This Activity"}
                    </button>
                  </div>
                </div>
              );
            })}
            {!warmups.length && <p className="text-sm text-zylo-gray">No warmups found.</p>}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3">🎮 Game Activities</h3>
          <div className="space-y-3">
            {games.map((act) => {
              const isSelected = selectedGame?.id === act.id;
              return (
                <div
                  key={act.id}
                  role="button"
                  aria-selected={isSelected}
                  className={`rounded-2xl glass p-4 shadow-sm relative overflow-visible transition z-10 hover:z-50 ${
                    isSelected
                      ? "bg-zylo-green/10 ring-2 ring-zylo-green"
                      : "ring-1 ring-black/10 hover:ring-zylo-blue/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{act.title}</h4>
                      <p className="text-xs text-zylo-gray">{act.difficulty}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      act.relevance === "Perfect"
                        ? "bg-zylo-green text-white"
                        : act.relevance === "Great"
                        ? "bg-zylo-pink text-white"
                        : "bg-zylo-yellow"
                    }`}>{act.relevance} Match</span>
                  </div>
                  <div className="mt-2 relative inline-block group">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black">Instructions</span>
                    <div className="pointer-events-none absolute left-0 mt-2 w-80 max-w-[90vw] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[999]">
                      <div className="rounded-xl shadow-lg ring-1 ring-black/10 bg-white p-3">
                        <p className="text-sm leading-snug whitespace-pre-wrap">{act.instructions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 relative inline-block group">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black">
                      {act.concepts.length} concepts
                    </span>
                    <div className="pointer-events-none absolute left-0 mt-2 w-64 max-w-[80vw] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[999]">
                      <div className="rounded-xl shadow-lg ring-1 ring-black/10 bg-white p-3">
                        <div className="grid grid-cols-2 gap-1">
                          {act.concepts.map((c) => (
                            <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-zylo-yellow/20 text-zylo-gray truncate">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className={`${isSelected ? "btn-primary" : "btn-secondary"} flex-1`}
                      disabled={isSelected}
                      onClick={() => onChange({ warmup: selectedWarmup, game: act })}
                    >
                      {isSelected ? "Selected" : "Select This Activity"}
                    </button>
                    <button
                      className={`btn-outline ${selectedGame === null ? "ring-zylo-green" : ""}`}
                      onClick={() => onChange({ warmup: selectedWarmup, game: null })}
                    >
                      No Game
                    </button>
                  </div>
                </div>
              );
            })}
            {!games.length && <p className="text-sm text-zylo-gray">No games found.</p>}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between">
        <button className="btn-outline" onClick={onBack}>Back</button>
        <button
          className="btn-primary"
          disabled={!selectedWarmup || submitting}
          onClick={async () => {
            if (submitting) return;
            setSubmitting(true);
            try {
              await selectActivities({ selectedWarmup: selectedWarmup!, selectedGame: selectedGame });
              onNext();
            } finally {
              // Don't reset submitting state since we're navigating away
            }
          }}
        >
          {submitting ? "Submitting..." : "Continue"}
        </button>
      </div>
    </div>
  );
}


