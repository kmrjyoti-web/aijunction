
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../../../models/table-config.model';

@Component({
  selector: 'app-column-chooser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './column-chooser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChooserComponent {
  allColumns = input.required<Column[]>();
  visibleColumns = input.required<Column[]>();

  visibilityChange = output<Column>();
  orderChange = output<Column[]>();

  private draggedColumnIndex = signal<number | null>(null);

  isColumnVisible(columnCode: string): boolean {
    return this.visibleColumns().some(c => c.code === columnCode);
  }

  onVisibilityChange(column: Column, event: Event): void {
    event.preventDefault();
    this.visibilityChange.emit(column);
  }

  // Drag and Drop for reordering
  onDragStart(index: number): void {
    this.draggedColumnIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const draggedIndex = this.draggedColumnIndex();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      this.draggedColumnIndex.set(null);
      return;
    }

    const columns = [...this.allColumns()];
    const [draggedItem] = columns.splice(draggedIndex, 1);
    columns.splice(dropIndex, 0, draggedItem);
    
    this.orderChange.emit(columns);
    this.draggedColumnIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedColumnIndex.set(null);
  }
}
