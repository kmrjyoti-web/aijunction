import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../../../models/table-config.model';
import { SavedCalendarView } from '../../../models/saved-calendar-view.model';
import { CalendarViewConfigService } from '../../../data-access/calendar-view-config.service';
import { AiNamingService } from '../../../ai-utility/ai-naming.service';

@Component({
  selector: 'app-calendar-config-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-config-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarConfigModalComponent {
  isOpen = input.required<boolean>();
  dateColumns = input.required<Column[]>();

  close = output<void>();
  apply = output<{ dateFieldCode: string }>();
  
  private calendarViewConfigService: CalendarViewConfigService = inject(CalendarViewConfigService);
  private aiNamingService: AiNamingService = inject(AiNamingService);

  savedViews = signal<SavedCalendarView[]>([]);
  selectedFieldCode = signal<string>('');
  newViewName = signal('');
  isSaving = signal(false);
  isSuggestingName = signal(false);

  canSave = computed(() => this.selectedFieldCode() && this.newViewName().trim().length > 0);

  constructor() {
    this.loadSavedViews();
  }

  loadSavedViews(): void {
    this.calendarViewConfigService.getSavedViews().subscribe(views => {
      this.savedViews.set(views);
    });
  }
  
  selectField(code: string): void {
    this.selectedFieldCode.set(code);
    this.newViewName.set(''); // Reset name when field changes
  }

  async suggestName(): Promise<void> {
    const code = this.selectedFieldCode();
    if (!code) return;
    
    const column = this.dateColumns().find(c => c.code === code);
    if (!column) return;

    this.isSuggestingName.set(true);
    try {
      const response = await this.aiNamingService.suggestCalendarViewName(column.name);
      this.newViewName.set(response.name);
    } catch (error) {
      console.error('Error suggesting name:', error);
      // Maybe show a toast notification here in a real app
    } finally {
      this.isSuggestingName.set(false);
    }
  }

  saveView(): void {
    if (!this.canSave()) return;
    
    this.isSaving.set(true);
    this.calendarViewConfigService.saveView(this.newViewName().trim(), this.selectedFieldCode()).subscribe(() => {
      this.loadSavedViews();
      this.newViewName.set('');
      this.isSaving.set(false);
    });
  }

  deleteView(id: string): void {
    this.calendarViewConfigService.deleteView(id).subscribe(() => {
      this.loadSavedViews();
    });
  }

  applyView(code: string): void {
    this.apply.emit({ dateFieldCode: code });
  }

  getDateFieldName(code: string): string {
    const column = this.dateColumns().find(c => c.code === code);
    return column ? column.name : code;
  }
}
