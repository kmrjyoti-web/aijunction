import { Injectable, inject } from '@angular/core';
import { Column } from '../models/table-config.model';
import { Contact } from '../data-access/online-data.service';
import { AiClientService } from './ai-client.service';

@Injectable({ providedIn: 'root' })
export class AiSummaryService {
  private ai = inject(AiClientService).ai;

  async generateNarration(data: Contact[], columns: Column[]): Promise<string> {
    const columnNames = columns.map(c => c.name).join(', ');
    const prompt = `You are a data analyst. Based on the following JSON data representing contacts, provide a concise narrative summary. The data has the following columns: ${columnNames}. Highlight key trends, such as distribution of contacts or any notable patterns in annual revenue. Keep the summary to 3-4 sentences. Data: \n\n${JSON.stringify(data, null, 2)}`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async suggestInsights(data: Contact[], columns: Column[]): Promise<string> {
    const columnNames = columns.map(c => c.name).join(', ');
    const prompt = `You are a business intelligence analyst. Analyze this JSON contact data and suggest 3 key insights or important metrics a user should focus on. Present them as a bulleted list using markdown. The available data fields are: ${columnNames}. For example, suggest looking at the average revenue or which lead source is most common. Data: \n\n${JSON.stringify(data, null, 2)}`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async getQuickMetrics(data: Contact[], columns: Column[]): Promise<string> {
    const columnNames = columns.map(c => c.name).join(', ');
    const prompt = `You are a data analyst. Based on the following JSON contact data, identify the most insightful categorical column (like 'Lead Source', 'Country', or 'City') to perform a 'group by' and 'count' operation on. Then, provide the counts for each category in that column, ordered from highest to lowest count. Present the result in a clear, human-readable format with a title and use markdown for formatting. The available data fields are: ${columnNames}. Data: \n\n${JSON.stringify(data, null, 2)}`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async summarizeCalendarDay(contacts: Contact[]): Promise<string> {
    const prompt = `You are a helpful assistant. Summarize the following list of contacts that were created on a specific day. Mention the total number of new contacts and highlight any notable names or companies if there are fewer than 5 contacts. Keep the summary to 1-2 sentences. Data:\n\n${JSON.stringify(contacts.map(c => ({ name: c.contact_person, company: c.organization_name })), null, 2)}`;
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }
}
