import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sync-options-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sync-options-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncOptionsModalComponent {
  close = output<void>();
  startSync = output<void>();
}
