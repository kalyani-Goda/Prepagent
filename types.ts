import { Type } from "@google/genai";

export interface KnowledgeSnippet {
  id: string;
  title: string;
  content: string;
  dateAdded: number;
}

export enum AgentMode {
  MANAGE_KB = 'MANAGE_KB',
  STUDY_PLANNER = 'STUDY_PLANNER',
  MOCK_INTERVIEW = 'MOCK_INTERVIEW'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Array<{
    uri: string;
    title: string;
  }>;
  isThinking?: boolean;
}

export interface StudyPlan {
  role: string;
  jobDescription: string;
  generatedPlan: string;
}

// Schemas for Gemini Structured Output
export const StudyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    markdownContent: {
      type: Type.STRING,
      description: "The full formatted markdown of the study plan."
    },
    keyTopics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of critical topics extracted from JD and KB."
    }
  },
  required: ["markdownContent", "keyTopics"]
};