import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column, MaskConfig, RowMenuItem, CardViewConfig, RowActionItem } from '../../../../models/table-config.model';
import { getValidationState, ValidationState } from '../../../../utils/validation.util';
import { maskString as maskUtil } from '../../../../utils/masking.util';
import { RowMenuComponent } from '../../row-menu/row-menu.component';
import { ClickOutsideDirective } from '../../../../directives/click-outside.directive';
import { DynamicItemComponent } from '../../../shared/dynamic-item/dynamic-item.component';
import { Density } from '../../../../models/density.model';

@Component({
  selector: 'app-card-view',
  standalone: true,
  imports: [CommonModule, RowMenuComponent, ClickOutsideDirective, DynamicItemComponent],
  templateUrl: './card-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardViewComponent {
  columns = input.required<Column[]>();
  data = input.required<any[]>();
  primaryKey = input('organization_id');
  density = input<Density>('cozy');
  densityClass = input('');
  selectedIds = input(new Set<any>());
  enableMultiSelect = input(false);
  rowMenuConfig = input<RowMenuItem[]>();
  rowActions = input<RowActionItem[] | undefined>();
  cardViewConfig = input<CardViewConfig | undefined>();
  customTemplate = input<string | null>(null);
  keyboardActiveRowIndex = input<number | null>(null);

  selectionChange = output<Set<any>>();
  rowAction = output<{ action: string; row: any }>();
  rowClicked = output<any>();

  openMenuRowId = signal<any | null>(null);
  contextMenuPosition = signal<{ x: number, y: number } | null>(null);

  cardHeaderColumn = computed(() => this.columns().find(c => c.cardHeader));
  cardHeader1Column = computed(() => this.columns().find(c => c.cardHeader1));
  cardRowColumns = computed(() => this.columns().filter(c => c.cardRow));
  imageColumn = computed(() => this.columns().find(c => c.columnType === 'IMAGE'));

  gridClasses = computed(() => {
    const count = Number(this.cardViewConfig()?.cardsPerRow ?? 4);
    // Project uses max-width breakpoints (Desktop First).
    // Base class applies to Desktop. Breakpoints apply to smaller screens.
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2 sm:grid-cols-1';
      case 3: return 'grid-cols-3 md:grid-cols-2 sm:grid-cols-1';
      case 4: return 'grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1';
      case 5: return 'grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1';
      case 6: return 'grid-cols-6 xxl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1';
      default: return 'grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1';
    }
  });

  onCardClick(item: any): void {
    this.rowClicked.emit(item);
  }

  onCardContextMenu(event: MouseEvent, item: any): void {
    event.preventDefault();
    this.openMenuRowId.set(item.organization_id);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
  }

  handleCardBodyClick(item: any): void {
    this.rowClicked.emit(item);
    if (this.enableMultiSelect()) {
      this.toggleSelection(item.organization_id);
    }
  }

  private toggleSelection(rowId: any): void {
    if (!this.enableMultiSelect()) return;

    const newSelection = new Set(this.selectedIds());
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    this.selectionChange.emit(newSelection);
  }

  getFieldValidationState(item: any, column: Column): ValidationState {
    return getValidationState(item[column.code], column, column.code);
  }

  maskString(value: string, config: MaskConfig): string {
    return maskUtil(value, {
      visibleStart: config.visibleStart,
      visibleEnd: config.visibleEnd,
      maskChar: config.maskChar
    });
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  toggleRowMenu(event: MouseEvent, rowId: any): void {
    event.stopPropagation();

    // If this menu is already open, just close it.
    if (this.openMenuRowId() === rowId) {
      this.openMenuRowId.set(null);
      this.contextMenuPosition.set(null);
      return;
    }

    // Otherwise, open it at the correct position.
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 224; // Corresponds to w-56 on the menu element

    // Calculate x-position: align right edge of menu with right edge of button.
    let x = rect.right - menuWidth;

    // If that would push it off-screen, align left edge of menu with left edge of button.
    if (x < 0) {
      x = rect.left;
    }

    // Position it slightly below the button.
    const y = rect.bottom + 4;

    // Set state to show the menu.
    this.contextMenuPosition.set({ x, y });
    this.openMenuRowId.set(rowId);
  }

  closeRowMenu(): void {
    this.openMenuRowId.set(null);
    this.contextMenuPosition.set(null);
  }

  handleRowMenuAction(event: { action: string; row: any }): void {
    this.rowAction.emit(event);
    this.closeRowMenu();
  }
}