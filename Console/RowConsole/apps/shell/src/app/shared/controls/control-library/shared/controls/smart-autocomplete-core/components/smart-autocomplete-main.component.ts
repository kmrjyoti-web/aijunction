
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BidiModule } from '@angular/cdk/bidi';
import { PlatformModule } from '@angular/cdk/platform';
import { LayoutModule } from '@angular/cdk/layout';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SmartAutocompleteStore } from '../state/smart-autocomplete.store';
import { SmartAutocompleteOperatorsService } from '../services/smart-autocomplete-operators.service';
import { AutocompleteSourceConfig } from '../models/autocomplete-config.model';
import { SmartAutocompleteTableViewComponent } from './smart-autocomplete-table-view.component';

@Component({
    selector: 'app-smart-autocomplete-main',
    standalone: true,
    imports: [
      CommonModule, 
      OverlayModule, 
      ScrollingModule, 
      BidiModule, 
      PlatformModule,
      LayoutModule,
      PortalModule,
      A11yModule,
      ReactiveFormsModule, 
      SmartAutocompleteTableViewComponent
    ],
    providers: [
        SmartAutocompleteStore
    ],
    template: `
        <div class="relative group w-full" cdkOverlayOrigin #autoOrigin="cdkOverlayOrigin">
            
            <!-- Input Field -->
            <input
                #inputEl
                type="text"
                [formControl]="inputControl"
                (focus)="onFocus()"
                (keydown)="onKeyDown($event)"
                [placeholder]="' '"
                class="peer block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
                [class.pr-10]="store.isLoading()"
                autocomplete="off"
            />

            <!-- Floating Label -->
            <label
                class="absolute left-2 z-10 origin-[0] max-w-[90%] truncate px-2 text-gray-500 duration-200 pointer-events-none bg-white peer-focus:text-primary peer-focus:-top-2.5 peer-focus:scale-90"
                [class.-top-2.5]="inputControl.value"
                [class.scale-90]="inputControl.value"
                [class.top-1/2]="!inputControl.value"
                [class.-translate-y-1/2]="!inputControl.value"
            >
                {{ label }} @if(required){ <span class="text-red-500">*</span> }
            </label>

            <!-- Loading Spinner / Clear Icon -->
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                @if (store.isLoading()) {
                    <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                } @else if (inputControl.value) {
                    <button type="button" (click)="reset()" class="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                }
            </div>
        </div>

        <!-- Filter Summary Tags -->
        @if (activeFilters().length > 0) {
            <div class="flex flex-wrap gap-2 mt-2 px-1">
                <span class="text-xs text-gray-500 self-center">Filters:</span>
                @for (filter of activeFilters(); track $index) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {{ filter.parameter_code }}: {{ filter.parameter_value }}
                    </span>
                }
            </div>
        }

        <!-- Dropdown Overlay -->
        <ng-template
            cdkConnectedOverlay
            [cdkConnectedOverlayOrigin]="autoOrigin"
            [cdkConnectedOverlayOpen]="panelOpen && (store.items().length > 0 || store.hasCompletedSearch())"
            [cdkConnectedOverlayPositions]="positions"
            [cdkConnectedOverlayWidth]="overlayWidth"
            (overlayOutsideClick)="closePanel()"
        >
            <div class="bg-white border border-gray-200 shadow-xl rounded-lg mt-1 overflow-hidden z-50">
                
                <!-- Table View -->
                <app-smart-autocomplete-table-view
                    #tableView
                    [config]="sourceConfig"
                    [items]="store.items()"
                    (rowSelect)="onRowSelect($event)"
                ></app-smart-autocomplete-table-view>

                <!-- Helper Footer -->
                <div class="bg-gray-50 px-3 py-1.5 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between">
                    <span>Use <strong>Shift + Space</strong> for search helper</span>
                    <span><strong>Enter</strong> to select</span>
                </div>
            </div>
        </ng-template>
    `
})
export class SmartAutocompleteMainComponent implements OnInit {
    @Input() sourceConfig!: AutocompleteSourceConfig;
    @Input() label: string = '';
    @Input() required: boolean = false;
    @Input() preselectedValue: any = null;
    
    @Output() selectionChange = new EventEmitter<any>();

    @ViewChild('tableView') tableView?: SmartAutocompleteTableViewComponent;
    @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

    store = inject(SmartAutocompleteStore);
    operators = inject(SmartAutocompleteOperatorsService);
    inputControl = new FormControl('');
    
    panelOpen = false;
    overlayWidth = 'auto';

    activeFilters = computed(() => {
        return this.operators.parseQuery(this.store.query(), this.sourceConfig);
    });

    positions: ConnectedPosition[] = [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
    ];

    ngOnInit() {
        if (this.sourceConfig) {
            this.store.init(this.sourceConfig);
        }
        
        // Sync Input to Store
        this.inputControl.valueChanges.subscribe(val => {
            this.store.updateQuery(val || '');
            this.panelOpen = true;
        });

        // Set initial value if provided
        if (this.preselectedValue) {
            this.setDisplayText(this.preselectedValue);
        }
    }

    onFocus() {
        this.panelOpen = true;
        // Calculate dynamic width based on config or input
        const minW = this.sourceConfig.panelConfig?.minWidth || '400px';
        this.overlayWidth = minW; 
    }

    closePanel() {
        this.panelOpen = false;
    }

    reset() {
        this.inputControl.setValue('');
        this.selectionChange.emit(null);
    }

    onRowSelect(row: any) {
        this.selectionChange.emit(row);
        this.setDisplayText(row);
        this.closePanel();
    }

    private setDisplayText(row: any) {
        // Determine display text based on selection config
        let text = '';
        if (this.sourceConfig.selectionConfig?.displayFields) {
            text = this.sourceConfig.selectionConfig.displayFields
                .map(f => row[f]).filter(Boolean).join(this.sourceConfig.selectionConfig.displaySeparator || ' - ');
        } else if (this.sourceConfig.tableColumns && this.sourceConfig.tableColumns.length > 0) {
            text = row[this.sourceConfig.tableColumns[0].field];
        }
        
        // We set the input value but prevent emitting to store again to avoid re-triggering search
        this.inputControl.setValue(text, { emitEvent: false });
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.panelOpen) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.tableView?.moveSelection(1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.tableView?.moveSelection(-1);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            this.tableView?.selectActive();
        } else if (event.key === 'Escape') {
            this.closePanel();
        }
    }
}
