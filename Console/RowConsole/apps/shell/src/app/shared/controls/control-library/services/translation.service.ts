
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private ai: GoogleGenAI;

  constructor() {
    // @ts-ignore
    const apiKey = (import.meta.env && import.meta.env['VITE_API_KEY']) || '';
    // Fallback or specific environment handling can be added here
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('Google GenAI API Key not found. AI features will be disabled.');
      // Mock AI or handle gracefully
      this.ai = {} as any;
    }
  }

  async transliterate(text: string, language: string): Promise<string> {
    if (!text || !text.trim()) return text;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          Transliterate the following text into ${language} script.
          The input text is in English characters (phonetic/Hinglish).
          
          Rules:
          1. Return ONLY the transliterated text.
          2. Do NOT translate the meaning, just transliterate the script (e.g. "Namaste" -> "नमस्ते").
          3. If the input contains HTML tags, PRESERVE them exactly as they are. Only transliterate the content between tags.
          4. Do not include markdown code blocks.
          
          Input:
          ${text}
        `
      });
      return response.text?.trim() || text;
    } catch (err) {
      console.error('Transliteration error', err);
      return text;
    }
  }
}
