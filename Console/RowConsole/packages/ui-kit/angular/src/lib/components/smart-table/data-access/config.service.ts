import { Injectable, signal, inject, effect } from '@angular/core';
import { DataStrategy, TableConfig } from '../models/table-config.model';
import { PersistenceService } from './persistence.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private persistenceService = inject(PersistenceService);
  // Remove static key
  // private readonly STORAGE_KEY = 'smartTableConfig'; 

  private getStorageKey(id: string): string {
    return `smart-table-config-${id}`;
  }

  private readonly initialTableConfig: TableConfig = {
    "feature": "row_contact",
    "key": "row_contact_default",
    "api": {
      "url": "CONTACT",
      "pathTable": "v1/Master/RowContact/GetAll",
      "pathExport": "v1/Master/RowContact/export",
      "method": "GET",
      "defaultPageSize": 12
    },
    "config": {
      "id": "row-contact-table",
      "title": "Contact Master",
      "primaryKey": "rowContactUniqueId",
      "dataStrategy": "SYNC",
      "pagingMode": "paginator",
      "infiniteScrollBehavior": "append",
      "paginatorPosition": "bottom",
      "stripedRows": true,
      "showGridlines": false,
      "rowHover": true,
      "globalFilterFields": ["organizationName", "contactPerson", "communicationDetail", "emailId", "createDate"],
      "enableColumnChooser": true,
      "exportConfig": {
        "enabled": true,
        "options": [
          { "label": "CSV", "key": "csv", "icon": "pi pi-file" },
          { "label": "Excel", "key": "excel", "icon": "pi pi-file-excel" },
          { "label": "PDF", "key": "pdf", "icon": "pi pi-file-pdf" }
        ]
      },
      "enableRowMenu": true,
      "enableHeaderActions": true,
      "enableSavedQueries": true,
      "enableConfigButton": true,
      "enableChipFilters": true,
      "enableMultiSelect": true,
      "enableFreeze": true,
      "defaultRows": 10,
      "role": "ADMIN",
      "toolbarButtonMode": "iconAndText",
      "toolbarActions": [
        { "label": "Refresh", "icon": "pi pi-refresh", "key": "refresh" },
        { "label": "Filter", "icon": "pi pi-filter", "key": "toggle:filter-sidebar" },
        { "label": "Config", "icon": "pi pi-cog", "key": "toggle:config-sidebar" },
        { "label": "Add Contact", "icon": "pi pi-plus", "key": "add:contacts" }
      ],
      "sizerConfig": {
        "enabled": true,
        "defaultDensity": "compact",
        "densities": [
          { "name": "comfortable", "rowHeight": 60, "cssClass": "text-base" },
          { "name": "cozy", "rowHeight": 50, "cssClass": "text-sm" },
          { "name": "compact", "rowHeight": 36, "cssClass": "text-xs" },
          { "name": "ultra-compact", "rowHeight": 28, "cssClass": "text-xs" }
        ],
        "additionalReservedSpace": 0,
        "autoSizeOffset": 0
      },
      "encryptionConfig": {
        "enabled": true,
        "encryptedFields": ["communicationDetail", "emailId"],
        "secretKey": "my-super-secret-key-for-demo"
      },
      "cardViewConfig": {
        "cardsPerRow": 4
      },
      "emptyStateConfig": {
        "enabled": true,
        "imageUrl": "",
        "title": "Your Contact List is Empty",
        "subtitle": "Get started by adding your first contact or importing from another service.",
        "actions": [
          { "label": "Add New Contact", "icon": "pi pi-plus", "key": "add:contacts", "class": "bg-indigo-600 hover:bg-indigo-700 text-white" }
        ],
        "migration": {
          "enabled": true,
          "title": "Migrate your data from third-party systems",
          "logos": [
            { "src": "https://picsum.photos/seed/zohocrm/120/30", "alt": "Zoho CRM" },
            { "src": "https://picsum.photos/seed/quickbooks/150/30", "alt": "Quickbooks" },
            { "src": "https://picsum.photos/seed/salesforce/120/30", "alt": "Salesforce" }
          ],
          "moreText": "and more",
          "action": { "label": "Import Contacts", "key": "import:contacts", "class": "bg-cyan-500 hover:bg-cyan-600 text-white" }
        }
      },
      "footerConfig": {
        "enabled": true,
        "columns": [
          {
            "code": "contactPerson",
            "aggregation": "count",
            "display": "Total Contacts: {value}"
          }
        ]
      },
      "styleConfig": {
        "enableTransparency": false,
        "headerBackgroundColor": "var(--marg-header-bg)",
        "footerBackgroundColor": "transparent",
        "borderColor": "var(--marg-border-color)",
        "backgroundImageUrl": ""
      }
    },
    "advancedFilters": {
      "enabled": true,
      "groups": [
        {
          "name": "Date Filters",
          "collapsible": true,
          "filters": [
            { "code": "createDate", "name": "Created Date", "type": "date", "dateOperators": ["in the last 30 days", "this month", "this year", "today"] }
          ]
        }
      ]
    },
    "columns": [
      {
        "index": 0,
        "name": "Select",
        "code": "select_box",
        "display": "table_cell",
        "columnType": "CHECKBOX",
        "width": "50px",
        "align": "center",
        "sortable": false,
        "filterable": false,
        "frozen": true,
        "showOnColumnChooser": false
      },
      {
        "index": 1,
        "name": "Contact Person",
        "code": "contactPerson",
        "display": "table_cell",
        "width": "250px",
        "sortable": true,
        "filterable": true,
        "frozen": true,
        "cardHeader": true,
        "listRow": true,
        "filterOnCodes": ["contactPerson", "organizationName"],
        "cellTemplate": [
          { "code": "avatarUrl", "columnType": "IMAGE", "imageConfig": { "shape": "circle" } },
          { "code": "contactPerson", "tag": "p", "bold": true },
          { "code": "organizationName", "tag": "small" }
        ]
      },
      {
        "index": 2,
        "name": "Company",
        "code": "organizationName",
        "display": "table_cell",
        "sortable": true,
        "filterable": true,
        "width": "200px"
      },
      {
        "index": 3,
        "name": "Communication",
        "code": "communicationDetail",
        "display": "table_cell",
        "width": "150px",
        "sortable": true,
        "filterable": true,
        "cardRow": true,
        "mask": {
          "enabled": true,
          "unmaskEnabled": true,
          "visibleStart": 0,
          "visibleEnd": 4,
          "maskChar": "X"
        }
      },
      {
        "index": 4,
        "name": "Email",
        "code": "emailId",
        "display": "table_cell",
        "width": "250px",
        "sortable": true,
        "filterable": true,
        "cardHeader1": true,
        "listRow": true
      },
      {
        "index": 6,
        "name": "Created",
        "code": "createDate",
        "display": "table_cell",
        "columnType": "DATE",
        "width": "180px",
        "sortable": true,
        "filterable": true
      },
      {
        "index": 8,
        "name": "Action",
        "code": "action",
        "display": "table_cell",
        "columnType": "ACTION",
        "width": "120px",
        "align": "center",
        "showOnColumnChooser": false
      }
    ],
    "rowActions": [
      { "label": "Edit", "icon": "pi pi-pencil", "action": "edit", "color": "text-blue-500" },
      { "label": "Email", "icon": "pi pi-envelope", "action": "email", "color": "text-gray-500" },
      { "label": "Delete", "icon": "pi pi-trash", "action": "delete", "color": "text-red-500" }
    ],
    "rowMenu": [
      {
        "label": "Actions",
        "items": [
          { "label": "Edit", "icon": "pi pi-pencil", "action": "edit", "shortcut": "E" },
          { "label": "Duplicate", "icon": "pi pi-copy", "action": "duplicate" },
          { "label": "Delete", "icon": "pi pi-trash", "action": "delete", "shortcut": "Del" }
        ]
      },
      {
        "label": "Communication",
        "items": [
          { "label": "Call", "icon": "pi pi-phone", "action": "call" },
          { "label": "WhatsApp", "icon": "pi pi-whatsapp", "action": "whatsapp" },
          { "label": "Email", "icon": "pi pi-envelope", "action": "email" },
          { "label": "SMS", "icon": "pi pi-comment", "action": "sms" }
        ]
      }
    ],
    "headerMenu": [
      {
        "label": "Bulk Actions",
        "items": [
          { "label": "Delete Selected", "icon": "pi pi-trash", "action": "delete_selected" }
        ]
      }
    ]
  };

  private configSignal = signal<TableConfig>(this.loadConfig());
  public readonly config = this.configSignal.asReadonly();

  constructor() {
    effect(() => {
      const currentConfig = this.configSignal();
      if (currentConfig?.config?.id) {
        const key = this.getStorageKey(currentConfig.config.id);
        this.persistenceService.saveState(key, currentConfig);
      }
    });
  }

  public initConfig(defaultConfig: TableConfig): void {
    const loaded = this.loadFromStorageOrDefault(defaultConfig);
    this.configSignal.set(loaded);
  }

  private loadConfig(): TableConfig {
    return this.loadFromStorageOrDefault(this.initialTableConfig);
  }

  private loadFromStorageOrDefault(defaultConfig: TableConfig): TableConfig {
    const key = this.getStorageKey(defaultConfig.config.id);
    const saved = this.persistenceService.loadState<TableConfig>(key);

    if (!saved) {
      return defaultConfig;
    }

    // Migration logic applied to the saved config using defaultConfig as reference

    // Migration: Ensure styleConfig exists
    if (!saved.config.styleConfig) {
      saved.config.styleConfig = {
        enableTransparency: false,
        headerBackgroundColor: 'var(--marg-header-bg)',
        footerBackgroundColor: 'var(--marg-header-bg)',
        backgroundImageUrl: ''
      };
    }

    // Ensure footerConfig exists
    if (!saved.config.footerConfig) {
      // Use defaultConfig's footerConfig if available, otherwise minimal default
      saved.config.footerConfig = defaultConfig.config.footerConfig
        ? { ...defaultConfig.config.footerConfig }
        : { enabled: true, columns: [] };
    }

    // Remove deprecated drawerConfig if it exists in saved state
    if ((saved as any).drawerConfig) {
      delete (saved as any).drawerConfig;
    }

    // Migration: Ensure sizerConfig exists and has autoSizeOffset if missing
    if (!saved.config.sizerConfig) {
      saved.config.sizerConfig = { ...defaultConfig.config.sizerConfig };
    } else {
      // partial merge for new properties like autoSizeOffset
      if (saved.config.sizerConfig.autoSizeOffset === undefined) {
        // Default to saved value, or defaultConfig value, or 0
        saved.config.sizerConfig.autoSizeOffset = defaultConfig.config.sizerConfig.autoSizeOffset ?? 0;
      }
    }

    // Migration: Ensure primaryKey exists
    if (!saved.config.primaryKey) {
      saved.config.primaryKey = defaultConfig.config.primaryKey;
    }

    // Migration: Fix old snake_case columns to camelCase
    const hasOldColumns = saved.columns.some(c => c.code === 'contact_person' || c.code === 'organization_name');
    if (hasOldColumns) {
      console.log('[ConfigService] Migrating old snake_case columns to camelCase defaults.');
      saved.columns = defaultConfig.columns;
      saved.config.globalFilterFields = defaultConfig.config.globalFilterFields;
      saved.config.footerConfig = defaultConfig.config.footerConfig;
    }

    return saved;
  }

  updateDataStrategy(strategy: DataStrategy) {
    this.configSignal.update(currentConfig => ({
      ...currentConfig,
      config: {
        ...currentConfig.config,
        dataStrategy: strategy
      }
    }));
  }

  updateInfiniteScrollBehavior(behavior: 'append' | 'replace') {
    this.configSignal.update(currentConfig => ({
      ...currentConfig,
      config: {
        ...currentConfig.config,
        infiniteScrollBehavior: behavior
      }
    }));
  }

  updateCardsPerRow(count: number) {
    this.configSignal.update(currentConfig => ({
      ...currentConfig,
      config: {
        ...currentConfig.config,
        cardViewConfig: {
          ...currentConfig.config.cardViewConfig,
          cardsPerRow: count
        }
      }
    }));
  }

  updateFullConfig(newConfig: TableConfig) {
    this.configSignal.set(newConfig);
  }

  resetToDefaults() {
    this.configSignal.set(JSON.parse(JSON.stringify(this.initialTableConfig)));
  }
}