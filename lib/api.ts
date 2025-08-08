import type { Activity, DownloadsPayload, LessonDetailsForm, Song } from "@/types";

const API_ENDPOINTS = {
  STEP1_SUBMIT: "https://myn8n.brightonhovedrumlessons.uk/webhook/lesson-details",
  STEP2_LOAD_SONGS: "https://myn8n.brightonhovedrumlessons.uk/webhook/get-songs",
  STEP2_SELECT_SONG: "https://myn8n.brightonhovedrumlessons.uk/webhook/select-song",
  STEP3_LOAD_ACTIVITIES: "https://myn8n.brightonhovedrumlessons.uk/webhook/get-activities",
  STEP3_SELECT_ACTIVITIES: "https://myn8n.brightonhovedrumlessons.uk/webhook/select-activities",
  STEP4_LOAD_PLANS: "https://myn8n.brightonhovedrumlessons.uk/webhook/get-lesson-plans",
  STEP4_REFINE: "https://myn8n.brightonhovedrumlessons.uk/webhook/refine-plans",
  STEP4_APPROVE: "https://myn8n.brightonhovedrumlessons.uk/webhook/approve-plans",
  STEP5_GET_DOWNLOADS: "https://myn8n.brightonhovedrumlessons.uk/webhook/get-downloads",
} as const;

const DEFAULT_RETRY = { retries: 2, backoffMs: 500 };

async function fetchJson<T>(url: string, init?: RequestInit, retry = DEFAULT_RETRY): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retry.retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        cache: "no-store",
        ...init,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt === retry.retries) break;
      await new Promise((r) => setTimeout(r, retry.backoffMs * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

// Step 1
export async function submitLessonDetails(payload: LessonDetailsForm): Promise<{ ok: true; id: string }> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP1_SUBMIT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Demo
    return { ok: true, id: "demo-lesson-details" };
  }
}

// Step 2
export async function loadSongs(): Promise<Song[]> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP2_LOAD_SONGS, { method: "GET" });
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
    return await fetchJson(API_ENDPOINTS.STEP2_SELECT_SONG, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  } catch {
    return { ok: true };
  }
}

// Step 3
export async function loadActivities(): Promise<Activity[]> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP3_LOAD_ACTIVITIES, { method: "GET" });
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
    return await fetchJson(API_ENDPOINTS.STEP3_SELECT_ACTIVITIES, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: true };
  }
}

// Step 4
export async function loadLessonPlans(): Promise<string> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP4_LOAD_PLANS, { method: "GET" });
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
    return await fetchJson(API_ENDPOINTS.STEP4_REFINE, {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch {
    // Demo: echo the request atop the existing plan
    const base = await loadLessonPlans();
    return [`REQUESTED CHANGES: ${request.changes}`, "", base].join("\n");
  }
}

export async function approveLessonPlans(): Promise<{ ok: true }> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP4_APPROVE, { method: "POST" });
  } catch {
    return { ok: true };
  }
}

// Step 5
export async function getDownloads(): Promise<DownloadsPayload> {
  try {
    return await fetchJson(API_ENDPOINTS.STEP5_GET_DOWNLOADS, { method: "GET" });
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



