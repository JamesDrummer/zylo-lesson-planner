"use client";

import { useEffect, useMemo, useState } from "react";
import type { Song } from "@/types";
import { loadSongs, selectSong } from "@/lib/api";

export default function Step2SongSelection({
  selectedSong,
  onChange,
  onBack,
  onNext,
}: {
  selectedSong: Song | null;
  onChange: (song: Song | null) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  // Removed unused loading state to satisfy lint rules
  const [results, setResults] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setError(null);
      try {
        const songs = await loadSongs();
        setResults(songs);
      } catch {
        setError("Failed to load songs.");
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.version.toLowerCase().includes(q)
    );
  }, [query, results]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-zylo-blue">Song Selection</h2>
        <p className="text-sm text-zylo-gray mt-1">Search and pick songs for your lesson.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-zylo-blue/30"
          placeholder="Search songs (artist, title, style)"
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        />
        <div className="hidden sm:block" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((song) => {
          const isSelected = selectedSong?.id === song.id;
          return (
            <div
              key={song.id}
              className={`rounded-2xl glass p-4 shadow-sm transition-transform hover:-translate-y-0.5 ${
                isSelected ? "border-zylo-pink" : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{song.title}</h3>
                  <p className="text-xs text-zylo-gray">{song.artist}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-zylo-blue text-white shadow-sm">{song.bpm} BPM</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-black/5">{song.genre}</span>
                <span className="px-2 py-1 rounded-full bg-black/5">{song.version}</span>
                <span className="px-2 py-1 rounded-full bg-black/5">Difficulty {song.difficulty}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {song.concepts.map((c) => (
                  <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-zylo-yellow/20 text-zylo-gray">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <button
                  className="btn-secondary w-full"
                  onClick={async () => {
                    onChange(song);
                    try {
                      await selectSong(song.id);
                      onNext();
                    } finally {
                    }
                  }}
                >
                  Select This Song
                </button>
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-zylo-gray">No songs found. Try adjusting your search.</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button className="btn-outline" onClick={onBack}>Back</button>
        <div />
      </div>
    </div>
  );
}


