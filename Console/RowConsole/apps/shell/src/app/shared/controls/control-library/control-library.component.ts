import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ToolbarButtonComponent } from './shared/components/toolbar-button/toolbar-button.component';
import { SchemaBuilderComponent } from './components/schema-builder/schema-builder.component';
import { ProductMasterComponent } from './features/product-master/product-master.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './services/confirm-dialog.service';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { ComponentGalleryComponent } from './features/component-gallery/component-gallery.component';

// import { AvinyaTableSource } from '@ai-junction/ui-kit';
import { FormSchema } from './models/form-schema.model';
import { ShortcutManager } from './utility/shortcut-manager.util';

@Component({
  selector: 'app-control-library',
  standalone: true,
  imports: [
    CommonModule,
    DynamicFormComponent,
    ToolbarButtonComponent,
    SchemaBuilderComponent,
    ProductMasterComponent,
    ConfirmDialogComponent,
    DocumentationComponent,
    ComponentGalleryComponent,

  ],
  template: `
    <!-- Global Confirm Dialog Overlay -->
    <app-confirm-dialog></app-confirm-dialog>

    <!-- ✅ FULL WIDTH workbench (no boxed/max-w) -->
    <div class="min-h-[100dvh] bg-gray-50 font-sans">

      <!-- ✅ Sticky Top App Bar (full width) -->
      <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <!-- Left: Title / mode info -->
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <span class="text-sm font-bold">A</span>
              </div>

              <div class="leading-tight">
                <div class="text-lg font-semibold text-gray-900">Control Library</div>
                <div class="text-xs text-gray-600">
                  {{ modeTitle() }} <span class="text-gray-400">•</span> {{ modeHint() }}
                </div>
              </div>
            </div>

            <!-- Right: Toolbar buttons -->
            <div class="flex items-center gap-2 flex-wrap">
              <app-toolbar-button
                [icon]="currentMode() === 'invoice' ? 'checkCircle' : 'documentText'"
                label="Invoice"
                [color]="currentMode() === 'invoice' ? 'primary' : 'default'"
                shortcut="Alt+I"
                (clicked)="switchMode('invoice')">
              </app-toolbar-button>

              <app-toolbar-button
                [icon]="currentMode() === 'product' ? 'checkCircle' : 'layers'"
                label="Product Master"
                [color]="currentMode() === 'product' ? 'primary' : 'default'"
                shortcut="Alt+P"
                (clicked)="switchMode('product')">
              </app-toolbar-button>



              <app-toolbar-button
                [icon]="currentMode() === 'builder' ? 'checkCircle' : 'cog'"
                label="AI Builder"
                [color]="currentMode() === 'builder' ? 'primary' : 'default'"
                shortcut="Alt+B"
                (clicked)="switchMode('builder')">
              </app-toolbar-button>

              <app-toolbar-button
                [icon]="currentMode() === 'showcase' ? 'checkCircle' : 'listBullet'"
                label="Gallery & AI"
                [color]="currentMode() === 'showcase' ? 'primary' : 'default'"
                shortcut="Alt+S"
                (clicked)="switchMode('showcase')">
              </app-toolbar-button>

              <app-toolbar-button
                [icon]="currentMode() === 'docs' ? 'checkCircle' : 'documentText'"
                label="Tech Docs"
                [color]="currentMode() === 'docs' ? 'primary' : 'default'"
                (clicked)="switchMode('docs')">
              </app-toolbar-button>

              <div class="hidden sm:block h-6 w-px bg-gray-300 mx-1"></div>

              <app-toolbar-button
                icon="trash"
                label="Reset"
                shortcut="Del"
                (clicked)="resetForm()"
                color="danger">
              </app-toolbar-button>
            </div>

          </div>
        </div>
      </header>

      <!-- ✅ Main Area (full width) -->
      <main class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div class="w-full">

          <!-- Smart Table: full height -->
          @if (currentMode() === 'builder') {
            <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <div class="text-sm font-semibold text-gray-900">AI Schema Builder</div>
                <div class="text-xs text-gray-500">Create and preview schemas quickly.</div>
              </div>
              <div class="p-4 sm:p-6">
                <app-schema-builder></app-schema-builder>
              </div>
            </div>

          } @else if (currentMode() === 'product') {
            <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <div class="text-sm font-semibold text-gray-900">Product Master</div>
                <div class="text-xs text-gray-500">Manage products and related configurations.</div>
              </div>
              <div class="p-4 sm:p-6">
                <app-product-master></app-product-master>
              </div>
            </div>

          } @else if (currentMode() === 'showcase') {
            <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <div class="text-sm font-semibold text-gray-900">Gallery & AI</div>
                <div class="text-xs text-gray-500">Showcase components and demos.</div>
              </div>
              <div class="p-4 sm:p-6">
                <app-component-gallery></app-component-gallery>
              </div>
            </div>

          } @else if (currentMode() === 'docs') {
            <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <div class="text-sm font-semibold text-gray-900">Technical Documentation</div>
                <div class="text-xs text-gray-500">Reference docs and guidelines.</div>
              </div>
              <div class="p-4 sm:p-6">
                <app-documentation></app-documentation>
              </div>
            </div>

          } @else {
            <!-- Invoice Mode -->
            <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div class="text-sm font-semibold text-gray-900">Invoice Form</div>
                    <div class="text-xs text-gray-500">Smart Autocomplete enabled (PHARMA config).</div>
                  </div>

                  @if (showResult) {
                    <button
                      type="button"
                      class="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                      (click)="scrollToResult()">
                      Jump to JSON
                    </button>
                  }
                </div>
              </div>

              <div class="p-4 sm:p-6">
                <app-dynamic-form
                  [config]="currentSchema()!"
                  (formSubmit)="handleFormSubmit($event)">
                </app-dynamic-form>
              </div>
            </div>
          }

          <!-- ✅ JSON Inspector (full width) -->
          @if (showResult && submittedData && currentMode() === 'invoice') {
            <section id="jsonResult" class="mt-6">
              <div class="bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 text-slate-100 overflow-hidden relative border border-slate-800">
                <div class="absolute top-0 right-0 p-4 opacity-20 text-6xl font-bold select-none">JSON</div>

                <div class="flex justify-between items-start gap-3 mb-4 flex-wrap">
                  <h3 class="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Form Data Submitted
                  </h3>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="downloadData()"
                      class="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white">
                      Download JSON
                    </button>

                    <button
                      type="button"
                      (click)="showResult = false"
                      class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-white border border-slate-700">
                      Close
                    </button>
                  </div>
                </div>

                <div class="bg-slate-800 rounded-lg p-4 overflow-x-auto border border-slate-700">
                  <pre class="font-mono text-sm text-blue-300 whitespace-pre-wrap">{{ submittedData | json }}</pre>
                </div>
              </div>
            </section>
          }

        </div>
      </main>

      <footer class="py-6 text-center text-xs text-gray-500">
        Avinya Workbench • Shortcuts: Alt+I / Alt+B / Alt+S / Alt+P
      </footer>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ControlLibraryComponent implements OnInit {
  dialogService = inject(ConfirmDialogService);

  currentMode = signal<'invoice' | 'builder' | 'showcase' | 'product' | 'docs'>('invoice');
  currentSchema = signal<FormSchema | null>(null);

  showResult = false;
  submittedData: any = null;



  modeTitle = computed(() => {
    switch (this.currentMode()) {
      case 'invoice': return 'Invoice';
      case 'builder': return 'AI Builder';
      case 'showcase': return 'Gallery & AI';
      case 'product': return 'Product Master';
      case 'docs': return 'Tech Docs';

      default: return 'Workbench';
    }
  });

  modeHint = computed(() => {
    switch (this.currentMode()) {
      case 'invoice': return 'Dynamic form + smart autocomplete';
      case 'builder': return 'Schema generation and preview';
      case 'showcase': return 'Component showcase';
      case 'product': return 'CRUD + configuration';
      case 'docs': return 'Reference & specs';

      default: return '';
    }
  });

  pharmaConfig = {
    "key": "row_contact_pharma",
    "apiUrl": "/v1/Master/RowContact/GetDropDown",
    "takeDefault": 10,
    "viewMode": "table",
    "fields": [
      { "code": "ON", "label": "Organization Name", "parameterName": "Organization Name", "defaultWildcard": "CONTAINS", "allowNot": false },
      { "code": "MN", "label": "Mobile No", "parameterName": "Mobile No", "defaultWildcard": "CONTAINS", "allowNot": true },
      { "code": "EI", "label": "Email Id", "parameterName": "Email Id", "defaultWildcard": "CONTAINS", "allowNot": true },
      { "code": "LN", "label": "Licence No", "parameterName": "Licence No", "defaultWildcard": "CONTAINS", "allowNot": true },
      { "code": "PC", "label": "Pin Code", "parameterName": "Pin Code", "defaultWildcard": "STARTS_WITH", "allowNot": false }
    ],
    "tableColumns": [
      { "header": "Organization", "field": "organization_name", "align": "left", "index": 1, "cardHeader": true, "cardRow": false, "cardOrder": 1, "columnType": "TEXT" },
      { "header": "Contact Person", "field": "contact_person", "align": "left", "index": 2, "cardHeader": false, "cardRow": true, "cardOrder": 2, "cardLabel": "Contact", "columnType": "TEXT" },
      { "header": "Mobile", "field": "communication_detail", "align": "left", "index": 3, "cardHeader": false, "cardRow": true, "cardOrder": 3, "cardLabel": "Mobile", "columnType": "TEXT" },
      { "header": "Email", "field": "other_field_d", "align": "left", "index": 4, "cardHeader": false, "cardRow": true, "cardOrder": 4, "cardLabel": "Email", "columnType": "TEXT" },
      { "header": "City", "field": "city", "align": "left", "index": 5, "cardHeader": false, "cardRow": true, "cardOrder": 5, "cardLabel": "City", "columnType": "TEXT" },
      { "header": "State", "field": "state", "align": "left", "index": 6, "cardHeader": false, "cardRow": true, "cardOrder": 6, "cardLabel": "State", "columnType": "TEXT" },
      { "header": "Pin", "field": "pin_code", "align": "left", "index": 7, "cardHeader": false, "cardRow": true, "cardOrder": 7, "cardLabel": "Pin", "columnType": "TEXT" }
    ],
    "panelConfig": { "minWidth": "880px", "maxWidth": "880px", "maxHeight": "320px" },
    "selectionConfig": {
      "closeOnSelect": true,
      "displayMode": "multi",
      "displayFields": ["organization_name", "contact_person"],
      "displaySeparator": " - "
    },
    "featureFlags": { "shiftHelperEnabled": true, "autoSpaceBetweenTokens": true }
  };

  invoiceSchema: FormSchema = {
    title: 'Invoice Details',
    description: 'Enter the billing details below.',
    layout: 'standard',
    rows: [
      {
        columns: [
          {
            span: 'col-span-12',
            field: {
              key: 'partyName',
              type: 'smart-autocomplete',
              label: 'Party Search (Smart)',
              placeholder: 'Type ON:Apollo or just Apollo...',
              validators: { required: true },
              props: { smartConfig: this.pharmaConfig },
              nextControl: 'referralCode'
            }
          }
        ]
      },
      {
        columns: [
          { span: 'col-span-12 md:col-span-4', field: { key: 'referralCode', type: 'text', label: 'Referral Code', previousControl: 'partyName', nextControl: 'gstin' } },
          { span: 'col-span-12 md:col-span-8', field: { key: 'gstin', type: 'text', label: 'GSTIN', previousControl: 'referralCode' } }
        ]
      }
    ]
  };

  ngOnInit() {
    this.currentSchema.set(this.invoiceSchema);

    ShortcutManager.init();
    ShortcutManager.register('alt+i', () => this.switchMode('invoice'));
    ShortcutManager.register('alt+b', () => this.switchMode('builder'));
    ShortcutManager.register('alt+s', () => this.switchMode('showcase'));
    ShortcutManager.register('alt+p', () => this.switchMode('product'));
  }

  switchMode(mode: any) {
    this.currentMode.set(mode);
    if (mode === 'invoice') this.currentSchema.set(this.invoiceSchema);
    this.showResult = false;
  }

  async resetForm() {
    const confirmed = await this.dialogService.confirm({
      title: 'Reset Form?',
      message: 'Are you sure?',
      type: 'danger',
      confirmText: 'Reset'
    });

    if (confirmed) {
      const s = this.currentSchema();
      this.currentSchema.set(null);
      setTimeout(() => this.currentSchema.set(s), 50);
      this.showResult = false;
    }
  }

  handleFormSubmit(data: any) {
    this.submittedData = data;
    this.showResult = true;
    setTimeout(() => this.scrollToResult(), 0);
  }

  scrollToResult() {
    const el = document.getElementById('jsonResult');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  downloadData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.submittedData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}