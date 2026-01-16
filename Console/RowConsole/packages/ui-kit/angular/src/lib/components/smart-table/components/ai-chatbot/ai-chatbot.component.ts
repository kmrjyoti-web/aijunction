import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../data-access/online-data.service';
import { Column, ActiveFilter } from '../../models/table-config.model';
import { AiChatbotService, AiFilterRequest } from '../../ai-utility/ai-chatbot.service';

interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatbotComponent {
  data = input.required<Contact[]>();
  columns = input.required<Column[]>();
  close = output<void>();
  filterApplied = output<AiFilterRequest>();

  private aiChatbotService = inject(AiChatbotService);
  
  messages = signal<Message[]>([
    { sender: 'system', text: 'Ask me anything or tell me how to filter the data.' }
  ]);
  isLoading = signal(false);
  
  chatInput = viewChild<ElementRef<HTMLInputElement>>('chatInput');

  async sendMessage(): Promise<void> {
    const inputEl = this.chatInput()?.nativeElement;
    if (!inputEl || !inputEl.value.trim() || this.isLoading()) {
      return;
    }
    
    const userQuery = inputEl.value.trim();
    inputEl.value = '';

    // Add user message to chat
    this.messages.update(msgs => [...msgs, { sender: 'user', text: userQuery }]);
    
    this.isLoading.set(true);

    try {
      const response = await this.aiChatbotService.generateFilterFromQuery(userQuery, this.columns());
      
      this.messages.update(msgs => [...msgs, { sender: 'ai', text: response.aiResponse }]);

      if (response.globalSearch || (response.advancedFilters && response.advancedFilters.length > 0)) {
        this.filterApplied.emit({
          globalSearch: response.globalSearch,
          advancedFilters: response.advancedFilters
        });
        setTimeout(() => this.close.emit(), 1000); // Close after a short delay
      }
    } catch (error) {
      console.error('Error querying AI:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      this.messages.update(msgs => [...msgs, { sender: 'system', text: errorMessage }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}