import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Column, RowActionItem, RowMenuItem, RowMenuSubItem, StyleConfig, ValidationConfig, FooterConfig, ActiveFilter, FooterColumn, MaskConfig } from '../../../../models/table-config.model';
import { maskString as maskUtil } from '../../../../utils/masking.util';
import { getValidationState, ValidationState } from '../../../../utils/validation.util';
import { RowMenuComponent } from '../../row-menu/row-menu.component';
import { HeaderMenuComponent } from '../../header-menu/header-menu.component';
import { Density } from '../../../../models/density.model';
import { ExcelFilterComponent } from '../../../shared/excel-filter/excel-filter.component';
import { TableSkeletonLoaderComponent } from './table-skeleton-loader.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, CdkMenuModule, OverlayModule, RowMenuComponent, HeaderMenuComponent, ExcelFilterComponent, ScrollingModule],
  templateUrl: './table-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-hidden' // Ensure host constrains height for virtual scroll
  }
})
export class TableViewComponent {
  data = input.required<any[]>();
  columns = input.required<Column[]>();
  primaryKey = input.required<string>();
  loading = input<boolean>(false);
  dataSource = computed(() => this.data()); // For virtual scroll, we just use the data array

  sortColumn = input.required<string | null>();
  sortDirection = input.required<'asc' | 'desc'>();
  density = input<Density>('cozy');
  densityClass = input('');
  rowMenuConfig = input.required<RowMenuItem[]>();
  rowActions = input<RowActionItem[] | undefined>();
  headerMenuConfig = input<RowMenuItem[] | undefined>();
  selectedIds = input(new Set<any>());
  enableMultiSelect = input(false);
  enableRowMenu = input(true);
  enableQuickActions = input(true);
  enableRowMenuIcons = input(true);
  customTemplate = input<string | null>(null);
  // loading = input<boolean>(false); // Duplicate removed
  keyboardActiveRowIndex = input<number | null>(null);
  pageSize = input(10);
  isInfiniteScroll = input(false);
  activeFilters = input<{ [key: string]: ActiveFilter }>();
  stripedRows = input<boolean>(true);
  showGridlines = input<boolean>(false);
  rowHover = input<boolean>(true);
  footerConfig = input<FooterConfig | undefined>();
  styleConfig = input<StyleConfig | undefined>();
  showFilterByColor = input<boolean>(false);

  sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  rowAction = output<{ action: string; row: any }>();
  headerAction = output<{ action: string; selectedIds: any[] }>();
  selectionChange = output<Set<any>>();
  columnReorder = output<Column[]>();
  columnResize = output<{ columnCode: string, width: string }>();
  columnVisibilityChange = output<string>(); // Emits code of column to hide
  rowClicked = output<any>();
  filterChange = output<{ code: string, filter: ActiveFilter | null }>();
  nextPage = output<void>();

  // Element Queries
  viewport = viewChild.required(CdkVirtualScrollViewport);
  headerContainer = viewChild<ElementRef<HTMLElement>>('headerContainer');
  footerContainer = viewChild<ElementRef<HTMLElement>>('footerContainer');

  scrollbarWidth = signal(0);

  // Resize State
  private resizeState = signal<{ index: number, startX: number, startWidth: number } | null>(null);
  columnWidths = signal<{ [code: string]: string }>({}); // Local overrides during resize

