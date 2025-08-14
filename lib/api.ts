import type { Activity, DownloadsPayload, LessonDetailsForm, Song } from "@/types";

// Wait/Resume architecture: start once -> receive resumeUrl -> resume with JSON at each step
let currentResumeUrl: string | null = null;
let prefetchedSongs: Song[] | null = null;
let prefetchedActivities: Activity[] | null = null;

const DEFAULT_RETRY = { retries: 2, backoffMs: 500 } as const;

class HttpError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.status = status;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit, retry = DEFAULT_RETRY): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retry.retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        cache: "no-store",
        ...init,
      });
      if (!res.ok) throw new HttpError(res.status);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      // Do not retry client errors (4xx)
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
        break;
      }
      if (attempt === retry.retries) break;
      await new Promise((r) => setTimeout(r, retry.backoffMs * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

function ensureResumeUrl(): void {
  if (!currentResumeUrl) {
    throw new Error("Workflow not started yet. Please start and obtain resumeUrl first.");
  }
}

type ResumeResponseWithUrl = { resumeUrl: string };

function hasResumeUrl(value: unknown): value is ResumeResponseWithUrl {
  return (
    typeof value === "object" &&
    value !== null &&
    "resumeUrl" in value &&
    typeof (value as { resumeUrl: unknown }).resumeUrl === "string"
  );
}

async function postResume<T>(payload: unknown): Promise<T> {
  ensureResumeUrl();
  const url = `/api/resume?url=${encodeURIComponent(currentResumeUrl!)}`;
  const data = await fetchJson<T>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // Optionally update resumeUrl if backend returns a new one
  if (hasResumeUrl(data)) currentResumeUrl = data.resumeUrl;
  return data;
}

// Step 1
export async function submitLessonDetails(payload: LessonDetailsForm): Promise<{ ok: true; id: string }> {
  // Start the workflow and capture resumeUrl
  try {
    const res = await fetchJson<{ resumeUrl: string; songs?: unknown }>("/api/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.resumeUrl) throw new Error("Missing resumeUrl from start response");
    currentResumeUrl = res.resumeUrl;
    // Accept optional songs array in the initial start response to avoid an extra round trip
    if (Array.isArray(res.songs)) {
      prefetchedSongs = res.songs as Song[];
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("zylo_prefetchedSongs", JSON.stringify(prefetchedSongs));
        }
      } catch {
        // ignore storage errors
      }
    } else {
      prefetchedSongs = null;
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("zylo_prefetchedSongs");
        }
      } catch {
        // ignore
      }
    }
    return { ok: true, id: "started" };
  } catch {
    // Surface error; do not fallback to a mock URL to avoid invalid resume fetches
    throw new Error("Start failed: no resumeUrl returned");
  }
}

// Step 2
export async function loadSongs(): Promise<Song[]> {
  try {
    if (prefetchedSongs) return prefetchedSongs;
    // Try sessionStorage in case of a soft reload between steps
    try {
      if (typeof window !== "undefined") {
        const raw = window.sessionStorage.getItem("zylo_prefetchedSongs");
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            prefetchedSongs = parsed as Song[];
            return prefetchedSongs;
          }
        }
      }
    } catch {
      // ignore
    }
    return await postResume<Song[]>({ action: "loadSongs" });
  } catch {
    // Demo
    return [
      {
        id: "1",
        title: "Rhythm Road",
        artist: "Zylo Band",
        bpm: 120,
        genre: "Pop",
        version: "Clean",
        difficulty: 2,
        concepts: ["rhythm", "tempo"],
      },
      {
        id: "2",
        title: "Melody Magic",
        artist: "The Scales",
        bpm: 96,
        genre: "Rock",
        version: "Acoustic",
        difficulty: 3,
        concepts: ["melody", "pitch"],
      },
      {
        id: "3",
        title: "Harmony Hills",
        artist: "Chord Crew",
        bpm: 88,
        genre: "Folk",
        version: "Studio",
        difficulty: 1,
        concepts: ["harmony", "chords"],
      },
    ];
  }
}

