import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column, ActiveFilter } from '../../../models/table-config.model';
import { Contact } from '../../../data-access/online-data.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-excel-filter',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './excel-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExcelFilterComponent {
  column = input.required<Column>();
  data = input.required<Contact[]>();
  activeFilter = input<ActiveFilter | null>();

  showColorFilter = input(false);
  colorResolver = input<(row: any) => string | undefined>();
  position = input<{ x: number, y: number } | null>(null);

  apply = output<{ filter?: ActiveFilter | null, sort?: { column: string, direction: 'asc' | 'desc' } }>();
  close = output<void>();

  // Text filter state
  searchTerm = signal('');
  selectedValues = signal<Set<string>>(new Set());
  selectedColors = signal<Set<string>>(new Set());

  // Calendar filter state
  currentMonth = signal(new Date());
  rangeStart = signal<Date | null>(null);
  rangeEnd = signal<Date | null>(null);

  // Submenu state
  showColorSubmenu = signal(false);

  uniqueValues = computed(() => {
    const colCode = this.column().code;
    const values = this.data()
      .map(item => String(item[colCode] ?? ''))
      .filter(value => value.trim() !== '');
    return [...new Set(values)].sort();
  });

  uniqueColors = computed(() => {
    try {
      const resolver = this.colorResolver();
      const show = this.showColorFilter();
      console.log('[ExcelFilter] uniqueColors calc. Show:', show, 'HasResolver:', !!resolver);

      if (!resolver || !show) return [];

      const colors = this.data()
        .map(row => resolver(row) ?? '__NO_FILL__'); // Use special token for no color

      const unique = [...new Set(colors)].sort();
      console.log('[ExcelFilter] Found colors:', unique);
      return unique;
    } catch (e) {
      console.error('[ExcelFilter] Error computing uniqueColors:', e);
      return [];
    }
  });

  filteredValues = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.uniqueValues();
    }
    return this.uniqueValues().filter(val => val.toLowerCase().includes(term));
  });

  isAllSelected = computed(() => {
    const filtered = this.filteredValues();
    if (filtered.length === 0) return false;
    return filtered.every(val => this.selectedValues().has(val));
  });

  calendarGrid = computed<CalendarDay[]>(() => {
    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const grid: CalendarDay[] = [];

    // Previous month's padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
      grid.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      grid.push({ date: currDate, isCurrentMonth: true });
    }

    // Next month's padding days (ensure grid has 42 cells for 6 weeks)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(nextDate.getDate() + i);
      grid.push({ date: nextDate, isCurrentMonth: false });
    }

    return grid;
  });

  constructor() {
    effect(() => {
      const col = this.column();
      const active = this.activeFilter();

      if (col.columnType === 'DATE') {
        if (active && (active.operator === '=' || active.operator === 'between')) {
          this.rangeStart.set(active.value1 ? new Date(active.value1 + 'T00:00:00') : null);
          this.rangeEnd.set(active.value2 ? new Date(active.value2 + 'T00:00:00') : null);
          if (active.value1) {
            this.currentMonth.set(new Date(active.value1 + 'T00:00:00'));
          }
        } else {
          this.resetDateSelection();
        }
      } else if (active && active.operator === 'contains' && active.type === 'select' && active.value2 === 'color') {
        // Handle color filter restoration
        if (active.value1) {
          const colors = String(active.value1).split(',');
          this.selectedColors.set(new Set(colors));
        }
      } else {
        const allValues = this.uniqueValues();
        if (active && active.value1 && active.operator !== 'contains') {
          const values = String(active.value1).split(',');
          this.selectedValues.set(new Set(values));
        } else {
          this.selectedValues.set(new Set(allValues));
          this.selectedColors.set(new Set()); // Clear colors if text filter active or none
        }
      }
    }, { allowSignalWrites: true });
  }

  toggleSelectAll(): void {
    const allSelected = this.isAllSelected();
    const filtered = this.filteredValues();
    this.selectedValues.update(currentSelected => {
      const newSelected = new Set(currentSelected);
      if (allSelected) {
        filtered.forEach(val => newSelected.delete(val));
      } else {
        filtered.forEach(val => newSelected.add(val));
      }
      return newSelected;
    });
  }

  toggleValue(value: string): void {
    this.selectedValues.update(currentSelected => {
      const newSelected = new Set(currentSelected);
      if (newSelected.has(value)) {
        newSelected.delete(value);
      } else {
        newSelected.add(value);
      }
      return newSelected;
    });
  }

  toggleColor(color: string): void {
    // For now, let's support single color selection or multi-select? 
    // Excel usually does one color or "No Fill". Let's support multi for flexibility but maybe UI implies single.
    // Let's go with multi-select logic like values.
    this.selectedColors.update(current => {
      const newSet = new Set(current);
      if (newSet.has(color)) newSet.delete(color);
      else newSet.add(color);
      return newSet;
    });
    // If we are filtering by color, we should probably clear value selection? 
    // Or can they coexist? Usually mutually exclusive in Excel "Filter by Color" vs "Filter by Value".
    // Let's enforce mutual exclusivity for simplicity: selecting a color clears values.
    if (this.selectedColors().size > 0) {
      // this.selectedValues.set(new Set()); // Optional: clear values
    }
  }

  handleApply(): void {
    if (this.column().columnType === 'DATE') {
      const start = this.rangeStart();
      let end = this.rangeEnd();

      if (start && end && end < start) {
        // Swap if end is before start
        const temp = start;
        this.rangeStart.set(end);
        this.rangeEnd.set(temp);
        end = temp;
      }

      if (start && end) { // Range selected
        const newFilter: ActiveFilter = {
          code: this.column().code, name: this.column().name, type: 'date',
          operator: 'between',
          value1: start.toISOString().split('T')[0],
          value2: end.toISOString().split('T')[0],
        };
        this.apply.emit({ filter: newFilter });
      } else if (start) { // Single date selected
        const newFilter: ActiveFilter = {
          code: this.column().code, name: this.column().name, type: 'date',
          operator: '=',
          value1: start.toISOString().split('T')[0],
        };
        this.apply.emit({ filter: newFilter });
      } else {
        this.apply.emit({ filter: null });
      }
    } else {
      // Check for color filter first
      const colors = Array.from(this.selectedColors());
      if (colors.length > 0) {
        const newFilter: ActiveFilter = {
          code: this.column().code,
          name: this.column().name,
          type: 'select',
          operator: 'contains', // Using 'contains' as a proxy for "IN" or custom logic
          value1: colors.join(','),
          value2: 'color' // Marker to indicate this is a color filter
        };
        this.apply.emit({ filter: newFilter });
        return;
      }

      const selected = Array.from(this.selectedValues());
      const allUnique = this.uniqueValues();
      if (selected.length === 0 || selected.length === allUnique.length) {
        this.apply.emit({ filter: null });
      } else {
        const newFilter: ActiveFilter = {
          code: this.column().code, name: this.column().name, type: 'select',
          operator: '=', value1: selected.join(','),
        };
        this.apply.emit({ filter: newFilter });
      }
    }
  }

  handleClear(): void {
    if (this.column().columnType === 'DATE') {
      this.resetDateSelection();
    } else {
      this.selectedValues.set(new Set());
      this.selectedColors.set(new Set());
      this.searchTerm.set('');
    }
    this.apply.emit({ filter: null });
  }

  handleSort(direction: 'asc' | 'desc'): void {
    this.apply.emit({ sort: { column: this.column().code, direction } });
  }

  // --- Calendar Specific Methods ---

  selectDate(date: Date): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();

    if (!start || end) {
      // Start new selection
      this.rangeStart.set(date);
      this.rangeEnd.set(null);
    } else {
      // Complete the range
      this.rangeEnd.set(date);
    }
  }

  changeMonth(delta: number): void {
    this.currentMonth.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  }

  isDateInRange(date: Date): boolean {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    if (!start) return false;
    if (end) {
      const min = start < end ? start : end;
      const max = start < end ? end : start;
      return date >= min && date <= max;
    }
    return date.getTime() === start.getTime();
  }

  isRangeStart(date: Date): boolean {
    return this.rangeStart()?.getTime() === date.getTime();
  }

  isRangeEnd(date: Date): boolean {
    return this.rangeEnd()?.getTime() === date.getTime();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  private resetDateSelection(): void {
    this.rangeStart.set(null);
    this.rangeEnd.set(null);
    this.currentMonth.set(new Date());
  }
  @HostListener('keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}