  constructor() {
    // Scroll Sync Effect & Scrollbar Width Calculation
    effect((onCleanup) => {
      const vp = this.viewport();
      const data = this.data(); // Trigger on data change to re-check scrollbar

      if (!vp) return;

      // Check scrollbar width
      const checkScrollbar = () => {
        const el = vp.elementRef.nativeElement;
        const width = el.offsetWidth - el.clientWidth;
        this.scrollbarWidth.set(width);
      };

      // Initial check and check after render
      setTimeout(checkScrollbar, 0);

      const sub = vp.elementScrolled().subscribe(() => {
        const offset = vp.elementRef.nativeElement.scrollLeft;
        const header = this.headerContainer()?.nativeElement;
        const footer = this.footerContainer()?.nativeElement;

        if (header) header.scrollLeft = offset;
        if (footer) footer.scrollLeft = offset;
      });

      onCleanup(() => sub.unsubscribe());
      onCleanup(() => sub.unsubscribe());
    });

    // Infinite Scroll Listener
    effect((onCleanup) => {
      const vp = this.viewport();
      if (!this.isInfiniteScroll() || !vp) return;

      const sub = vp.elementScrolled().subscribe(() => {
        const offset = vp.measureScrollOffset('bottom');
        // console.log('[TableView] Scroll offset bottom:', offset);
        if (offset < 50 && !this.loading()) { // Threshold 50px
          // console.log('[TableView] Reached bottom, emitting nextPage');
          this.nextPage.emit();
        }
      });

      onCleanup(() => sub.unsubscribe());
    });

    // Global Resize Listeners
    effect((onCleanup) => {
      if (this.resizeState()) {
        const moveHandler = (e: MouseEvent) => this.onResizing(e);
        const upHandler = () => this.onResizeEnd();

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection

        onCleanup(() => {
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        });
      }
    });

    // Initialize local widths from inputs when columns change, IF we want to strictly sync.
    // However, input 'columns' has the width. We use 'columnWidths' signal for live dragging overrides.
    effect(() => {
      const cols = this.columns();
      // We don't necessarily need to reset columnWidths here unless we want to clear overrides on external update.
      // For now, let's keep overrides if the column code matches.
    });
  }

  // ... (Existing properties) ...

  private draggedColumnIndex = signal<number | null>(null);
  private dragOverIndex = signal<number | null>(null);
  private unmaskedCells = signal<Set<string>>(new Set());
  openMenuRow = signal<any | null>(null);
  clickedColumnCode = signal<string | null>(null); // Track which column was clicked
  isHeaderMenuOpen = signal(false);
  contextMenuPosition = signal<{ x: number, y: number } | null>(null);

  // Dynamic Menu Configuration
  mergedRowMenuConfig = computed(() => {
    const baseConfig = this.rowMenuConfig();
    const colCode = this.clickedColumnCode();

    // Only add system actions if a column was clicked
    if (!colCode) return baseConfig;

    const systemActions: RowMenuItem[] = [
      {
        label: 'System Actions', // Group label (might affect display depending on implementation)
        items: [
          { label: 'Copy Cell Value', action: 'system:copy', icon: 'pi pi-copy' },
          { label: 'Filter by This Value', action: 'system:filter', icon: 'pi pi-filter' },
          { label: 'Hide This Column', action: 'system:hide', icon: 'pi pi-eye-slash' },
          // Separator visual might be handled by CSS or specific item type if supported.
          // For now, these are standard items.
        ]
      }
    ];

    // Prepend system actions. 
    // Note: If RowMenuComponent expects top-level items to be sections/groups, this works.
    // If it expects flat list, we might need a different approach. 
    // Looking at TableConfig, RowMenuItem has 'items', so it is a group/section.
    return [...systemActions, ...baseConfig];
  });

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
    const widthOverrides = this.columnWidths();

    const offsets: (string | null)[] = new Array(allCols.length).fill(null);
    let runningTotal = '0px';

