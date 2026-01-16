
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { FormFieldConfig } from '../models/form-schema.model';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  isAction?: boolean; // If true, this message performed a config update
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor() {
    // @ts-ignore
    this.apiKey = (import.meta.env && import.meta.env['VITE_API_KEY']) || '';

    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.warn('Google GenAI API Key not found. AI features will be disabled.');
      this.ai = {} as any;
    }
  }

  /**
   * Sends a message to the AI with the current component context.
   * The AI can reply with text OR a JSON object to update the component.
   */
  async sendMessage(
    userMessage: string,
    currentConfig: FormFieldConfig,
    controlType: string,
    history: ChatMessage[]
  ): Promise<{ text: string, newConfig?: FormFieldConfig }> {

    if (!this.apiKey) {
      return { text: "API Key missing. Please configure environment variables." };
    }

    const systemPrompt = `
      You are an Angular Component Expert and UI Designer.
      
      Current Context: User is looking at a "${controlType}" component.
      Current Configuration (JSON): ${JSON.stringify(currentConfig)}

      User Request: "${userMessage}"

      INSTRUCTIONS:
      1. If the user is asking a documentation question (e.g., "How do I use this?", "What is accessibility?"), answer helpfuly in plain text.
      2. If the user wants to CHANGE the component (e.g., "Make it red", "Add a required validator", "Change label to 'Email'"), you MUST return a valid JSON object representing the *updated* FormFieldConfig.
      3. If returning JSON, do NOT wrap it in markdown code blocks. Return RAW JSON only.
      4. If returning Text, just return the text.

      For styling updates, use the 'ui' property or 'props' property in the config. 
      For 'Make it red', you might add 'text-red-500' to the ui.input classes or ui.label classes.
    `;

    try {
      // We send a fresh request each time with history context manually constructed if needed, 
      // but for atomic updates, a single prompt with context is often more robust for config generation.
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt
      });

      const responseText = result.text?.trim() || '';

      // Attempt to parse as JSON (Action)
      if (responseText.startsWith('{') && responseText.endsWith('}')) {
        try {
          const newConfig = JSON.parse(responseText);
          return {
            text: `I've updated the ${controlType} configuration for you.`,
            newConfig: newConfig
          };
        } catch (e) {
          return { text: responseText }; // Fallback to text if JSON parse fails
        }
      }

      // Standard Text Response
      return { text: responseText };

    } catch (err) {
      console.error(err);
      return { text: "I encountered an error processing your request." };
    }
  }
}
