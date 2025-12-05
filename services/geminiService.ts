import { GoogleGenAI, Type } from "@google/genai";
import { KnowledgeSnippet } from "../types";

// Initialize the client. 
// NOTE: In a real production app, API calls should go through a backend to protect the key.
// For this demo structure, we use process.env.API_KEY as requested.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured study plan based on the user's KB and the target Job Description.
 * Uses gemini-3-pro-preview for deep reasoning and organizing chaotic data.
 */
export const generateStudyPlan = async (
  role: string,
  jd: string,
  knowledgeBase: KnowledgeSnippet[]
): Promise<string> => {
  
  const kbContext = knowledgeBase.map(k => `--- Source: ${k.title} ---\n${k.content}`).join('\n\n');

  const prompt = `
    You are an expert technical career coach.
    
    TARGET ROLE: ${role}
    
    JOB DESCRIPTION (JD):
    ${jd}
    
    USER'S CHAOTIC KNOWLEDGE BASE (Notes/Materials):
    ${kbContext}
    
    TASK:
    Analyze the user's Knowledge Base against the Job Description. 
    Create a comprehensive, structured Study Plan and Preparation Guide.
    
    REQUIREMENTS:
    1. Identify gaps: What is in the JD that is NOT in the User's KB? Highlight these.
    2. Organize the KB: Structure the user's existing notes into logical interview topics.
    3. Curate content: Don't just list topics; summarize the key points from the KB relevant to the JD.
    4. Provide Case Study examples relevant to this role.
    5. Format the output in clean, readable Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a precise and structured educational assistant.",
        thinkingConfig: { thinkingBudget: 2048 } // Use thinking for better organization
      }
    });

    return response.text || "Failed to generate plan.";
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
};

/**
 * Chat with the agent. The agent has access to the KB and uses Google Search
 * to supplement answers where the KB is lacking.
 */
export const chatWithAgent = async (
  history: { role: 'user' | 'model'; parts: [{ text: string }] }[],
  currentMessage: string,
  knowledgeBase: KnowledgeSnippet[],
  contextRole: string
) => {
  
  // We inject the KB into the system instruction for the chat session
  const kbContext = knowledgeBase.map(k => `[${k.title}]: ${k.content}`).join('\n\n');
  
  const systemInstruction = `
    You are an interview preparation interviewer for the role of "${contextRole}".
    
    RESOURCE CONTEXT (User's Notes):
    ${kbContext}
    
    INSTRUCTIONS:
    1. Answer the user's questions or conduct a mock interview.
    2. PRIORITIZE information found in the "RESOURCE CONTEXT".
    3. If the answer is not in the context, use your 'googleSearch' tool to find up-to-date info.
    4. Be critical but encouraging. 
    5. If asked for a "Case Study", generate a relevant scenario based on the role.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash', // Fast for chat
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }] // Enable Grounding
    },
    history: history
  });

  return chat.sendMessageStream({ message: currentMessage });
};