
import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedFilterConfig, ActiveFilter, FilterDefinition, FilterOperator, DateOperator } from '../../../models/table-config.model';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSidebarComponent {
  isOpen = input.required<boolean>();
  config = input.required<AdvancedFilterConfig>();
  activeFilters = input.required<{ [key: string]: ActiveFilter }>();

  close = output<void>();
  apply = output<{ [key: string]: ActiveFilter }>();

  // Internal state for filters being edited
  localActiveFilters: WritableSignal<{ [key: string]: ActiveFilter }> = signal({});
  
  // State for managing dropdown visibility
  openDropdowns = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      // When the sidebar is opened, initialize its local state from the input
      if (this.isOpen()) {
        this.localActiveFilters.set(JSON.parse(JSON.stringify(this.activeFilters())));
      }
    });
  }

  toggleFilter(filterDef: FilterDefinition, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentFilters = { ...this.localActiveFilters() };

    if (isChecked) {
      if (!currentFilters[filterDef.code]) {
        currentFilters[filterDef.code] = {
          code: filterDef.code,
          name: filterDef.name,
          type: filterDef.type,
          operator: filterDef.defaultOperator || (filterDef.operators ? filterDef.operators[0] : (filterDef.dateOperators ? filterDef.dateOperators[0] : '=')),
          value1: filterDef.value || '',
          value2: filterDef.value2,
        };
      }
    } else {
      delete currentFilters[filterDef.code];
    }
    this.localActiveFilters.set(currentFilters);
  }

  updateFilterValue(code: string, whichValue: 'value1' | 'value2', event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.localActiveFilters.update(filters => {
      if (filters[code]) {
        filters[code][whichValue] = newValue;
      }
      return { ...filters };
    });
  }

  updateFilterOperator(code: string, operator: FilterOperator | DateOperator): void {
    this.localActiveFilters.update(filters => {
      if (filters[code]) {
        filters[code].operator = operator;
      }
      return { ...filters };
    });
    this.toggleDropdown(code);
  }

  applyFilters(): void {
    this.apply.emit(this.localActiveFilters());
  }

  clearFilters(): void {
    this.localActiveFilters.set({});
    this.apply.emit({});
  }

  toggleDropdown(code: string): void {
    this.openDropdowns.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  }

  closeAllDropdowns(): void {
    this.openDropdowns.set(new Set());
  }

  isDropdownOpen(code: string): boolean {
    return this.openDropdowns().has(code);
  }
}