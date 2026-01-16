
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { FormSchema } from '../models/form-schema.model';

@Injectable({
  providedIn: 'root'
})
export class SchemaGeneratorService {
  
  private apiKey: string; 
  private ai: GoogleGenAI;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' && process.env && process.env['API_KEY']) || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  /**
   * Generates a FormSchema JSON from a single base64 encoded image string.
   */
  async generateFromImage(base64Image: string, mimeType: string = 'image/png'): Promise<FormSchema> {
    return this.generateFromImages([{ data: base64Image, mimeType }]);
  }

  /**
   * Generates a FormSchema from multiple images (e.g., for Tabbed views).
   */
  async generateFromImages(images: { data: string, mimeType: string }[]): Promise<FormSchema> {
    if (!this.apiKey) {
      console.warn('API Key is missing. Returning mock schema for demo.');
      return this.getMockSchema();
    }

    const isTabbed = images.length > 1;

    // Prepare content parts for Gemini (Images + Prompt)
    const contentParts: any[] = images.map(img => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data
      }
    }));

    const prompt = `
      You are an expert UI/UX engineer. Analyze the provided ${images.length} screenshot(s) of a form application and generate a JSON Schema.

      CONTEXT:
      ${isTabbed 
        ? 'These images represent a multi-tab form. The first image likely contains the "Common Header" (fields visible across all tabs) and the first tab. Subsequent images represent other tabs.' 
        : 'This is a single-page form.'
      }

      INSTRUCTIONS:
      1. Structure the JSON with a "layout" property ("standard" or "tabs").
      2. If "layout" is "tabs":
         - Extract fields that appear to be in the shared header (e.g., Party Name, ID) into the root "rows" array.
         - Extract fields specific to a tab into the "tabs" array. Each tab must have an "id", "label", and its own "rows".
      3. If "layout" is "standard":
         - Put all fields into the root "rows" array. Leave "tabs" undefined or empty.
      
      JSON STRUCTURE:
      {
        "title": "Inferred Title",
        "description": "Short description",
        "layout": "${isTabbed ? 'tabs' : 'standard'}",
        "rows": [ 
          // Common Header fields (if tabs) OR All fields (if standard)
          { 
            "columns": [ 
              { 
                "span": "col-span-12 md:col-span-6", 
                "field": { 
                  "key": "camelCaseKey", 
                  "type": "text | select | date | number | checkbox | radio-group", 
                  "label": "Visible Label"
                } 
              } 
            ] 
          } 
        ],
        "tabs": [
          { "id": "tab1", "label": "Tab Name", "rows": [ ... ] }
        ]
      }

      RULES:
      - Infer the best control 'type' based on visual cues (e.g., dropdown arrow -> select, calendar icon -> date).
      - Return ONLY raw valid JSON. No markdown code fences.
    `;

    contentParts.push({ text: prompt });

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          role: 'user',
          parts: contentParts
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      return JSON.parse(text) as FormSchema;
    } catch (e) {
      console.error('AI Generation Failed', e);
      return this.getMockSchema();
    }
  }

  /**
   * Generates a FormSchema from an HTML string snippet.
   */
  async generateFromHtml(htmlSnippet: string): Promise<FormSchema> {
    if (!this.apiKey) {
       console.warn('No API Key found. Returning mock schema.');
       return this.getMockSchema();
    }

    const prompt = `
      Parse this HTML form snippet and convert it into a JSON schema for my dynamic form library.
      
      HTML Snippet:
      ${htmlSnippet}

      Output JSON format:
      {
        "title": "Inferred Title",
        "layout": "standard",
        "rows": [ { "columns": [ { "span": "col-span-12", "field": { "key": "...", "type": "text", "label": "..." } } ] } ]
      }
      
      Map input types correctly. Do not include markdown code fences.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text || '{}') as FormSchema;
    } catch (e) {
      console.error('AI Generation Failed', e);
      return this.getMockSchema();
    }
  }

  private getMockSchema(): FormSchema {
    return {
      title: 'Generated Form (Fallback)',
      description: 'AI generation failed or API Key missing. This is a fallback schema.',
      layout: 'standard',
      rows: [
        { 
          columns: [
            { 
              span: 'col-span-12 md:col-span-6', 
              field: { 
                key: 'firstName', 
                type: 'text', 
                label: 'First Name',
                placeholder: 'John'
              } 
            },
            { 
              span: 'col-span-12 md:col-span-6', 
              field: { 
                key: 'lastName', 
                type: 'text', 
                label: 'Last Name',
                placeholder: 'Doe'
              } 
            }
          ] 
        }
      ]
    };
  }
}
