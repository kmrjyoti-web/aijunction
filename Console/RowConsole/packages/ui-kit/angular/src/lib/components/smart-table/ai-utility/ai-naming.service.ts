import { Injectable, inject } from '@angular/core';
import { Type } from "@google/genai";
import { AiClientService } from './ai-client.service';

@Injectable({ providedIn: 'root' })
export class AiNamingService {
  private ai = inject(AiClientService).ai;

  async suggestCalendarViewName(dateFieldName: string): Promise<{name: string}> {
    const prompt = `You are a helpful assistant. Your task is to suggest a short, descriptive name for a saved calendar view in a data table. The view is based on a date field.

    Date Field Name: "${dateFieldName}"

    Respond with a JSON object containing a single key "name".

    Example 1:
    Date Field Name: "Created Time"
    Response: { "name": "Contacts by Creation Date" }

    Example 2:
    Date Field Name: "last_activity_date"
    Response: { "name": "Contacts by Last Activity" }
    
    Example 3:
    Date Field Name: "Subscription End Date"
    Response: { "name": "Subscription Expirations" }`;

    const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING }
                },
                required: ['name']
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  }
}
