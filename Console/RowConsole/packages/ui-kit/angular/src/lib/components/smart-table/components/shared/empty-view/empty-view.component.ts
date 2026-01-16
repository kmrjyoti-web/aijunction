import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateConfig } from '../../../models/table-config.model';

@Component({
  selector: 'app-empty-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyViewComponent {
  config = input.required<EmptyStateConfig>();
  action = output<string>();
}
