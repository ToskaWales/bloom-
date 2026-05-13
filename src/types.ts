export type Phase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

export type TrainingSplit = 'Full Body' | 'Upper/Lower' | 'ULUL' | 'LUL';

export interface TrainingPlan {
  split: TrainingSplit;
  daysPerWeek: number;
  schedule: Record<number, 'Rest' | 'Workout'>; // Day 1-7
  focus: string;
}

export interface UserProfile {
  name: string;
  age: number;
  trainingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryGoal: 'Sprout' | 'Rise' | 'Peak' | 'Stillness';
  onboarded: boolean;
  trainingPlan?: TrainingPlan;
  // Detailed Training Profile
  daysPerWeek: number;
  workoutDuration: number; // minutes
  focusAreas: string[];
  // Hormonal Profile
  contraception: boolean;
  cycleRegularity: 'Regular' | 'Irregular' | 'Not Tracking';
}

export interface CycleState {
  currentDay: number; // 1-28
  phase: Phase;
  averageCycleLength: number;
  periodDuration: number;
  lastPeriodDate: string;
}

export interface DailySeed {
  energyScore: number; // 1-5
  moodScore: number; // 1-5
  symptoms: string[];
  timestamp: string;
}

export interface SetEntry {
  weight: string;
  reps: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  actualSets?: SetEntry[];
  videoUrl?: string;
  why: string;
  isCompleted: boolean;
}

export interface WorkoutState {
  exercises: Exercise[];
  swapHistory: string[];
  isCompleted: boolean;
  briefing: string;
  nutritionTip: string;
  scienceCitation: string;
  isRestDay: boolean;
}

export interface CompletedWorkout extends WorkoutState {
  date: string;
  phase: Phase;
  day: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
