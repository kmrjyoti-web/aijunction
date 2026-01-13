import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../utils/layout.service';

@Component({
    selector: 'app-layout-switcher',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="layout-switcher-overlay" (click)="close.emit()">
        <div class="switcher-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
                <h3>Switch Layout</h3>
                <button class="close-btn" (click)="close.emit()">&times;</button>
            </div>
            <div class="layout-list">
                <div class="layout-item" *ngFor="let layout of layouts" 
                     [class.active]="layoutService.activeLayout() === layout.id"
                     (click)="selectLayout(layout.id)">
                    <span class="layout-name">{{ layout.label }}</span>
                    <span class="status-badge" *ngIf="layoutService.activeLayout() === layout.id">Active</span>
                </div>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .layout-switcher-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s;
    }

    .switcher-modal {
        background: white;
        border-radius: 8px;
        width: 400px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        overflow: hidden;
        animation: slideUp 0.2s;
    }

    .modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 { margin: 0; font-size: 16px; color: #333; }
        .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    }

    .layout-list {
        padding: 10px;
    }

    .layout-item {
        padding: 12px 15px;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: background 0.2s;
        margin-bottom: 5px;

        &:hover {
            background-color: #f5f5f5;
        }

        &.active {
            background-color: #e3f2fd;
            color: #1976d2;
            font-weight: 500;
        }

        .status-badge {
            font-size: 10px;
            background: #1976d2;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
        }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class LayoutSwitcherComponent {
    layoutService = inject(LayoutService);
    @Output() close = new EventEmitter<void>();

    get layouts() {
        return this.layoutService.availableLayouts;
    }

    selectLayout(id: string) {
        this.layoutService.switchLayout(id);
        this.close.emit();
    }
}
