
import { Component, EventEmitter, Input, Output, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteSourceConfig } from '../models/autocomplete-config.model';

@Component({
    selector: 'app-smart-autocomplete-table-view',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="max-h-[320px] overflow-auto border rounded-md">
            @if (!items || items.length === 0) {
                <div class="px-3 py-2 text-xs text-gray-500">No records found.</div>
            } @else {
                <table class="min-w-full text-xs text-left">
                    <thead class="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10">
                        <tr>
                            @for (col of visibleColumns(); track col.field) {
                                <th class="px-3 py-2 border-b border-gray-200 whitespace-nowrap">{{ col.header }}</th>
                            }
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @for (row of items; track $index) {
                            <tr 
                                class="cursor-pointer hover:bg-blue-50 transition-colors"
                                [class.bg-blue-100]="activeIndex() === $index"
                                (click)="onRowClick(row, $index)"
                                (mouseenter)="onRowMouseEnter($index)"
                            >
                                @for (col of visibleColumns(); track col.field) {
                                    <td class="px-3 py-1.5 whitespace-nowrap text-gray-700">{{ getCellValue(row, col.field) }}</td>
                                }
                            </tr>
                        }
                    </tbody>
                </table>
            }
        </div>
    `
})
export class SmartAutocompleteTableViewComponent<TModel = any> {
    @Input({ required: true }) config!: AutocompleteSourceConfig<TModel>;
    @Input({ required: true }) items: TModel[] = [];
    @Output() rowSelect = new EventEmitter<TModel>();

    private _activeIndex = signal<number | null>(null);
    activeIndex = computed(() => this._activeIndex());

    readonly visibleColumns = computed(() => {
        return (this.config?.tableColumns || []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    });

    onRowClick(row: TModel, index: number) {
        this._activeIndex.set(index);
        this.rowSelect.emit(row);
    }

    onRowMouseEnter(index: number) {
        this._activeIndex.set(index);
    }

    getCellValue(row: any, field: string): string {
        return row[field] != null ? String(row[field]) : '';
    }

    // Public API for Parent to Control Selection
    moveSelection(direction: 1 | -1) {
        if (!this.items.length) return;
        let next = (this.activeIndex() ?? -1) + direction;
        if (next < 0) next = 0;
        if (next >= this.items.length) next = this.items.length - 1;
        this._activeIndex.set(next);
        
        // Optional: Scroll into view logic here
    }

    selectActive() {
        const idx = this.activeIndex();
        if (idx !== null && this.items[idx]) {
            this.rowSelect.emit(this.items[idx]);
        }
    }
}
