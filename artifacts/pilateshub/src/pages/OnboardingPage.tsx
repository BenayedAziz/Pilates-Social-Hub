import { Activity, Check, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

const ONBOARDED_KEY = "pilateshub-onboarded";

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    emoji: "\u{1F331}",
    label: "Beginner",
    description: "New to Pilates or just getting started",
  },
  {
    id: "intermediate",
    emoji: "\u{1F4AA}",
    label: "Intermediate",
    description: "Comfortable with the basics, ready for more",
  },
  {
    id: "advanced",
    emoji: "\u{1F525}",
    label: "Advanced",
    description: "Experienced practitioner seeking challenge",
  },
] as const;

const APPARATUS_OPTIONS = [
  { id: "mat", emoji: "\u{1F9D8}", label: "Mat" },
  { id: "reformer", emoji: "\u{1F3CB}\uFE0F", label: "Reformer" },
  { id: "tower", emoji: "\u{1F5FC}", label: "Tower" },
  { id: "cadillac", emoji: "\u{1F6CF}\uFE0F", label: "Cadillac" },
  { id: "chair", emoji: "\u{1FA91}", label: "Chair" },
  { id: "barre", emoji: "\u{1F483}", label: "Barre" },
] as const;

const GOAL_OPTIONS = [
  "Build strength",
  "Improve flexibility",
  "Lose weight",
  "Recover from injury",
  "Reduce stress",
  "Meet people",
  "Have fun",
] as const;

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [selectedApparatus, setSelectedApparatus] = useState<Set<string>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());

  const totalSteps = 4;

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleFinish = useCallback(() => {
    // Save preferences to localStorage for future use
    const preferences = {
      experienceLevel,
      apparatus: Array.from(selectedApparatus),
      goals: Array.from(selectedGoals),
    };
    localStorage.setItem("pilateshub-preferences", JSON.stringify(preferences));
    localStorage.setItem(ONBOARDED_KEY, "true");
    onComplete();
  }, [experienceLevel, selectedApparatus, selectedGoals, onComplete]);

  const toggleApparatus = useCallback((id: string) => {
    setSelectedApparatus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGoal = useCallback((goal: string) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goal)) next.delete(goal);
      else next.add(goal);
      return next;
    });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, hsl(38 42% 97%) 0%, hsl(33 30% 93%) 40%, hsl(28 25% 90%) 100%)",
      }}
    >
      {/* Decorative circles matching AuthPage */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, hsl(28 22% 38%) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, hsl(16 50% 58%) 0%, transparent 70%)",
        }}
      />

      {/* Skip button */}
      <div className="flex justify-end p-5 relative z-10">
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60"
        >
          Skip
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Step content with transition */}
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {step === 0 && <WelcomeScreen onNext={handleNext} />}
            {step === 1 && (
              <ExperienceLevelScreen
                selected={experienceLevel}
                onSelect={setExperienceLevel}
                onNext={handleNext}
              />
            )}
            {step === 2 && (
              <ApparatusScreen
                selected={selectedApparatus}
                onToggle={toggleApparatus}
                onNext={handleNext}
              />
            )}
            {step === 3 && (
              <GoalsScreen
                selected={selectedGoals}
                onToggle={toggleGoal}
                onFinish={handleFinish}
              />
            )}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8 relative z-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-7 bg-primary shadow-sm"
                : i < step
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screen 1: Welcome                                                         */
/* -------------------------------------------------------------------------- */

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      {/* Illustration area */}
      <div className="mb-8 flex justify-center">
        <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Activity className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      <h1
        className="font-studio text-3xl text-foreground mb-3"
        style={{ fontWeight: 600, letterSpacing: "-0.03em" }}
      >
        Welcome to PilatesHub
      </h1>
      <p className="text-muted-foreground text-base mb-10 leading-relaxed max-w-xs mx-auto">
        Let's personalize your experience so you get the most out of every session.
      </p>

      <Button
        onClick={onNext}
        className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-2xl btn-premium shadow-md text-base"
      >
        Get Started
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screen 2: Experience Level                                                */
/* -------------------------------------------------------------------------- */

function ExperienceLevelScreen({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2
        className="font-studio text-2xl text-foreground text-center mb-2"
        style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        What's your Pilates level?
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8">
        This helps us recommend the right classes for you
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = selected === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? "border-primary bg-primary/8 shadow-md"
                  : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <span className="text-3xl flex-shrink-0">{level.emoji}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {level.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {level.description}
                </p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!selected}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-2xl btn-premium shadow-md text-base disabled:opacity-40"
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screen 3: Favorite Apparatus                                              */
/* -------------------------------------------------------------------------- */

function ApparatusScreen({
  selected,
  onToggle,
  onNext,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2
        className="font-studio text-2xl text-foreground text-center mb-2"
        style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        What do you enjoy most?
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8">
        Select all that interest you
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {APPARATUS_OPTIONS.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/8 shadow-md"
                  : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <span className="text-3xl">{item.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={selected.size === 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-2xl btn-premium shadow-md text-base disabled:opacity-40"
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screen 4: Goals                                                           */
/* -------------------------------------------------------------------------- */

function GoalsScreen({
  selected,
  onToggle,
  onFinish,
}: {
  selected: Set<string>;
  onToggle: (goal: string) => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <h2
        className="font-studio text-2xl text-foreground text-center mb-2"
        style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        What are your goals?
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8">
        Choose as many as you like
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 mb-10">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selected.has(goal);
          return (
            <button
              key={goal}
              onClick={() => onToggle(goal)}
              className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border/50 bg-card text-foreground hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {goal}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onFinish}
        disabled={selected.size === 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-2xl btn-premium shadow-md text-base disabled:opacity-40"
      >
        Start Exploring
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}
