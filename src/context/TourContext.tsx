import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { useSettings } from "@/context/SettingsContext";
import { navigationRef } from "@/navigation/navigationRef";

export interface TourStep {
  emoji: string;
  title: string;
  description: string;
  targetTab?: "Home" | "Tasks" | "Insights" | "Profile";
  // Coordinates for the arrow/pointer on screen
  // Tooltip coordinates
  arrowPos: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    type: "up" | "down" | "left" | "right" | "none";
  };
  tooltipPos: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
  };
}

export const TOUR_STEPS: TourStep[] = [
  {
    emoji: "🎉",
    title: "Welcome to TuonTa!",
    description: "Let's take a quick 1-minute interactive tour of your new workspace and features.",
    arrowPos: { type: "none" },
    tooltipPos: { top: "35%", left: "5%", right: "5%" },
  },
  {
    emoji: "☀",
    title: "Dark Mode Switcher",
    description: "Tap the sun or moon icon in the top header to toggle between light and dark themes.",
    targetTab: "Home",
    arrowPos: { top: 120, right: 62, type: "up" },
    tooltipPos: { top: 180, left: "5%", right: "5%" },
  },
  {
    emoji: "🏠",
    title: "Home Tab",
    description:
      "This is your main dashboard. Check your overall task completion progress, review your weekly momentum stats, and view your next upcoming deadlines.",
    targetTab: "Home",
    arrowPos: { bottom: 85, left: "10.5%", type: "down" },
    tooltipPos: { bottom: 155, left: "5%", right: "5%" },
  },
  {
    emoji: "✅",
    title: "Tasks List",
    description:
      "Manage, filter, and search your academic workload. You can search by keywords or tap tag chips to filter the view.",
    targetTab: "Tasks",
    arrowPos: { bottom: 85, left: "34.5%", type: "down" },
    tooltipPos: { bottom: 155, left: "5%", right: "5%" },
  },
  {
    emoji: "📅",
    title: "Timeline View",
    description:
      "Tap the 'Timeline' button at the top-right of the Tasks screen to view all your tasks organized chronologically by due date.",
    targetTab: "Tasks",
    arrowPos: { top: 110, right: "23%", type: "up" },
    tooltipPos: { top: 170, left: "5%", right: "5%" },
  },
  {
    emoji: "⚡",
    title: "Interactive Swipes",
    description:
      "Get things done faster! Swipe RIGHT on a task card to instantly mark it complete. Swipe LEFT to delete it.",
    targetTab: "Tasks",
    arrowPos: { top: "45%", left: "45%", type: "none" },
    tooltipPos: { top: "35%", left: "5%", right: "5%" },
  },
  {
    emoji: "📊",
    title: "Progress Insights",
    description:
      "This is your Insights tab. View your consecutive study streak 🔥, see a bar chart of focus minutes, and review your weekly completion rates.",
    targetTab: "Insights",
    arrowPos: { bottom: 85, left: "59.5%", type: "down" },
    tooltipPos: { bottom: 155, left: "5%", right: "5%" },
  },
  {
    emoji: "👤",
    title: "Profile & Reminders",
    description:
      "Customize your student profile, configure deadline push notifications, and look at the timeline of all upcoming scheduled reminders.",
    targetTab: "Profile",
    arrowPos: { bottom: 85, left: "84.5%", type: "down" },
    tooltipPos: { bottom: 155, left: "5%", right: "5%" },
  },
];

interface TourContextValue {
  tourActive: boolean;
  currentStep: number;
  runTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: PropsWithChildren) {
  const { settings, updateSettings } = useSettings();
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Trigger tour if onboarding is complete but tour was never finished
  useEffect(() => {
    if (settings.onboardingComplete && !settings.tourCompleted) {
      // Small timeout to allow tabs navigation container to mount
      const timer = setTimeout(() => {
        setTourActive(true);
        setCurrentStep(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [settings.onboardingComplete, settings.tourCompleted]);

  // Navigate to appropriate tab programmatically on step changes
  useEffect(() => {
    if (!tourActive) return;
    const stepData = TOUR_STEPS[currentStep];
    if (stepData?.targetTab && navigationRef.isReady()) {
      navigationRef.navigate(stepData.targetTab as any);
    }
  }, [currentStep, tourActive]);

  const runTour = useCallback(() => {
    setCurrentStep(0);
    setTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      setTourActive(false);
      updateSettings({ tourCompleted: true });
    }
  }, [currentStep, updateSettings]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setTourActive(false);
    updateSettings({ tourCompleted: true });
  }, [updateSettings]);

  const value = useMemo(
    () => ({ tourActive, currentStep, runTour, nextStep, prevStep, skipTour }),
    [tourActive, currentStep, runTour, nextStep, prevStep, skipTour]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error("useTour must be used inside TourProvider");
  return context;
}
