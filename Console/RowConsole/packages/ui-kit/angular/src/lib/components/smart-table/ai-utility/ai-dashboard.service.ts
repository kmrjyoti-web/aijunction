import { Injectable, inject } from '@angular/core';
import { Type } from "@google/genai";
import { Column } from '../models/table-config.model';
import { Contact } from '../data-access/online-data.service';
import { AiClientService } from './ai-client.service';

export interface BiDashboard {
    kpis: Array<{ title: string; value: string; change?: string }>;
    charts: Array<{ type: 'bar'; title: string; data: Array<{ label: string; value: number }> }>;
    insights: string[];
}

@Injectable({ providedIn: 'root' })
export class AiDashboardService {
  private ai = inject(AiClientService).ai;

  async generateBiDashboard(data: Contact[], columns: Column[]): Promise<BiDashboard> {
    const columnNames = columns.map(c => c.name).join(', ');
    const prompt = `You are a business intelligence analyst. Analyze the following JSON contact data and generate a JSON object for a dashboard. The data fields are: ${columnNames}.
    The JSON object must contain three properties: 'kpis', 'charts', and 'insights'.
    1. 'kpis': An array of 2-3 key performance indicators. Each KPI object should have a 'title' (e.g., "Total Revenue") and a 'value' (e.g., "$1.2M").
    2. 'charts': An array containing one chart object. This object must have 'type' set to 'bar', a 'title' (e.g., "Contacts by Lead Source"), and 'data' which is an array of objects, each with a 'label' and 'value'. Choose the most relevant categorical field for the chart.
    3. 'insights': An array of 2-3 brief, actionable insights in plain text.
    Data: \n\n${JSON.stringify(data, null, 2)}`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING, nullable: true },
                },
                required: ['title', 'value'],
              },
            },
            charts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  data: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                      },
                      required: ['label', 'value'],
                    },
                  },
                },
                required: ['type', 'title', 'data'],
              },
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['kpis', 'charts', 'insights'],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as BiDashboard;
  }
}
