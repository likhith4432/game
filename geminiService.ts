
import { GoogleGenAI, Type } from "@google/genai";
import { GameTheme } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const GAME_CONFIG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    worldName: { type: Type.STRING, description: "A catchy name for the game world." },
    description: { type: Type.STRING, description: "A brief description of the environment." },
    colors: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, description: "Hex color for main elements." },
        secondary: { type: Type.STRING, description: "Hex color for ground/paths." },
        background: { type: Type.STRING, description: "Hex color for the sky/background." },
        accent: { type: Type.STRING, description: "Vibrant accent hex color." },
      },
      required: ["primary", "secondary", "background", "accent"]
    },
    character: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        emoji: { type: Type.STRING, description: "A single emoji representing the player." },
        description: { type: Type.STRING },
      },
      required: ["name", "emoji", "description"]
    },
    obstacles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          emoji: { type: Type.STRING },
          behavior: { type: Type.STRING, enum: ["static", "moving"] },
          type: { type: Type.STRING, enum: ["jump", "slide", "dodge"], description: "jump means a low barrier, slide means a high overhead obstacle, dodge means a tall wall." },
        },
        required: ["name", "emoji", "behavior", "type"]
      }
    },
    collectibles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          emoji: { type: Type.STRING },
          points: { type: Type.NUMBER },
        },
        required: ["name", "emoji", "points"]
      }
    }
  },
  required: ["worldName", "description", "colors", "character", "obstacles", "collectibles"]
};

export async function generateGameFromPrompt(prompt: string): Promise<GameTheme> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a comprehensive Subway Surfers style game configuration based on this theme: "${prompt}". 
    The configuration must include a consistent color palette, a character emoji, and three types of obstacles:
    1. 'jump': A low barrier the player can leap over.
    2. 'slide': A high obstacle (like a bar or tunnel) the player must slide under.
    3. 'dodge': A tall wall or block that cannot be jumped or slid under.
    Be creative! If the prompt is 'Pizza Shop', obstacles could be spilled sauce, hanging pans, and pizza ovens.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: GAME_CONFIG_SCHEMA,
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Game generation failed. Please try a different prompt.");
  }
}
