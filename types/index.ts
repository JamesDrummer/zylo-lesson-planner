export type StepKey = 1 | 2 | 3 | 4 | 5;

// Step 1: Lesson details form
export interface LessonDetailsForm {
  lessonsToGenerate: number; // required
  firstLessonDate: string; // date ISO
  school: string; // required
  groupSize: number; // required
  concept1: string; // required
  concept2?: string;
  concept3?: string;
  concept4?: string;
  concept5?: string;
  skipDate1?: string;
  skipDate2?: string;
  skipDate3?: string;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type MatchQuality = "Perfect" | "Great" | "Good";

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  version: string;
  difficulty: DifficultyLevel;
  concepts: string[]; // tags
}

export interface Activity {
  id: string;
  title: string;
  category: "Warmup" | "Game";
  relevance: MatchQuality;
  difficulty: "Easy" | "Medium" | "Hard";
  instructions: string;
  resources: string[];
  concepts: string[]; // tags
}

export interface LessonPlanLesson {
  weekNumber: number;
  date: string; // ISO
  objectives: string[];
  warmup: { id: string; title: string } | null;
  mainActivity: string;
  songWork: string;
  game?: { id: string; title: string } | null;
  homework?: string;
}

export interface LessonPlan {
  termOverview: string;
  totalLessons: number;
  lessons: LessonPlanLesson[];
}

export interface DownloadFile {
  id: string;
  name: string;
  type: "pdf" | "zip" | "docx" | "json" | string;
  sizeBytes?: number;
  url: string;
}

export interface DownloadsPayload {
  status: "pending" | "ready" | "failed";
  summary: {
    lessonsCreated: number;
    selectedSongTitle?: string;
    selectedSongVersion?: string;
    warmupTitle?: string;
    gameTitle?: string | null;
    termStart?: string;
    termEnd?: string;
  };
  files: DownloadFile[];
}



