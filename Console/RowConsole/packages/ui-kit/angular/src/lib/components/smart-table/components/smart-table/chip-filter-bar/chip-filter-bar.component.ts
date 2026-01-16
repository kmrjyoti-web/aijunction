import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayChip } from '../../../models/chip.model';

@Component({
  selector: 'app-chip-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipFilterBarComponent {
  chips = input.required<DisplayChip[]>();
  
  chipClicked = output<DisplayChip>();
  removeChip = output<string>();
  addChip = output<void>();

  onChipClick(chip: DisplayChip): void {
    // Only chips that are meant to be filters are clickable
    if (chip.aggregation === 'count' && chip.filterValue) {
      this.chipClicked.emit(chip);
    }
  }
}
