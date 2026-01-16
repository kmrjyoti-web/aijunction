import { Injectable, inject } from '@angular/core';
import { Type } from "@google/genai";
import { Column } from '../models/table-config.model';
import { AiClientService } from './ai-client.service';
import { Chip } from '../models/chip.model';

@Injectable({ providedIn: 'root' })
export class AiChipGeneratorService {
  private ai = inject(AiClientService).ai;

  async generateChipConfig(prompt: string, columns: Column[]): Promise<Omit<Chip, 'id'>> {
    const availableColumns = columns.map(c => ({ name: c.name, code: c.code, type: c.columnType || 'TEXT' }));

    const systemInstruction = `You are an AI assistant that creates configuration for summary "chips" based on user requests.
    Analyze the user's prompt and determine the correct column, aggregation method, and label.
    - For requests to count specific categories (e.g., "count web leads"), use the 'count' aggregation and specify the 'filterValue'. The label should reflect this, like "Web Leads".
    - For requests to summarize a numeric column (e.g., "total revenue"), use 'sum' or 'average' and do not provide a 'filterValue'. The label should be "Total Revenue".
    - If the user just says "show revenue", assume they mean 'sum'.
    - If the user just says "count contacts", use 'count' on the primary key 'organization_id' and label it "Total Contacts".
    
    Respond with a single JSON object.

    Available columns: ${JSON.stringify(availableColumns)}
    `;

    const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    columnCode: { type: Type.STRING },
                    aggregation: { type: Type.STRING, enum: ['count', 'sum', 'average'] },
                    filterValue: { type: Type.STRING, nullable: true },
                },
                required: ['label', 'columnCode', 'aggregation']
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Omit<Chip, 'id'>;
  }
}
