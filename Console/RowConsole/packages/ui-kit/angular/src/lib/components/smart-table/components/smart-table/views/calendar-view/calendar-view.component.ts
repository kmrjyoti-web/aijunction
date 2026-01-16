import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../data-access/online-data.service';
import { Column } from '../../../../models/table-config.model';
import { AiSummaryService } from '../../../../ai-utility/ai-summary.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  contacts: Contact[];
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent {
  data = input.required<Contact[]>();
  columns = input.required<Column[]>();
  config = input.required<{ dateFieldCode: string }>();
  
  private aiSummaryService = inject(AiSummaryService);

  currentDate = signal(new Date());
  
  selectedDay = signal<CalendarDay | null>(null);
  aiSummary = signal<string | null>(null);
  isSummaryLoading = signal(false);

  dateFieldName = computed(() => {
    const code = this.config().dateFieldCode;
    const column = this.columns().find(c => c.code === code);
    return column ? column.name : this.config().dateFieldCode;
  });

  contactsByDate = computed(() => {
    const map = new Map<string, Contact[]>();
    const dateField = this.config().dateFieldCode;

    for (const contact of this.data()) {
      const dateValue = contact[dateField];
      if (dateValue && typeof dateValue === 'string') {
        const dateKey = new Date(dateValue).toISOString().split('T')[0];
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(contact);
      }
    }
    return map;
  });

  calendarGrid = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    const grid: CalendarDay[] = [];
    
    // Previous month's padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
      grid.push({ date: prevDate, isCurrentMonth: false, contacts: this.getContactsForDate(prevDate) });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      grid.push({ date: currDate, isCurrentMonth: true, contacts: this.getContactsForDate(currDate) });
    }

    // Next month's padding days
    const remaining = 42 - grid.length; // 6 weeks * 7 days
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(nextDate.getDate() + i);
      grid.push({ date: nextDate, isCurrentMonth: false, contacts: this.getContactsForDate(nextDate) });
    }
    
    return grid;
  });

  private getContactsForDate(date: Date): Contact[] {
    const dateKey = date.toISOString().split('T')[0];
    return this.contactsByDate().get(dateKey) || [];
  }
  
  async selectDay(day: CalendarDay) {
    if (day.contacts.length === 0) {
      this.selectedDay.set(null);
      return;
    }
    this.selectedDay.set(day);
    this.isSummaryLoading.set(true);
    this.aiSummary.set(null);
    try {
      const summary = await this.aiSummaryService.summarizeCalendarDay(day.contacts);
      this.aiSummary.set(summary);
    } catch(err) {
      console.error("Failed to get AI summary", err);
      this.aiSummary.set("Could not generate summary.");
    } finally {
      this.isSummaryLoading.set(false);
    }
  }
  
  changeMonth(delta: number): void {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  }
  
  goToToday(): void {
    this.currentDate.set(new Date());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}
