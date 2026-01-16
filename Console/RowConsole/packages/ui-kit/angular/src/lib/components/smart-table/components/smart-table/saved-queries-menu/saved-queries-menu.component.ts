import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedQuery } from '../../../models/saved-query.model';


@Component({
  selector: 'app-saved-queries-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-queries-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedQueriesMenuComponent {
  queries = input.required<SavedQuery[]>();

  selectQuery = output<string>();
  deleteQuery = output<string>();
  saveCurrent = output<void>();
}
