import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column, MaskConfig } from '../../../../models/table-config.model';
import { getValidationState, ValidationState } from '../../../../utils/validation.util';
import { maskString as maskUtil } from '../../../../utils/masking.util';
import { DynamicItemComponent } from '../../../shared/dynamic-item/dynamic-item.component';
import { Density } from '../../../../models/density.model';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [CommonModule, DynamicItemComponent],
  templateUrl: './list-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewComponent {
  columns = input.required<Column[]>();
  data = input.required<any[]>();
  primaryKey = input('organization_id');
  density = input<Density>('cozy');
  densityClass = input('');
  selectedIds = input(new Set<any>());
  enableMultiSelect = input(false);
  customTemplate = input<string | null>(null);
  keyboardActiveRowIndex = input<number | null>(null);

  selectionChange = output<Set<any>>();
  rowClicked = output<any>();

  headerColumn = computed(() => this.columns().find(c => c.cardHeader));
  rowColumns = computed(() => this.columns().filter(c => c.listRow));
  imageColumn = computed(() => this.columns().find(c => c.columnType === 'IMAGE'));

  onItemClick(item: any): void {
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
}