    for (let i = 0; i < allCols.length; i++) {
      const col = allCols[i];
      if (col.frozen) {
        offsets[i] = runningTotal;
        // Use override if exists, else col.width, else default
        const colWidth = widthOverrides[col.code] ?? col.width ?? '150px';
        runningTotal = `calc(${runningTotal} + ${colWidth})`;
      }
    }
    return offsets;
  });

  // Helper to get effective width for template binding
  getColumnWidth(col: Column): string {
    return this.columnWidths()[col.code] ?? col.width ?? '150px';
  }

  // ... (footerData logic) ...

  // --- Resize Logic ---
  onResizeStart(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();

    // Only left click
    if (event.button !== 0) return;

    const col = this.columns()[index];
    const widthStr = this.columnWidths()[col.code] ?? col.width ?? '150px';
    const startWidth = parseInt(widthStr, 10) || 150; // naive parsing, robust enough for px

    this.resizeState.set({
      index,
      startX: event.clientX,
      startWidth
    });
  }

  onResizing(event: MouseEvent): void {
    const state = this.resizeState();
    if (!state) return;

    const delta = event.clientX - state.startX;
    const newWidth = Math.max(50, state.startWidth + delta); // Min width 50px

    const col = this.columns()[state.index];
    this.columnWidths.update(curr => ({
      ...curr,
      [col.code]: `${newWidth}px`
    }));
  }

  onResizeEnd(): void {
    const state = this.resizeState();
    if (state) {
      const col = this.columns()[state.index];
      const finalWidth = this.columnWidths()[col.code];

      this.columnResize.emit({
        columnCode: col.code,
        width: finalWidth
      });

      this.resizeState.set(null);
    }
  }

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
    // Prevent sort if resizing
    if (this.resizeState()) return;

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
  onRowContextMenu(event: MouseEvent, row: any, col?: Column): void {
    const pk = this.primaryKey();
    const rowId = row[pk];
    // console.log('[TableView] Context menu triggered for row:', rowId, 'Col:', col?.code);

    // Select the row if not already selected.
    if (!this.selectedIds().has(rowId)) {
      this.selectionChange.emit(new Set([rowId]));
    }

    event.preventDefault(); // Prevent browser context menu
    event.stopPropagation(); // Stop bubbling (important if nested)

    if (this.enableRowMenu()) {
      this.openMenuRow.set(row);
      this.clickedColumnCode.set(col?.code ?? null);
      this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
      // console.log('[TableView] Menu opened at:', { x: event.clientX, y: event.clientY });
    }
  }

  toggleRowMenu(event: MouseEvent, row: any): void {
    event.stopPropagation();
    if (this.openMenuRow() === row) {
      this.closeRowMenu();
    } else {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      this.contextMenuPosition.set({
        x: rect.right - 224,
        y: rect.bottom + 5
      });
      this.openMenuRow.set(row);
    }
  }

  filterMenuPosition = signal<{ x: number, y: number } | null>(null);

  openFilterMenu(col: Column, event: MouseEvent): void {
    event.stopPropagation();
    console.log('[TableView] Opening filter menu for', col.code);

    // Calculate fixed position
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.filterMenuPosition.set({
      // Align right edge of menu with right edge of button (approx)
      // Menu width is w-72 (18rem = 288px)
      x: Math.max(10, rect.right - 288),
      y: rect.bottom + 5
    });

    this.openFilterMenuForColumn.set(col);
  }

  closeFilterMenu(): void {
    console.log('[TableView] Closing filter menu');
    this.openFilterMenuForColumn.set(null);
    this.filterMenuPosition.set(null);
  }

  closeRowMenu(): void {
    // console.log('[TableView] Closing row menu');
    this.openMenuRow.set(null);
    this.clickedColumnCode.set(null);
    this.contextMenuPosition.set(null);
  }

  handleRowMenuAction(event: { action: string; row: any }): void {
    const action = event.action;
    const row = event.row;
    const colCode = this.clickedColumnCode();

    if (action.startsWith('system:')) {
      // Handle System Actions
      if (action === 'system:copy' && colCode) {
        const val = row[colCode];
        navigator.clipboard.writeText(String(val)).then(() => {
          console.log('Copied to clipboard:', val);
          // Optional: Show toast
        });
      } else if (action === 'system:filter' && colCode) {
        const val = row[colCode];
        this.filterChange.emit({
          code: colCode,
          filter: {
            code: colCode,
            name: colCode, // Name lookup might be better but code works
            type: 'text', // Infer type? For now text/select.
            operator: 'contains',
            value1: String(val)
          }
        });
      } else if (action === 'system:hide' && colCode) {
        this.columnVisibilityChange.emit(colCode);
      }
    } else {
      // Emit Standard Actions
      this.rowAction.emit(event);
    }

    this.closeRowMenu();
  }

  handleHeaderMenuAction(action: string): void {
    this.headerAction.emit({ action, selectedIds: Array.from(this.selectedIds()) });
    this.isHeaderMenuOpen.set(false);
  }

  // Density Row Height Map
  rowHeight = computed(() => {
    switch (this.density()) {
      case 'comfortable': return 60;
      case 'cozy': return 50;
      case 'compact': return 36;
      case 'ultra-compact': return 28;
      default: return 36;
    }
  });

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

  trackByPrimaryKey = (index: number, item: any) => {
    return item[this.primaryKey()];
  };

  getCellClass(row: any, col: any): string {
    const parts = [this.densityClass()];
    const val = this.getCellValidation(row, col);

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

  getColorResolverForColumn(column: Column) {
    return (row: any) => {
      const style = this.getCellValidation(row, column).style;
      // console.log(`[TableView] Color Resolve ${column.code}:`, style?.bgcolor);
      return style?.bgcolor;
    };
  }
}
