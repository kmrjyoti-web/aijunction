import { ChangeDetectionStrategy, Component, effect, inject, input, output, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableConfig, DataStrategy } from '../../../../models/table-config.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './config-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigFormComponent implements OnDestroy {
  config = input.required<TableConfig | null>();
  configChange = output<TableConfig>();

  private fb: FormBuilder = inject(FormBuilder);
  form: FormGroup;
  private destroy$ = new Subject<void>();

  get columnsArray(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  drop(event: CdkDragDrop<any[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) return;

    const dir = currentIndex > previousIndex ? 1 : -1;
    const item = this.columnsArray.at(previousIndex);

    // Move in FormArray without emitting intermediate states
    this.columnsArray.removeAt(previousIndex, { emitEvent: false });
    this.columnsArray.insert(currentIndex, item, { emitEvent: false });

    // Trigger update
    this.form.updateValueAndValidity();
  }

  readonly dataStrategies: DataStrategy[] = ['SYNC', 'ONLINE_FIRST', 'OFFLINE_FIRST', 'HYBRID'];
  readonly pagingModes = ['paginator', 'infinite'];
  readonly infiniteScrollBehaviors = ['append', 'replace'];
  readonly paginatorPositions = ['top', 'bottom', 'both'];
  readonly toolbarButtonModes = ['iconAndText', 'iconOnly'];

  activeTab = signal<'general' | 'columns' | 'style'>('general');

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
      headerBackgroundColor: ['#ffffff'],
      footerBackgroundColor: ['transparent'],
      borderColor: ['#e5e7eb'],
      enableTransparency: [false],
      transparencyOpacity: [90], // Default 90%
      backgroundImageUrl: [''],
      autoSizeOffset: [0],
      columns: this.fb.array([])
    });

    // Add effect for initial load
    effect(() => {
      // ... logic handled inside effect below ...
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
          headerBackgroundColor: currentConfig.config.styleConfig?.headerBackgroundColor ?? 'var(--marg-header-bg)',
          footerBackgroundColor: currentConfig.config.styleConfig?.footerBackgroundColor ?? 'transparent',
          borderColor: currentConfig.config.styleConfig?.borderColor ?? 'var(--marg-border-color)',
          enableTransparency: currentConfig.config.styleConfig?.enableTransparency ?? false,
          transparencyOpacity: currentConfig.config.styleConfig?.transparencyOpacity ?? 90,
          backgroundImageUrl: currentConfig.config.styleConfig?.backgroundImageUrl ?? '',
          autoSizeOffset: currentConfig.config.sizerConfig?.autoSizeOffset ?? 0
        }, { emitEvent: false }); // Prevent feedback loop with valueChanges

        // Patch Columns FormArray (Sync in-place to preserve focus)
        const columnsArray = this.form.get('columns') as FormArray;
        const newCols = currentConfig.columns || [];

        // 1. Remove excess controls
        while (columnsArray.length > newCols.length) {
          columnsArray.removeAt(columnsArray.length - 1, { emitEvent: false });
        }

        // 2. Add missing controls
        while (columnsArray.length < newCols.length) {
          columnsArray.push(this.fb.group({
            code: [''],
            header: [''],
            visible: [true],
            width: [''],
            columnType: [''],
            // Masking
            maskEnabled: [false],
            maskChar: ['*'],
            visibleStart: [0],
            visibleEnd: [4],
            unmaskEnabled: [false],
            // Mobile Config
            mobileShowCall: [false],
            mobileShowMessage: [false],
            mobileShowWhatsapp: [false],
            // Email Config
            emailShowAction: [false],
            // Card View Config
            cardPosition: ['none'],
            // Validation
            validationRequired: [false],
            requiredErrorColor: ['bg-red-50 text-red-600'],
            emptyBackgroundColor: ['bg-yellow-50'],
            validationMinLength: [null],
            validationMaxLength: [null],
            lengthErrorColor: ['bg-orange-50 text-orange-600']
          }), { emitEvent: false });
        }

        // 3. Update values
        newCols.forEach((col, index) => {
          const control = columnsArray.at(index);
          control.patchValue({
            code: col.code,
            header: col.header,
            visible: col.visible ?? true,
            width: col.width ?? '',
            columnType: col.columnType,
            // Masking
            maskEnabled: col.mask?.enabled ?? false,
            maskChar: col.mask?.maskChar ?? '*',
            visibleStart: col.mask?.visibleStart ?? 0,
            visibleEnd: col.mask?.visibleEnd ?? 4,
            unmaskEnabled: col.mask?.unmaskEnabled ?? false,
            // Mobile Config
            mobileShowCall: col.mobileConfig?.showCall ?? false,
            mobileShowMessage: col.mobileConfig?.showMessage ?? false,
            mobileShowWhatsapp: col.mobileConfig?.showWhatsapp ?? false,
            // Email Config
            emailShowAction: col.emailConfig?.showAction ?? false,
            // Card View Config
            cardPosition: col.cardViewConfig?.position ?? 'none',
            cardFooterCall: col.cardViewConfig?.footerActions?.showCall ?? false,
            cardFooterEmail: col.cardViewConfig?.footerActions?.showEmail ?? false,
            cardFooterWhatsapp: col.cardViewConfig?.footerActions?.showWhatsapp ?? false,
            cardFooterDetail: col.cardViewConfig?.footerActions?.showDetail ?? false,
            // Validation
            validationRequired: col.validation?.required ?? false,
            requiredErrorColor: col.validation?.requiredErrorColor ?? 'bg-red-50 text-red-600',
            emptyBackgroundColor: col.validation?.emptyBackgroundColor ?? 'bg-yellow-50',
            validationMinLength: col.validation?.minLength ?? null,
            validationMaxLength: col.validation?.maxLength ?? null,
            lengthErrorColor: col.validation?.lengthErrorColor ?? 'bg-orange-50 text-orange-600'
          }, { emitEvent: false });
        });
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

        if (!updatedConfig.config.styleConfig) {
          updatedConfig.config.styleConfig = {
            enableTransparency: formValue.enableTransparency,
            transparencyOpacity: formValue.transparencyOpacity,
            headerBackgroundColor: formValue.headerBackgroundColor,
            footerBackgroundColor: formValue.footerBackgroundColor,
            backgroundImageUrl: formValue.backgroundImageUrl
          };
        } else {
          updatedConfig.config.styleConfig.enableTransparency = formValue.enableTransparency;
          updatedConfig.config.styleConfig.transparencyOpacity = formValue.transparencyOpacity;
          updatedConfig.config.styleConfig.headerBackgroundColor = formValue.headerBackgroundColor;
          updatedConfig.config.styleConfig.footerBackgroundColor = formValue.footerBackgroundColor;
          updatedConfig.config.styleConfig.borderColor = formValue.borderColor;
          updatedConfig.config.styleConfig.backgroundImageUrl = formValue.backgroundImageUrl;
        }

        updatedConfig.config.enableRowMenu = formValue.enableRowMenu;
        updatedConfig.config.enableHeaderActions = formValue.enableHeaderActions;
        updatedConfig.config.enableSavedQueries = formValue.enableSavedQueries;
        updatedConfig.config.enableChipFilters = formValue.enableChipFilters;
        updatedConfig.config.enableFreeze = formValue.enableFreeze;
        updatedConfig.config.toolbarButtonMode = formValue.toolbarButtonMode;

        if (!updatedConfig.config.sizerConfig) {
          // Fallback if missing, though it should exist given defaults
          updatedConfig.config.sizerConfig = {
            enabled: true,
            defaultDensity: 'compact',
            densities: [], // densities usually static or from separate config, handled via defaults
            autoSizeOffset: formValue.autoSizeOffset
          } as any;
        } else {
          updatedConfig.config.sizerConfig.autoSizeOffset = Number(formValue.autoSizeOffset);
        }

        // Map Columns back
        if (formValue.columns && Array.isArray(formValue.columns)) {
          const newColumns: any[] = [];
          formValue.columns.forEach((colForm: any, index: number) => {
            const originalCol = updatedConfig.columns.find(c => c.code === colForm.code);
            if (originalCol) {
              newColumns.push({
                ...originalCol, // Preserve other properties like sortable, filterable
                index: index,
                header: colForm.header,
                visible: colForm.visible,
                width: colForm.width,
                columnType: colForm.columnType,
                mask: {
                  enabled: colForm.maskEnabled,
                  maskChar: colForm.maskChar,
                  visibleStart: Number(colForm.visibleStart),
                  visibleEnd: Number(colForm.visibleEnd),
                  unmaskEnabled: colForm.unmaskEnabled
                },
                mobileConfig: {
                  showCall: colForm.mobileShowCall,
                  showMessage: colForm.mobileShowMessage,
                  showWhatsapp: colForm.mobileShowWhatsapp
                },
                emailConfig: {
                  showAction: colForm.emailShowAction
                },
                cardViewConfig: {
                  position: colForm.cardPosition,
                  footerActions: {
                    showCall: colForm.cardFooterCall,
                    showEmail: colForm.cardFooterEmail,
                    showWhatsapp: colForm.cardFooterWhatsapp,
                    showDetail: colForm.cardFooterDetail
                  }
                },
                validation: {
                  required: colForm.validationRequired,
                  requiredErrorColor: colForm.requiredErrorColor,
                  emptyBackgroundColor: colForm.emptyBackgroundColor,
                  minLength: colForm.validationMinLength ? Number(colForm.validationMinLength) : undefined,
                  maxLength: colForm.validationMaxLength ? Number(colForm.validationMaxLength) : undefined,
                  lengthErrorColor: colForm.lengthErrorColor
                }
              });
            } else {
              console.warn(`[ConfigForm] Column with code ${colForm.code} not found in current config.`);
            }
          });
          updatedConfig.columns = newColumns;
          console.log('[ConfigForm] Emitting updated config. Columns with mask:', newColumns.filter(c => c.mask?.enabled).map(c => c.code));
        }

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