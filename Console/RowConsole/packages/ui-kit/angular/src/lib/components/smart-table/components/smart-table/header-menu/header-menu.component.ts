import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowMenuItem } from '../../../models/table-config.model';


@Component({
  selector: 'app-header-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMenuComponent {
  menuConfig = input.required<RowMenuItem[]>();
  actionClicked = output<string>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }
}
