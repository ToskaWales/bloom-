import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { UserProfile, CycleState, DailySeed, WorkoutState, Phase, CompletedWorkout, Exercise } from '../types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

interface AppContextType {
  user: UserProfile;
  cycle: CycleState;
  seed: DailySeed | null;
  workout: WorkoutState;
  history: CompletedWorkout[];
  firebaseUser: User | null;
  isAuthReady: boolean;
  setSeed: (seed: DailySeed) => void;
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutState>>;
  updateExercises: (exercises: Exercise[]) => void;
  saveWorkout: () => void;
  nextDay: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateCycle: (updates: Partial<CycleState>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const calculatePhase = (day: number): Phase => {
  if (day <= 5) return 'Menstrual';
  if (day <= 13) return 'Follicular';
  if (day === 14) return 'Ovulatory';
  return 'Luteal';
};

const DEFAULT_USER: UserProfile = {
  name: "Alex",
  age: 28,
  trainingExperience: 'Intermediate',
  primaryGoal: 'Rise',
  onboarded: false,
  daysPerWeek: 3,
  workoutDuration: 45,
  focusAreas: [],
  contraception: false,
  cycleRegularity: 'Regular'
};

const DEFAULT_CYCLE: CycleState = {
  currentDay: 1,
  phase: 'Menstrual',
  averageCycleLength: 28,
  periodDuration: 5,
  lastPeriodDate: new Date().toISOString()
};

const DEFAULT_WORKOUT: WorkoutState = {
  exercises: [],
  swapHistory: [],
  isCompleted: false,
  briefing: "Loading your proactive briefing...",
  nutritionTip: "Hydrate with electrolytes.",
  scienceCitation: "Estrogen improves insulin sensitivity.",
  isRestDay: false
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [cycle, setCycle] = useState<CycleState>(DEFAULT_CYCLE);
  const [seed, setSeed] = useState<DailySeed | null>(null);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [workout, setWorkout] = useState<WorkoutState>(DEFAULT_WORKOUT);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Data Sync from Firestore
  useEffect(() => {
    if (!firebaseUser) return;

    const fetchData = async () => {
      const userId = firebaseUser.uid;
      
      try {
        // User Profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // Initialize user in Firestore if they don't exist
          try {
            await setDoc(doc(db, 'users', userId), DEFAULT_USER);
            setUser(DEFAULT_USER);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
          }
        }

        // Cycle State
        try {
          const cycleDoc = await getDoc(doc(db, 'users', userId, 'cycle', 'current'));
          if (cycleDoc.exists()) {
            setCycle(cycleDoc.data() as CycleState);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/cycle/current`);
        }

        // History
        try {
          const historySnap = await getDocs(
            collection(db, 'users', userId, 'workouts')
          );
          const historyData = historySnap.docs
            .map(d => d.data() as CompletedWorkout)
            .filter(d => d.isCompleted)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setHistory(historyData);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, `users/${userId}/workouts`);
        }

        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching data from Firestore", error);
        return;
      }
    };

    fetchData();
  }, [firebaseUser]);

  // Sync Profile Changes
  useEffect(() => {
    if (!firebaseUser || !user.onboarded || isInitialLoad) return;
    const userId = firebaseUser.uid;
    const syncProfile = async () => {
      try {
        await setDoc(doc(db, 'users', userId), user);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      }
    };
    syncProfile();
  }, [user, firebaseUser, isInitialLoad]);

  // Sync Cycle Changes
  useEffect(() => {
    if (!firebaseUser || isInitialLoad) return;
    const userId = firebaseUser.uid;
    const syncCycle = async () => {
      try {
        await setDoc(doc(db, 'users', userId, 'cycle', 'current'), cycle);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/cycle/current`);
      }
    };
    syncCycle();
  }, [cycle, firebaseUser, isInitialLoad]);

  // Sync Seed Changes
  useEffect(() => {
    if (!firebaseUser || !seed || isInitialLoad) return;
    const userId = firebaseUser.uid;
    const syncSeed = async () => {
      try {
        const seedId = new Date().toISOString().split('T')[0]; // One seed per day
        await setDoc(doc(db, 'users', userId, 'seeds', seedId), seed);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/seeds`);
      }
    };
    syncSeed();
  }, [seed, firebaseUser, isInitialLoad]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateCycle = (updates: Partial<CycleState>) => {
    setCycle(prev => ({ ...prev, ...updates }));
  };

  const updateExercises = (newExercises: Exercise[]) => {
    setWorkout(prev => ({ ...prev, exercises: newExercises }));
  };

  const saveWorkout = async () => {
    const completed: CompletedWorkout = {
      ...workout,
      isCompleted: true,
      date: new Date().toISOString(),
      phase: cycle.phase,
      day: cycle.currentDay
    };
    
    if (firebaseUser) {
      try {
        await addDoc(collection(db, 'users', firebaseUser.uid, 'workouts'), completed);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}/workouts`);
      }
    }

    setHistory(prev => [completed, ...prev]);
    setWorkout(prev => ({ ...prev, isCompleted: true }));
  };

  const nextDay = () => {
    setCycle(prev => {
      const nextDayNum = (prev.currentDay % 28) + 1;
      return {
        ...prev,
        currentDay: nextDayNum,
        phase: calculatePhase(nextDayNum)
      };
    });
    setSeed(null); 
  };

  const logout = () => signOut(auth);

  return (
    <AppContext.Provider value={{ 
      user, cycle, seed, workout, history, firebaseUser, isAuthReady,
      setSeed, setWorkout, updateExercises, saveWorkout, nextDay, updateUser, updateCycle, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
