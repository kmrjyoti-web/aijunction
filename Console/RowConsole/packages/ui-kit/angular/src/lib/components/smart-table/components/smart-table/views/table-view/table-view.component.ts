import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Column, MaskConfig, RowMenuItem, ActiveFilter, FooterConfig, FooterColumn, RowActionItem, StyleConfig } from '../../../../models/table-config.model';
import { maskString as maskUtil } from '../../../../utils/masking.util';
import { getValidationState, ValidationState } from '../../../../utils/validation.util';
import { RowMenuComponent } from '../../row-menu/row-menu.component';
import { HeaderMenuComponent } from '../../header-menu/header-menu.component';
import { ClickOutsideDirective } from '../../../../directives/click-outside.directive';
import { Density } from '../../../../models/density.model';
import { ExcelFilterComponent } from '../../../shared/excel-filter/excel-filter.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, RowMenuComponent, HeaderMenuComponent, ClickOutsideDirective, DatePipe, ExcelFilterComponent],
  templateUrl: './table-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableViewComponent {
  columns = input.required<Column[]>();
  data = input.required<any[]>();
  sortColumn = input.required<string | null>();
  sortDirection = input.required<'asc' | 'desc'>();
  primaryKey = input('organization_id');
  density = input<Density>('cozy');
  densityClass = input('');
  rowMenuConfig = input.required<RowMenuItem[]>();
  rowActions = input<RowActionItem[] | undefined>();
  headerMenuConfig = input<RowMenuItem[] | undefined>();
  selectedIds = input(new Set<any>());
  enableMultiSelect = input(false);
  customTemplate = input<string | null>(null);
  loading = input<boolean>(false);
  keyboardActiveRowIndex = input<number | null>(null);
  pageSize = input(10);
  isInfiniteScroll = input(false);
  activeFilters = input<{ [key: string]: ActiveFilter }>();
  stripedRows = input<boolean>(true);
  showGridlines = input<boolean>(false);
  rowHover = input<boolean>(true);
  footerConfig = input<FooterConfig | undefined>();
  styleConfig = input<StyleConfig | undefined>();

  sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  rowAction = output<{ action: string; row: any }>();
  headerAction = output<{ action: string; selectedIds: any[] }>();
  selectionChange = output<Set<any>>();
  columnReorder = output<Column[]>();
  rowClicked = output<any>();
  filterChange = output<{ code: string, filter: ActiveFilter | null }>();

  private draggedColumnIndex = signal<number | null>(null);
  private dragOverIndex = signal<number | null>(null);
  private unmaskedCells = signal<Set<string>>(new Set());
  openMenuRowId = signal<any | null>(null);
  isHeaderMenuOpen = signal(false);
  contextMenuPosition = signal<{ x: number, y: number } | null>(null);

  openFilterMenuForColumn = signal<Column | null>(null);

  isAllSelectedOnPage = computed(() => {
    const pk = this.primaryKey();
    const pageIds = this.data().map(item => item[pk]);
    if (pageIds.length === 0) return false;
    return pageIds.every(id => this.selectedIds().has(id));
  });

  emptyRows = computed(() => {
    const size = this.pageSize();
    const dataLength = this.data().length;

    // Only add empty rows in paginator mode.
    if (this.isInfiniteScroll() || dataLength >= size) {
      return [];
    }

    const diff = size - dataLength;
    return Array(diff).fill(0);
  });

  columnOffsets = computed(() => {
    const allCols = this.columns();
    const offsets: (string | null)[] = new Array(allCols.length).fill(null);
    let runningOffset = 0;

    for (let i = 0; i < allCols.length; i++) {
      const col = allCols[i];
      if (col.frozen) {
        offsets[i] = `${runningOffset}px`;
        const width = col.width ? parseInt(col.width, 10) : 150;
        runningOffset += width;
      }
    }
    return offsets;
  });

  footerData = computed(() => {
    const config = this.footerConfig();
    const data = this.data();
    if (!config || !config.enabled || !config.columns || data.length === 0) {
      return null;
    }

    const results: { [key: string]: string } = {};
    const dataSize = data.length;

    const aggsByCode: { [key: string]: FooterColumn[] } = {};
    for (const col of config.columns) {
      if (!aggsByCode[col.code]) {
        aggsByCode[col.code] = [];
      }
      aggsByCode[col.code].push(col);
    }

    for (const code in aggsByCode) {
      const aggregations = aggsByCode[code];
      let sum = 0;
      let count = 0;

      const needsSumOrAvg = aggregations.some(a => a.aggregation === 'sum' || a.aggregation === 'avg');
      if (needsSumOrAvg) {
        for (const item of data) {
          const value = Number(item[code]);
          if (!isNaN(value)) {
            sum += value;
            count++;
          }
        }
      }

      const displayStrings: string[] = [];

      for (const agg of aggregations) {
        let value: number = 0;
        switch (agg.aggregation) {
          case 'count':
            value = dataSize;
            break;
          case 'sum':
            value = sum;
            break;
          case 'avg':
            value = count > 0 ? sum / count : 0;
            break;
        }

        let displayValue: string;
        if (agg.aggregation === 'sum' || agg.aggregation === 'avg') {
          displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        } else {
          displayValue = new Intl.NumberFormat('en-US').format(value);
        }

        displayStrings.push(agg.display.replace('{value}', displayValue));
      }

      results[code] = displayStrings.join('<br>');
    }

    return results;
  });

  onSort(columnCode: string) {
    if (!this.columns().find(c => c.code === columnCode)?.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (this.sortColumn() === columnCode && this.sortDirection() === 'asc') {
      direction = 'desc';
    }
    this.sortChange.emit({ column: columnCode, direction });
  }

  onRowClick(row: any): void {
    this.rowClicked.emit(row);
  }

  handleApplyExcelFilter(event: { filter?: ActiveFilter | null, sort?: { column: string, direction: 'asc' | 'desc' } }, columnCode: string): void {
    if (event.sort) {
      this.sortChange.emit(event.sort);
    }
    // Only emit filterChange if the 'filter' property exists on the event object.
    // This prevents sort actions from clearing filters.
    if (Object.prototype.hasOwnProperty.call(event, 'filter')) {
      this.filterChange.emit({ code: columnCode, filter: event.filter ?? null });
    }
    this.closeFilterMenu();
  }

  // --- Selection Logic ---
  toggleRowSelection(rowId: any): void {
    const newSelection = new Set(this.selectedIds());
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    this.selectionChange.emit(newSelection);
  }

  toggleSelectAll(): void {
    const allSelected = this.isAllSelectedOnPage();
    const newSelection = new Set(this.selectedIds());
    const pk = this.primaryKey();
    const pageIds = this.data().map(item => item[pk]);

    if (allSelected) {
      pageIds.forEach(id => newSelection.delete(id));
    } else {
      pageIds.forEach(id => newSelection.add(id));
    }
    this.selectionChange.emit(newSelection);
  }

  // --- Menu Logic ---
  onRowContextMenu(event: MouseEvent, row: any): void {
    // Select the row if not already selected. Right-clicking a new row selects it exclusively.
    // Use generic access for organization_id or prefer primaryKey
    // IMPORTANT: TableViewComponent needs primaryKey to access ID generally.
    // Assuming 'organization_id' is NOT generic. We need to use primaryKey input here.
    // However, in this file, we can use item[this.primaryKey()]
    const pk = this.primaryKey();
    if (!this.selectedIds().has(row[pk])) {
      this.selectionChange.emit(new Set([row[pk]]));
    }
    event.preventDefault();
    this.openMenuRowId.set(row[pk]);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
  }

  toggleRowMenu(event: MouseEvent, rowId: any): void {
    event.stopPropagation();
    this.contextMenuPosition.set(null);
    this.openMenuRowId.update(currentId => currentId === rowId ? null : rowId);
  }

  openFilterMenu(col: Column, event: MouseEvent): void {
    event.stopPropagation();
    this.openFilterMenuForColumn.set(col);
  }

  closeFilterMenu(): void {
    this.openFilterMenuForColumn.set(null);
  }

  closeRowMenu(): void {
    this.openMenuRowId.set(null);
    this.contextMenuPosition.set(null);
  }

  handleRowMenuAction(event: { action: string; row: any }): void {
    this.rowAction.emit(event);
    this.closeRowMenu();
  }

  handleHeaderMenuAction(action: string): void {
    this.headerAction.emit({ action, selectedIds: Array.from(this.selectedIds()) });
    this.isHeaderMenuOpen.set(false);
  }

  // --- Drag and Drop ---
  onDragStart(index: number): void {
    const columnType = this.columns()[index].columnType;
    if (columnType === 'CHECKBOX' || columnType === 'ACTION') {
      return;
    }
    this.draggedColumnIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(enterIndex: number): void {
    if (this.draggedColumnIndex() !== null && this.draggedColumnIndex() !== enterIndex) {
      this.dragOverIndex.set(enterIndex);
    }
  }

  onDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const draggedIndex = this.draggedColumnIndex();
    const targetColumn = this.columns()[dropIndex];

    if (targetColumn.columnType === 'CHECKBOX' || targetColumn.columnType === 'ACTION') {
      this.draggedColumnIndex.set(null);
      this.dragOverIndex.set(null);
      return;
    }

    if (draggedIndex === null || draggedIndex === dropIndex) {
      this.draggedColumnIndex.set(null);
      this.dragOverIndex.set(null);
      return;
    }

    const columns = [...this.columns()];
    const draggedItem = columns.splice(draggedIndex, 1)[0];
    columns.splice(dropIndex, 0, draggedItem);

    this.columnReorder.emit(columns);
    this.draggedColumnIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedColumnIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // --- Masking Logic ---
  isUnmasked(rowId: any, columnCode: string): boolean {
    const key = `${rowId}-${columnCode}`;
    return this.unmaskedCells().has(key);
  }

  toggleMask(rowId: any, columnCode: string): void {
    const key = `${rowId}-${columnCode}`;
    this.unmaskedCells.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }

  maskString(value: string, config: MaskConfig): string {
    return maskUtil(value, {
      visibleStart: config.visibleStart,
      visibleEnd: config.visibleEnd,
      maskChar: config.maskChar
    });
  }

  // --- Validation Logic ---
  getCellValidation(row: any, column: Column): ValidationState {
    const mainValidation = getValidationState(row[column.code], column, column.code);
    if (!mainValidation.isValid) return mainValidation;

    if (column.validations) {
      for (const validationRule of column.validations) {
        const validationResult = getValidationState(row[validationRule.code], column, validationRule.code);
        if (!validationResult.isValid) return validationResult;
      }
    }

    return { isValid: true, style: null };
  }

  isHexColor(value: string | undefined | null): boolean {
    if (!value) return false;
    return value.startsWith('#') || value.startsWith('rgb');
  }

  getCellClass(row: any, column: Column): string {
    const parts = [this.densityClass()];
    const val = this.getCellValidation(row, column);

    if (!val.isValid && val.style) {
      if (!this.isHexColor(val.style.bgcolor)) {
        parts.push(val.style.bgcolor || '');
      }
      if (!this.isHexColor(val.style.textcolor)) {
        parts.push(val.style.textcolor || '');
      }
    }
    return parts.filter(p => p && p.trim().length > 0).join(' ');
  }
}
