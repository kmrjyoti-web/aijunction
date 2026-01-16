import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowMenuItem, RowMenuSubItem } from '../../../models/table-config.model';
// fix: Corrected import path for Contact model.
import { Contact } from '../../../data-access/online-data.service';


@Component({
  selector: 'app-row-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './row-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowMenuComponent {
  menuConfig = input.required<RowMenuItem[]>();
  row = input.required<Contact>();
  position = input<{ x: number; y: number } | null>(null);

  actionClicked = output<{ action: string; row: Contact }>();

  openSubMenu = signal<string | null>(null);

  isItemDisabled(item: RowMenuSubItem): boolean {
    const row = this.row();
    switch (item.action) {
      case 'call':
      case 'whatsapp':
      case 'sms':
        return !row.communication_detail;
      case 'email':
        return !row.email_id;
      default:
        return false;
    }
  }

  onActionClick(item: RowMenuSubItem): void {
    if (!item.action || this.isItemDisabled(item)) {
      return;
    }
    this.actionClicked.emit({ action: item.action, row: this.row() });
  }

  handleMouseEnter(item: RowMenuSubItem): void {
    if (item.items) {
      this.openSubMenu.set(item.label);
    }
  }

  handleMouseLeave(item: RowMenuSubItem): void {
    if (item.items) {
      this.openSubMenu.set(null);
    }
  }
}