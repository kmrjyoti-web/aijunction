import { Injectable, inject } from '@angular/core';
import { Type } from "@google/genai";
import { Column, ActiveFilter } from '../models/table-config.model';
import { AiClientService } from './ai-client.service';

export interface AiFilterRequest {
  globalSearch: string | null;
  advancedFilters: ActiveFilter[] | null;
}

export interface AiFilterResponse extends AiFilterRequest {
  aiResponse: string;
}


@Injectable({ providedIn: 'root' })
export class AiChatbotService {
  private ai = inject(AiClientService).ai;

  async generateFilterFromQuery(query: string, columns: Column[]): Promise<AiFilterResponse> {
    const availableColumns = columns.map(c => ({ name: c.name, code: c.code, type: c.columnType || 'TEXT' }));
    const prompt = `You are an AI assistant for a data table. Your task is to interpret the user's query and generate a JSON object with filtering instructions and a conversational response.
    1. If the query is a command to filter or search the data, generate the appropriate filter objects.
    2. If the query is a general question, set both 'globalSearch' and 'advancedFilters' to null and provide a helpful answer in 'aiResponse'.
    
    The JSON object must have these properties: 'globalSearch' (string | null), 'advancedFilters' (array of filter objects | null), and 'aiResponse' (string).
    - Use 'globalSearch' for general, non-specific text searches (e.g., names, companies).
    - Use 'advancedFilters' for specific, structured conditions.
    - 'globalSearch' and 'advancedFilters' should be mutually exclusive. Set one to a value and the other to null.
    
    FILTERING RULES:
    - Multiple Conditions: For queries with multiple conditions (e.g., "web leads with revenue over 1M"), provide an array of filter objects in 'advancedFilters'.
    - Date Queries: Interpret relative dates (e.g., 'last month', 'yesterday') and return them in YYYY-MM-DD format. Use the 'between' operator for date ranges.
    - Supported operators for numeric/text are: '=', '!=', '>', '<', '>=', '<=', 'contains', 'between'.

    Available columns for filtering: ${JSON.stringify(availableColumns)}
    
    User Query: "${query}"

    Example 1 (Global Search):
    Query: "find contacts at Innovate Inc."
    Response: { "globalSearch": "Innovate Inc.", "advancedFilters": null, "aiResponse": "Sure, I'm now showing contacts from Innovate Inc." }

    Example 2 (Structured Filter):
    Query: "show me who has more than 5M revenue"
    Response: { "globalSearch": null, "advancedFilters": [{ "code": "annual_revenue", "name": "Annual Revenue", "type": "numeric", "operator": ">", "value1": "5000000" }], "aiResponse": "Okay, I've filtered for contacts with annual revenue greater than 5,000,000." }
    
    Example 3 (Multiple Conditions):
    Query: "find web leads with revenue over 1 million"
    Response: { "globalSearch": null, "advancedFilters": [{ "code": "lead_source", "name": "Lead Source", "type": "select", "operator": "=", "value1": "Web" }, { "code": "annual_revenue", "name": "Annual Revenue", "type": "numeric", "operator": ">", "value1": "1000000" }], "aiResponse": "Filtering for web leads with revenue over 1M." }

    Example 4 (Date Range):
    Query: "show contacts created last month"
    Response: { "globalSearch": null, "advancedFilters": [{ "code": "created_time", "name": "Created", "type": "date", "operator": "between", "value1": "2024-07-01", "value2": "2024-07-31"}], "aiResponse": "Showing contacts created last month." }
    
    Example 5 (Question):
    Query: "how many contacts are there?"
    Response: { "globalSearch": null, "advancedFilters": null, "aiResponse": "I can't count the contacts, but I can help you filter them. For example, you can ask me to show contacts from a specific company." }
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
              globalSearch: { type: Type.STRING, nullable: true },
              advancedFilters: {
                type: Type.ARRAY,
                nullable: true,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        code: { type: Type.STRING },
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['numeric', 'text', 'date', 'select'] },
                        operator: { type: Type.STRING },
                        value1: { type: Type.STRING },
                        value2: { type: Type.STRING, nullable: true }
                    },
                    required: ['code', 'name', 'type', 'operator', 'value1']
                }
              },
              aiResponse: { type: Type.STRING }
          },
          required: ['globalSearch', 'advancedFilters', 'aiResponse']
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AiFilterResponse;
  }
}