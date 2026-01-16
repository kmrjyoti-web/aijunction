import { Injectable, inject } from '@angular/core';
import { Type } from "@google/genai";
import { TableConfig, Column } from '../models/table-config.model';
import { LayoutTargetView } from '../models/custom-layout.model';
import { AiClientService } from './ai-client.service';

const columnSchema = {
    type: Type.OBJECT,
    properties: {
        index: { type: Type.NUMBER },
        name: { type: Type.STRING },
        code: { type: Type.STRING },
        display: { type: Type.STRING },
        columnType: { type: Type.STRING, nullable: true },
        width: { type: Type.STRING, nullable: true },
        align: { type: Type.STRING, nullable: true },
        sortable: { type: Type.BOOLEAN, nullable: true },
        filterable: { type: Type.BOOLEAN, nullable: true },
        cardHeader: { type: Type.BOOLEAN, nullable: true },
        cardHeader1: { type: Type.BOOLEAN, nullable: true },
        cardRow: { type: Type.BOOLEAN, nullable: true },
        listRow: { type: Type.BOOLEAN, nullable: true },
        showOnColumnChooser: { type: Type.BOOLEAN, nullable: true },
    },
    required: ['index', 'name', 'code', 'display']
};

@Injectable({ providedIn: 'root' })
export class AiLayoutService {
  private ai = inject(AiClientService).ai;

  async getAutoAdoptedConfig(currentConfig: TableConfig, screenWidth: number): Promise<TableConfig> {
    const prompt = `You are a UI/UX expert tasked with making a data table responsive. Given a screen width of ${screenWidth}px, adapt the following table configuration JSON to provide the best user experience. 
    For smaller screens (under 768px), you should: 
    1. Reduce 'cardsPerRow' to 1 or 2. 
    2. Hide less important columns in the table view by setting their 'display' property to 'none'. Keep essential columns like contact name and primary contact info visible.
    For medium screens (768px to 1280px), you can show more columns and set 'cardsPerRow' to 3 or 4.
    For large screens (above 1280px), most columns can be visible and 'cardsPerRow' can be 4 or more.
    Return the complete, modified JSON object that adheres to the provided schema. Original Config: \n\n${JSON.stringify(currentConfig, null, 2)}`;

    const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    config: {
                        type: Type.OBJECT,
                        properties: {
                           cardViewConfig: { 
                                type: Type.OBJECT, 
                                properties: { cardsPerRow: { type: Type.INTEGER } },
                                required: ['cardsPerRow'],
                                nullable: true 
                            },
                        }
                    },
                    columns: {
                        type: Type.ARRAY,
                        items: columnSchema
                    },
                },
                required: ['config', 'columns']
            },
        },
    });
    
    let jsonStr = response.text.trim();
    const partialConfig = JSON.parse(jsonStr);
    
    // Merge the AI's partial response back into the full configuration
    const newConfig = JSON.parse(JSON.stringify(currentConfig)); // Deep copy
    newConfig.config.cardViewConfig = partialConfig.config.cardViewConfig;
    newConfig.columns = partialConfig.columns;

    return newConfig;
  }

  async generateLayout(
    prompt: { html?: string; image?: { data: string; mimeType: string }; },
    targetView: LayoutTargetView,
    columns: Column[]
  ): Promise<{ htmlTemplate: string }> {
    const availableFields = columns.map(c => `\`${c.code}\` (${c.name})`).join(', ');

    let instruction = `You are an expert front-end developer specializing in Tailwind CSS. Your task is to create a single, self-contained HTML template for a ${targetView}.
The component must display data from the following available fields: ${availableFields}.
Use placeholders in the format \`{{ field_code }}\` to show where the data should go. For example, to display the organization's name, use \`{{ organization_name }}\`.

**Styling Rules:**
1.  **Use ONLY Tailwind CSS classes for styling.** Do not use inline styles or \`<style>\` tags.
2.  The design must be **fully responsive**.
3.  The design must support **dark mode** using \`dark:\` variants (e.g., \`bg-white dark:bg-gray-800\`).
4.  Ensure good contrast and accessibility.
5.  The final HTML should be a single block, like one \`<div>\` or one \`<li>\` that contains everything. For a 'table-row' target, you can use a \`<td>\` with a div inside it, and you must apply a colspan like \`<td colspan="100%">\`.

**Input:**
You will be given either a basic HTML structure or an image of a design. You must interpret this input and create a production-ready component from it.
`;
    
    const contents: any = { parts: [] };

    if (prompt.image) {
      instruction += '\n**Design Input (Image):** Create an HTML component based on the provided image.';
      contents.parts.push({ text: instruction });
      contents.parts.push({
        inlineData: {
          mimeType: prompt.image.mimeType,
          data: prompt.image.data,
        },
      });
    } else if (prompt.html) {
      instruction += `\n**Design Input (HTML):** Create an HTML component based on the following structure: \n\`\`\`html\n${prompt.html}\n\`\`\``;
      contents.parts.push({ text: instruction });
    } else {
        throw new Error("No prompt provided for layout generation.");
    }
    
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            htmlTemplate: { type: Type.STRING }
          },
          required: ['htmlTemplate']
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  }

  async suggestLayoutImprovements(
    htmlTemplate: string,
    screenWidth: number,
    density: string
  ): Promise<{ suggestions: string }> {
    const prompt = `You are a UI/UX expert specializing in responsive design with Tailwind CSS and dark mode.
    Analyze the following HTML template and suggest improvements.

    **Context:**
    - Screen Width: ${screenWidth}px
    - Data Density: ${density} (e.g., 'compact' means less space per item, 'comfortable' means more space)
    - The template is used to display a single item in a list or grid.
    - It must be responsive and support dark mode (using 'dark:' prefixes).

    **HTML Template:**
    \`\`\`html
    ${htmlTemplate}
    \`\`\`

    **Your Task:**
    Provide a bulleted list of 2-4 actionable suggestions using markdown to improve the layout's responsiveness, readability, and modern aesthetics for the given screen size and density. Focus on better use of space, typography, and component structure. The suggestions should be concise.

    Respond with a JSON object containing a single key "suggestions" which is a string containing the markdown-formatted bullet points.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: { type: Type.STRING },
          },
          required: ['suggestions'],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  }
}
