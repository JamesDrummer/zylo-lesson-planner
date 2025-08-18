"use client";

import { useMemo, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1LessonDetails from "@/components/steps/Step1LessonDetails";
import Step2SongSelection from "@/components/steps/Step2SongSelection";
import Step3ActivitySelection from "@/components/steps/Step3ActivitySelection";
import Step4LessonReview from "@/components/steps/Step4LessonReview";
import Step5FinalDownload from "@/components/steps/Step5FinalDownload";
import type { Activity, LessonDetailsForm, Song } from "@/types";

export default function Home() {
  const steps = useMemo(
    () => [
      { key: 1, label: "Lesson Details" },
      { key: 2, label: "Song Selection" },
      { key: 3, label: "Activity Selection" },
      { key: 4, label: "Lesson Review" },
      { key: 5, label: "Final Download" },
    ],
    []
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lessonDetails, setLessonDetails] = useState<LessonDetailsForm>(() => ({
    lessonsToGenerate: 6,
    firstLessonDate: "",
    school: "",
    groupSize: 25,
    concept1: "",
    concept2: "",
    concept3: "",
    concept4: "",
    concept5: "",
    skipDate1: "",
    skipDate2: "",
    skipDate3: "",
  }));
  const [selectedSong, setSelectedSong] = useState<Song | null>(() => null);
  const [selectedWarmup, setSelectedWarmup] = useState<Activity | null>(() => null);
  const [selectedGame, setSelectedGame] = useState<Activity | null>(() => null);
  const [plan, setPlan] = useState<string | null>(() => null);

  const goNext = () => setCurrentStep((s) => Math.min(steps.length, s + 1));
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="text-center">
        <h1 className="display text-3xl sm:text-4xl md:text-5xl font-bold text-zylo-pink drop-shadow-[0_2px_0_rgba(0,0,0,0.08)]">
          Zylo Lesson Planner
        </h1>
        <p className="mt-2 text-sm sm:text-base text-zylo-gray">
          Plan engaging music lessons with songs and activities.
        </p>
      </header>

      <div className="card">
        <StepIndicator
          currentStep={currentStep}
          steps={steps}
          onStepClick={(idx) => setCurrentStep(idx)}
        />
      </div>

      <main className="card overflow-hidden">
        {currentStep === 1 && (
          <Step1LessonDetails
            value={lessonDetails}
            onChange={setLessonDetails}
            onNext={() => {
              setPlan(null);
              goNext();
            }}
          />
        )}
        {currentStep === 2 && (
          <Step2SongSelection
            selectedSong={selectedSong}
            onChange={(song) => {
              setSelectedSong(song);
              setPlan(null);
            }}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 3 && (
          <Step3ActivitySelection
            selectedWarmup={selectedWarmup}
            selectedGame={selectedGame}
            onChange={({ warmup, game }) => {
              setSelectedWarmup(warmup);
              setSelectedGame(game ?? null);
              setPlan(null);
            }}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 4 && (
          <Step4LessonReview
            value={plan}
            onChange={setPlan}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 5 && (
          <Step5FinalDownload onBack={goBack} onRestart={() => {
            setCurrentStep(1);
            setSelectedSong(null);
            setSelectedWarmup(null);
            setSelectedGame(null);
            setPlan(null);
          }} />
        )}
      </main>
    </div>
  );
}
