import { ChangeDetectionStrategy, Component, effect, inject, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableConfig, DataStrategy } from '../../../../models/table-config.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigFormComponent implements OnDestroy {
  config = input.required<TableConfig | null>();
  configChange = output<TableConfig>();
  
  private fb: FormBuilder = inject(FormBuilder);
  form: FormGroup;
  private destroy$ = new Subject<void>();
  
  readonly dataStrategies: DataStrategy[] = ['SYNC', 'ONLINE_FIRST', 'OFFLINE_FIRST', 'HYBRID'];
  readonly pagingModes = ['paginator', 'infinite'];
  readonly infiniteScrollBehaviors = ['append', 'replace'];
  readonly paginatorPositions = ['top', 'bottom', 'both'];
  readonly toolbarButtonModes = ['iconAndText', 'iconOnly'];

  constructor() {
    this.form = this.fb.group({
      title: [''],
      dataStrategy: [''],
      pagingMode: [''],
      infiniteScrollBehavior: [''],
      paginatorPosition: [''],
      stripedRows: [false],
      showGridlines: [false],
      rowHover: [false],
      enableColumnChooser: [false],
      enableExport: [false],
      enableMultiSelect: [false],
      enableConfigButton: [false],
      cardsPerRow: [4],
      enableFooter: [false],
      enableRowMenu: [false],
      enableHeaderActions: [false],
      enableSavedQueries: [false],
      enableChipFilters: [false],
      enableFreeze: [false],
      toolbarButtonMode: ['iconAndText'],
    });
    
    effect(() => {
        const currentConfig = this.config();
        if (currentConfig) {
            this.form.patchValue({
                title: currentConfig.config.title,
                dataStrategy: currentConfig.config.dataStrategy,
                pagingMode: currentConfig.config.pagingMode,
                infiniteScrollBehavior: currentConfig.config.infiniteScrollBehavior,
                paginatorPosition: currentConfig.config.paginatorPosition ?? 'bottom',
                stripedRows: currentConfig.config.stripedRows ?? true,
                showGridlines: currentConfig.config.showGridlines ?? false,
                rowHover: currentConfig.config.rowHover ?? true,
                enableColumnChooser: currentConfig.config.enableColumnChooser,
                enableExport: currentConfig.config.exportConfig?.enabled ?? false,
                enableMultiSelect: currentConfig.config.enableMultiSelect ?? false,
                enableConfigButton: currentConfig.config.enableConfigButton,
                cardsPerRow: currentConfig.config.cardViewConfig?.cardsPerRow ?? 4,
                enableFooter: currentConfig.config.footerConfig?.enabled ?? false,
                enableRowMenu: currentConfig.config.enableRowMenu,
                enableHeaderActions: currentConfig.config.enableHeaderActions,
                enableSavedQueries: currentConfig.config.enableSavedQueries,
                enableChipFilters: currentConfig.config.enableChipFilters ?? false,
                enableFreeze: currentConfig.config.enableFreeze ?? false,
                toolbarButtonMode: currentConfig.config.toolbarButtonMode ?? 'iconAndText',
            }, { emitEvent: false }); // Prevent feedback loop with valueChanges
        }
    });

    this.form.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(this.isEqual),
        takeUntil(this.destroy$)
    ).subscribe(formValue => {
        const currentConfig = this.config();
        if (currentConfig) {
            // Create a deep copy to avoid direct mutation
            const updatedConfig: TableConfig = JSON.parse(JSON.stringify(currentConfig));
            
            updatedConfig.config.title = formValue.title;
            updatedConfig.config.dataStrategy = formValue.dataStrategy;
            updatedConfig.config.pagingMode = formValue.pagingMode;
            updatedConfig.config.infiniteScrollBehavior = formValue.infiniteScrollBehavior;
            updatedConfig.config.paginatorPosition = formValue.paginatorPosition;
            updatedConfig.config.stripedRows = formValue.stripedRows;
            updatedConfig.config.showGridlines = formValue.showGridlines;
            updatedConfig.config.rowHover = formValue.rowHover;
            updatedConfig.config.enableColumnChooser = formValue.enableColumnChooser;
            
            if (!updatedConfig.config.exportConfig) {
                updatedConfig.config.exportConfig = { 
                    enabled: formValue.enableExport, 
                    options: [
                      { "label": "CSV", "key": "csv", "icon": "pi pi-file" },
                      { "label": "Excel", "key": "excel", "icon": "pi pi-file-excel" },
                      { "label": "PDF", "key": "pdf", "icon": "pi pi-file-pdf" }
                    ]
                };
            } else {
                updatedConfig.config.exportConfig.enabled = formValue.enableExport;
            }
            
            updatedConfig.config.enableMultiSelect = formValue.enableMultiSelect;
            updatedConfig.config.enableConfigButton = formValue.enableConfigButton;

            if (!updatedConfig.config.cardViewConfig) {
                updatedConfig.config.cardViewConfig = { cardsPerRow: 4 };
            }
            updatedConfig.config.cardViewConfig.cardsPerRow = Number(formValue.cardsPerRow);

            if (!updatedConfig.config.footerConfig) {
                updatedConfig.config.footerConfig = { 
                    enabled: formValue.enableFooter, 
                    columns: [
                      { "code": "contact_person_composite", "aggregation": "count", "display": "Total: {value}" },
                      { "code": "annual_revenue", "aggregation": "sum", "display": "Sum: {value}" }
                    ]
                };
            } else {
                updatedConfig.config.footerConfig.enabled = formValue.enableFooter;
            }

            updatedConfig.config.enableRowMenu = formValue.enableRowMenu;
            updatedConfig.config.enableHeaderActions = formValue.enableHeaderActions;
            updatedConfig.config.enableSavedQueries = formValue.enableSavedQueries;
            updatedConfig.config.enableChipFilters = formValue.enableChipFilters;
            updatedConfig.config.enableFreeze = formValue.enableFreeze;
            updatedConfig.config.toolbarButtonMode = formValue.toolbarButtonMode;

            this.configChange.emit(updatedConfig);
        }
    });
  }

  private isEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}