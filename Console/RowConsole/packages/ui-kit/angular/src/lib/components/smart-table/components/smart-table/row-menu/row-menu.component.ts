import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowMenuItem, RowMenuSubItem } from '../../../models/table-config.model';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
  selector: 'app-row-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './row-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowMenuComponent {
  menuConfig = input.required<RowMenuItem[]>();
  row = input.required<any>();
  position = input<{ x: number; y: number } | null>(null);
  showIcons = input(true);
  subMenuDirection = input<'left' | 'right'>('right');

  actionClicked = output<{ action: string; row: any }>();
  clickOutside = output<void>();

  openSubMenu = signal<string | null>(null);

  handleMouseEnter(item: RowMenuSubItem) {
    if (item.items && !this.isItemDisabled(item)) {
      this.openSubMenu.set(item.label);
    } else {
      // Optional: Close submenu if hovering other items?
      // Typically yes.
      this.openSubMenu.set(null);
    }
  }

  handleMouseLeave(item: RowMenuSubItem) {
    // Keep submenu open if hovering it?
    // The submenu is nested in the DOM inside the item div (Line 16/43 in HTML).
    // So distinct mouseleave might be erratic.
    // HTML structure:
    // <div (mouseenter) (mouseleave)>
    //   <a ...>
    //   <submenu />
    // </div>
    // If I leave the wrapper, I leave the submenu too.
    this.openSubMenu.set(null);
  }

  onActionClick(item: RowMenuSubItem) {
    if (this.isItemDisabled(item)) return;

    if (item.action) {
      this.actionClicked.emit({ action: item.action, row: this.row() });
    }
  }

  isItemDisabled(item: RowMenuSubItem): boolean {
    if (item.disable) {
      return item.disable(this.row());
    }
    return false;
  }
}
