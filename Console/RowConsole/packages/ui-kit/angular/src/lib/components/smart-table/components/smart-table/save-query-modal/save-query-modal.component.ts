import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-save-query-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-query-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveQueryModalComponent {
  isOpen = input.required<boolean>();
  
  close = output<void>();
  save = output<string>();

  queryName = signal('');

  handleSave(): void {
    const name = this.queryName().trim();
    if (name) {
      this.save.emit(name);
      this.close.emit();
    }
  }
}
