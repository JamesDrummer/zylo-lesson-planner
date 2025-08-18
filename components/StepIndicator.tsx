"use client";

import React from "react";

type StepDef = { key: number; label: string };

export default function StepIndicator({
  currentStep,
  steps,
  onStepClick,
}: {
  currentStep: number;
  steps: StepDef[];
  onStepClick?: (step: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="sticky top-2 z-10">
      <div className="zylo-accent-bar mb-3" />
      <ol className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {steps.map((step, idx) => {
          const stepIndex = idx + 1;
          const isComplete = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;
          const baseCircle = isComplete
            ? "bg-zylo-green text-white"
            : isCurrent
            ? "bg-zylo-pink text-white animate-pulse"
            : "bg-white text-zylo-gray";

          return (
            <li key={step.key} className="flex items-center sm:flex-1">
              <button
                type="button"
                onClick={() => onStepClick?.(stepIndex)}
                className="group w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/10 shadow-md ${baseCircle}`}
                  >
                    {isComplete ? "✓" : stepIndex}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent
                          ? "text-zylo-pink"
                          : isComplete
                          ? "text-zylo-green"
                          : "text-zylo-gray"
                      }`}
                    >
                      {step.label}
                    </p>
                    <div className="h-1 mt-2 rounded-full bg-black/5">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          isComplete
                            ? "bg-zylo-green w-full"
                            : isCurrent
                            ? "bg-zylo-pink w-2/3"
                            : "bg-transparent w-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


