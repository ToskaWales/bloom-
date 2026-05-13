import { Phase, Exercise } from './types';

export const COLORS: Record<Phase, string> = {
  Menstrual: '#FF8A9B', // Soft Rose
  Follicular: '#4DE1B0', // Vibrant Teal
  Ovulatory: '#FFB347', // Solar Amber
  Luteal: '#9F7AEA',    // Amethyst Purple
};

export const DARK_COLORS: Record<Phase, string> = {
  Menstrual: '#f43f5e',
  Follicular: '#10b981',
  Ovulatory: '#f59e0b',
  Luteal: '#8b5cf6',
};

export const SYMPTOMS = [
  'Bloating', 'Cramps', 'High Focus', 'Brain Fog', 'Sensitive', 
  'Lower Back Pain', 'High Energy', 'Good Sleep', 'Restless', 'Stable'
];

export const INITIAL_EXERCISES: Record<Phase, Exercise[]> = {
  Menstrual: [
    { id: '1', name: 'Yoga Flow', sets: 1, reps: '20 mins', why: 'Low intensity movement aids circulation and reduces cramping during the menstrual phase.', isCompleted: false },
    { id: '2', name: 'Zhan Zhuang (Standing Meditation)', sets: 3, reps: '3 mins', why: 'Focuses on internal stability and stillness when hormonal levels are at their lowest.', isCompleted: false },
  ],
  Follicular: [
    { id: '3', name: 'High Volume Squats', sets: 4, reps: '12', weight: '40', why: 'Estrogen is rising, which supports muscle building and higher volume capacity.', isCompleted: false },
    { id: '4', name: 'Overhead Press', sets: 3, reps: '10', weight: '20', why: 'Foundational strength work matches the increasing energy levels of the follicular phase.', isCompleted: false },
  ],
  Ovulatory: [
    { id: '5', name: 'Maximum Effort Deadlift', sets: 5, reps: '3', weight: '80', why: 'The ovulatory peak provides the highest strength potential and neural drive.', isCompleted: false },
    { id: '6', name: 'Box Jumps', sets: 4, reps: '5', why: 'Explosive power is at its highest during the testosterone surge of ovulation.', isCompleted: false },
  ],
  Luteal: [
    { id: '7', name: 'Incline Bench Press', sets: 3, reps: '8', weight: '30', why: 'Steady strength work supports maintenance as progesterone rises and body temp increases.', isCompleted: false },
    { id: '8', name: 'LISS Cardio', sets: 1, reps: '30 mins', why: 'Low-intensity steady state is optimal for metabolic shift during the late luteal phase.', isCompleted: false },
  ],
};
