import { Component, AfterViewInit, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as feather from 'feather-icons';
import { LayoutService } from '../../../../utils/layout.service';
import { MargLayoutService, MenuItem } from '../../services/marg-layout.service';

@Component({
    selector: 'app-marg-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    host: {
        '[class.collapsed]': 'layoutService.isSidebarClosed()'
    },
    template: `
    <div class="marg-sidebar-wrapper" [class.collapsed]="layoutService.isSidebarClosed() && !isHovered" [class.hover-expanded]="layoutService.isSidebarClosed() && isHovered">
        <div class="logo-area">
             <!-- Full Logo -->
             <ng-container *ngIf="!layoutService.isSidebarClosed() || isHovered">
                <span style="font-weight: bold; color: #1e5f74; font-size: 20px;">MARG</span>
                <span style="font-weight: bold; color: #e53935; background: white; border: 1px solid #e53935; border-radius: 3px; padding: 0 4px; margin-left: 2px;">BOOKS</span>
             </ng-container>
             
             <!-- Collapsed Logo (The 'B' from the image) -->
             <div *ngIf="layoutService.isSidebarClosed() && !isHovered" style="width: 30px; height: 30px; background: white; border: 2px solid #e53935; color: #e53935; font-weight: bold; font-size: 18px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transform: rotate(-10deg);">
                B
             </div>
        </div>

        <div class="sidebar-content">
            <!-- Remove *ngIf so we can style it in collapsed mode via CSS -->
            <div class="search-area">
                <div class="search-input-wrapper">
                    <input type="text" placeholder="Type to search" 
                           [(ngModel)]="searchText"
                           (keydown)="onSearchKeydown($event)">
                    <i data-feather="search"></i>
                </div>
            </div>

            <ul class="menu-list">
                <li *ngFor="let item of filteredMenuItems()" 
                    [class.active]="item.active" 
                    [class.expanded]="item.expanded"
                    [class.focused]="focusedItem() === item">
                    
                    <div class="menu-item" (click)="toggleItem(item)">
                        <i [attr.data-feather]="item.icon" class="menu-icon"></i>
                        <span class="menu-text" *ngIf="!layoutService.isSidebarClosed() || isHovered">{{ item.label }}</span>
                        <i data-feather="chevron-right" class="arrow-icon" 
                           *ngIf="item.hasSub && (!layoutService.isSidebarClosed() || isHovered)"
                           [class.rotated]="item.expanded"></i>
                    </div>

                    <!-- Sub Menu -->
                    <ul class="sub-menu-list" *ngIf="item.hasSub && item.expanded && (!layoutService.isSidebarClosed() || isHovered)">
                        <li class="sub-menu-item" *ngFor="let sub of item.subItems"
                            [class.focused]="focusedItem() === sub"
                            (click)="toggleItem(sub)"> <!-- Handle child click too -->
                            <span class="sub-menu-text">{{ sub.label }}</span>
                            <i data-feather="plus" class="plus-icon"></i>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="user-support">
             <div class="avatar-circle">
                <img src="assets/images/dashboard/1.png" alt="Support" onerror="this.src='https://dummyimage.com/50x50/cccccc/000000.png&text=User'">
             </div>
        </div>
    </div>
    `,
    styleUrls: ['./sidebar.component.scss']
})
export class MargSidebarComponent implements AfterViewInit {
    layoutService = inject(LayoutService);
    margLayoutService = inject(MargLayoutService);

    // Search Signal
    searchText = signal('');
    focusedIndex = signal(-1);

    constructor() {
        // Reset focus when search changes
        effect(() => {
            this.searchText(); // dependency
            this.focusedIndex.set(-1);
        }, { allowSignalWrites: true });
    }

    menuItems: MenuItem[] = this.margLayoutService.getMenuItems();

    // Filtered Menu Items
    filteredMenuItems = computed(() => {
        const term = this.searchText().toLowerCase();
        if (!term) return this.menuItems;

        return this.menuItems.map(item => {
            const matchesSelf = item.label.toLowerCase().includes(term);
            const matchingSubItems = item.subItems?.filter(sub => sub.label.toLowerCase().includes(term)) || [];

            if (matchesSelf || matchingSubItems.length > 0) {
                return {
                    ...item,
                    expanded: matchingSubItems.length > 0 || item.expanded,
                    subItems: matchingSubItems.length > 0 ? matchingSubItems : item.subItems
                };
            }
            return null;
        }).filter(item => item !== null) as MenuItem[];
    });

    // Flattened list for navigation
    flatVisibleItems = computed(() => {
        const items: MenuItem[] = [];
        this.filteredMenuItems().forEach(item => {
            items.push(item);
            if (item.expanded && item.subItems) {
                items.push(...item.subItems);
            }
        });
        return items;
    });

    // Currently focused item object
    focusedItem = computed(() => {
        const items = this.flatVisibleItems();
        const index = this.focusedIndex();
        if (index >= 0 && index < items.length) {
            return items[index];
        }
        return null;
    });

    onSearchKeydown(event: KeyboardEvent) {
        const items = this.flatVisibleItems();
        if (!items.length) return;

        if (event.key === 'ArrowDown') {
            this.focusedIndex.update(i => Math.min(i + 1, items.length - 1));
            event.preventDefault();
            this.scrollToFocused(); // Implement if needed
        } else if (event.key === 'ArrowUp') {
            this.focusedIndex.update(i => Math.max(i - 1, 0));
            event.preventDefault();
            this.scrollToFocused();
        } else if (event.key === 'Enter') {
            const current = this.focusedItem();
            if (current) {
                if (current.hasSub) {
                    this.toggleItem(current);
                } else {
                    // It's a leaf node or link
                    // trigger click or routing
                }
                event.preventDefault();
            }
        }
    }

    scrollToFocused() {
        // Placeholder for scrolling logic
    }

    ngAfterViewInit() {
        feather.replace();
    }

    toggleItem(item: MenuItem) {
        if (item.hasSub) {
            item.expanded = !item.expanded;
            // Re-run feather replace to render icons in new sub-menu items
            setTimeout(() => feather.replace());
        } else {
            // Activate single item
            this.menuItems.forEach(i => i.active = false);
            // Also deactivate all subitems visually if needed, but 'active' property on subitems isn't tracked globally in this simple model
            // For now just mark this item active
            item.active = true;

            // Handle routing if link exists
            if (item.link) {
                // router.navigate...
            }
        }
    }

    // Hover Logic for Collapsed State
    isHovered = false;

    @HostListener('mouseenter')
    onMouseEnter() {
        if (this.layoutService.isSidebarClosed()) {
            this.isHovered = true;
        }
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.isHovered = false;
    }
}