export async function selectSong(songId: string): Promise<{ ok: true }> {
  try {
    const response = await postResume<{ ok: true; activities?: unknown }>({ action: "selectSong", songId });
    // Accept optional activities array in the song selection response
    if (Array.isArray(response.activities)) {
      prefetchedActivities = response.activities as Activity[];
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("zylo_prefetchedActivities", JSON.stringify(prefetchedActivities));
        }
      } catch {
        // ignore storage errors
      }
    } else {
      prefetchedActivities = null;
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("zylo_prefetchedActivities");
        }
      } catch {
        // ignore
      }
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// Step 3
export async function loadActivities(): Promise<Activity[]> {
  try {
    if (prefetchedActivities) return prefetchedActivities;
    // Try sessionStorage in case of a soft reload between steps
    try {
      if (typeof window !== "undefined") {
        const raw = window.sessionStorage.getItem("zylo_prefetchedActivities");
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            prefetchedActivities = parsed as Activity[];
            return prefetchedActivities;
          }
        }
      }
    } catch {
      // ignore
    }
    return await postResume<Activity[]>({ action: "loadActivities" });
  } catch {
    return [
      {
        id: "a1",
        title: "Clap the Beat",
        category: "Warmup",
        relevance: "Perfect",
        difficulty: "Easy",
        instructions: "Clap quarter notes with metronome at 100 bpm.",
        resources: ["Metronome"],
        concepts: ["rhythm", "tempo"],
      },
      {
        id: "a2",
        title: "Sing the Scale",
        category: "Warmup",
        relevance: "Great",
        difficulty: "Medium",
        instructions: "Sing do-re-mi-fa-so-la-ti-do in C major.",
        resources: ["Pitch pipe"],
        concepts: ["melody", "pitch"],
      },
      {
        id: "g1",
        title: "Tempo Change Game",
        category: "Game",
        relevance: "Good",
        difficulty: "Hard",
        instructions: "Change tempo on conductor cue; freeze on stop.",
        resources: ["Conductor cards"],
        concepts: ["tempo", "listening"],
      },
    ];
  }
}

export async function selectActivities(payload: { warmupId: string; gameId?: string | null }): Promise<{ ok: true }> {
  try {
    await postResume<{ ok: true }>({ action: "selectActivities", ...payload });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// Step 4
export async function loadLessonPlans(): Promise<string> {
  try {
    return await postResume<string>({ action: "loadPlans" });
  } catch {
    // Demo text block representing a full term plan
    const lines: string[] = [];
    lines.push("TERM OVERVIEW: A 6-week term focusing on rhythm and melody foundations.\n");
    for (let i = 0; i < 6; i++) {
      const date = new Date(Date.now() + i * 7 * 86400000).toISOString().slice(0, 10);
      lines.push(`WEEK ${i + 1} (${date})`);
      lines.push("Objectives: Keep steady beat; Identify pitch up/down");
      lines.push("Warmup: Clap the Beat (5m)");
      lines.push("Main Activity: Call-and-response rhythm patterns (15m)");
      lines.push("Song Work: Practice verse and chorus with dynamics (10m)");
      lines.push(i % 2 === 0 ? "Game: Tempo Change Game (10m)" : "Game: —");
      lines.push("Homework: Practice clapping rhythms for 5 mins/day\n");
    }
    return lines.join("\n");
  }
}

export async function refineLessonPlans(request: { changes: string }): Promise<string> {
  try {
    return await postResume<string>({ action: "refine", changes: request.changes });
  } catch {
    // Demo: echo the request atop the existing plan
    const base = await loadLessonPlans();
    return [`REQUESTED CHANGES: ${request.changes}`, "", base].join("\n");
  }
}

export async function approveLessonPlans(): Promise<{ ok: true }> {
  try {
    await postResume<{ ok: true }>({ action: "approve" });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// Step 5
export async function getDownloads(): Promise<DownloadsPayload> {
  try {
    return await postResume<DownloadsPayload>({ action: "getDownloads" });
  } catch {
    return {
      status: "ready",
      summary: {
        lessonsCreated: 6,
        selectedSongTitle: "Rhythm Road",
        selectedSongVersion: "Clean",
        warmupTitle: "Clap the Beat",
        gameTitle: "Tempo Change Game",
        termStart: new Date().toISOString().slice(0, 10),
        termEnd: new Date(Date.now() + 5 * 7 * 86400000).toISOString().slice(0, 10),
      },
      files: [
        { id: "f1", name: "Term Overview.pdf", type: "pdf", sizeBytes: 1024 * 1024, url: "#" },
        { id: "f2", name: "Lesson Plans.zip", type: "zip", sizeBytes: 5 * 1024 * 1024, url: "#" },
      ],
    };
  }
}



