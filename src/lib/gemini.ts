import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { DailySeed, Exercise, Phase, UserProfile, TrainingPlan } from "../types";

const exerciseSwapFunction: FunctionDeclaration = {
  name: "suggestExercises",
  description: "Suggest alternative exercises based on a reason (e.g., pain, lack of equipment).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      alternatives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            why: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING }
          },
          required: ["name", "why", "sets", "reps"]
        },
        description: "List of 3 alternative exercises."
      }
    },
    required: ["alternatives"]
  }
};

const updateTrainingPlanFunction: FunctionDeclaration = {
  name: "updateTrainingPlan",
  description: "Update the user's weekly training split and schedule.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      split: { type: Type.STRING, enum: ['Full Body', 'Upper/Lower', 'ULUL', 'LUL'] },
      daysPerWeek: { type: Type.NUMBER },
      schedule: {
        type: Type.OBJECT,
        properties: {
          "1": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "2": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "3": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "4": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "5": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "6": { type: Type.STRING, enum: ['Workout', 'Rest'] },
          "7": { type: Type.STRING, enum: ['Workout', 'Rest'] }
        }
      },
      focus: { type: Type.STRING }
    },
    required: ["split", "daysPerWeek", "schedule", "focus"]
  }
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  private handleError(e: unknown, context: string) {
    console.error(`Gemini ${context} Error`, e);
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return "QUOTA_EXHAUSTED";
    }
    return null;
  }

  async generateTrainingPlan(user: UserProfile) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a science-backed weekly training split for a woman.
        Profile: Age ${user.age}, Experience: ${user.trainingExperience}, Goal: ${user.primaryGoal}.
        Availability: ${user.daysPerWeek} days/week, ${user.workoutDuration} min/session.
        Focus Areas: ${user.focusAreas.join(', ')}.
        Endocrinology: Contraception: ${user.contraception}, Cycle: ${user.cycleRegularity}.
        
        Return JSON format with 'split' (Full Body, Upper/Lower, ULUL, or LUL), 'daysPerWeek' (${user.daysPerWeek}), 'schedule' (Record of day number 1-7 to 'Workout' or 'Rest'), and 'focus' (brief description of training methodology based on their focus areas).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              split: { type: Type.STRING, enum: ['Full Body', 'Upper/Lower', 'ULUL', 'LUL'] },
              daysPerWeek: { type: Type.NUMBER },
              schedule: {
                type: Type.OBJECT,
                properties: {
                  "1": { type: Type.STRING },
                  "2": { type: Type.STRING },
                  "3": { type: Type.STRING },
                  "4": { type: Type.STRING },
                  "5": { type: Type.STRING },
                  "6": { type: Type.STRING },
                  "7": { type: Type.STRING }
                }
              },
              focus: { type: Type.STRING }
            },
            required: ['split', 'daysPerWeek', 'schedule', 'focus']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      const err = this.handleError(e, "Onboarding");
      return err === "QUOTA_EXHAUSTED" ? "QUOTA_EXHAUSTED" : null;
    }
  }

  async generateDailyBriefing(day: number, phase: Phase, seed: DailySeed, user: UserProfile) {
    try {
      const dayOfWeek = ((day - 1) % 7) + 1;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Today is ${phase} Day ${day} (Day ${dayOfWeek} of their weekly schedule).
        Training Split: ${user.trainingPlan?.split}. Scheduled: ${user.trainingPlan?.schedule[dayOfWeek as 1]}.
        Morning Seed Data: Energy ${seed.energyScore}/5, Mood ${seed.moodScore}/5, Symptoms: ${seed.symptoms.join(', ')}.
        
        Generate a personalized daily briefing in JSON.
        If scheduled for Rest, you can still suggest light movement (yoga/walking) if energy is high, or complete rest if low.
        If scheduled for Workout, provide specific exercises matching their split (${user.trainingPlan?.split}).
        
        Adjust intensity based on phase:
        Menstrual: Reduce volume, focus on stillness/form.
        Ovulatory: Increase intensity, suggest PR attempts.
        Luteal: Moderate intensity, focus on metabolic health/steady state.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_rest_day: { type: Type.BOOLEAN },
              briefing_text: { type: Type.STRING },
              nutrition_tip: { type: Type.STRING },
              science_citation: { type: Type.STRING },
              modified_exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    why: { type: Type.STRING }
                  }
                }
              }
            },
            required: ['briefing_text', 'nutrition_tip', 'science_citation', 'modified_exercises', 'is_rest_day']
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      const err = this.handleError(e, "Briefing");
      return err === "QUOTA_EXHAUSTED" ? "QUOTA_EXHAUSTED" : null;
    }
  }

  async getExerciseSwap(exercise: Exercise, reason: string): Promise<Exercise[] | "QUOTA_EXHAUSTED"> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user wants to swap the exercise "${exercise.name}" (Current focus: ${exercise.why}). 
        Reason for swap: "${reason}". 
        Suggest 3 alternative exercises that maintain the training intent but respect the reason for the swap.`,
        config: {
          tools: [{ functionDeclarations: [exerciseSwapFunction] }]
        }
      });

      const call = response.functionCalls?.[0];
      if (call && call.name === "suggestExercises") {
        const args = call.args as { alternatives: Exercise[] };
        return args.alternatives;
      }
      return [];
    } catch (e) {
      const err = this.handleError(e, "Swap");
      return err === "QUOTA_EXHAUSTED" ? "QUOTA_EXHAUSTED" : [];
    }
  }

  async chatWithLumina(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string, user: UserProfile) {
    try {
      const chat = this.ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are Lumina, a world-class strength coach specializing in female physiology. 
          The user is currently on a ${user.trainingPlan?.split} split with a goal of ${user.primaryGoal}.
          You interpret menstrual cycle data and daily readiness scores to adapt training programs. 
          Your tone is supportive, scientific, and concise. Always provide a 'Why' based on hypertrophy or hormonal research.
          You can suggest changes to their Training Split if they ask or if their goals shift.
          If they request a change to their split, days, or schedule, use the updateTrainingPlan tool.`,
          tools: [{ functionDeclarations: [updateTrainingPlanFunction] }]
        },
        history: history
      });

      const response = await chat.sendMessage({ message });
      
      const call = response.functionCalls?.[0];
      if (call && call.name === "updateTrainingPlan") {
        return {
          text: response.text || "I've updated your training plan as requested.",
          newPlan: call.args as unknown as TrainingPlan
        };
      }

      return { text: response.text };
    } catch (e) {
      const err = this.handleError(e, "Chat");
      return { 
        text: err === "QUOTA_EXHAUSTED" 
          ? "I've reached my message limit for the moment. Please try again in a few minutes." 
          : "I'm having trouble connecting to my knowledge base. How can I help you today?" 
      };
    }
  }

  async generateCustomWorkout(type: string, duration: number, intensity: string, user: UserProfile) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a custom science-backed workout.
        Type: ${type}, Duration: ${duration} minutes, Intensity: ${intensity}.
        User Profile: Age ${user.age}, Goal: ${user.primaryGoal}, Current Split: ${user.trainingPlan?.split}.
        
        Provide the response in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing_text: { type: Type.STRING },
              nutrition_tip: { type: Type.STRING },
              science_citation: { type: Type.STRING },
              is_rest_day: { type: Type.BOOLEAN },
              modified_exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["id", "name", "sets", "reps", "why"]
                }
              }
            },
            required: ["briefing_text", "nutrition_tip", "science_citation", "modified_exercises", "is_rest_day"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      const err = this.handleError(e, "CustomWorkout");
      return err === "QUOTA_EXHAUSTED" ? "QUOTA_EXHAUSTED" : null;
    }
  }
}

export const geminiService = new GeminiService();
