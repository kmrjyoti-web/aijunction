import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column, MaskConfig } from '../../../../models/table-config.model';
// fix: Corrected import path for Contact model.
import { Contact } from '../../../../data-access/online-data.service';
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
  data = input.required<Contact[]>();
  density = input<Density>('cozy');
  densityClass = input('');
  selectedIds = input(new Set<number>());
  enableMultiSelect = input(false);
  customTemplate = input<string | null>(null);
  keyboardActiveRowIndex = input<number | null>(null);

  selectionChange = output<Set<number>>();
  rowClicked = output<Contact>();

  headerColumn = computed(() => this.columns().find(c => c.cardHeader));
  rowColumns = computed(() => this.columns().filter(c => c.listRow));
  imageColumn = computed(() => this.columns().find(c => c.columnType === 'IMAGE'));

  onItemClick(item: Contact): void {
      this.rowClicked.emit(item);
      if (this.enableMultiSelect()) {
        this.toggleSelection(item.organization_id);
      }
  }

  private toggleSelection(rowId: number): void {
    if (!this.enableMultiSelect()) return;
    
    const newSelection = new Set(this.selectedIds());
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    this.selectionChange.emit(newSelection);
  }

  getFieldValidationState(item: Contact, column: Column): ValidationState {
    return getValidationState(item[column.code as keyof Contact], column, column.code);
  }

  maskString(value: string, config: MaskConfig): string {
    return maskUtil(value, {
      visibleStart: config.visibleStart,
      visibleEnd: config.visibleEnd,
      maskChar: config.maskChar
    });
  }
}
