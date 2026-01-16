import { Injectable, signal, inject, effect } from '@angular/core';
import { DataStrategy, TableConfig } from '../models/table-config.model';
import { PersistenceService } from './persistence.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private persistenceService = inject(PersistenceService);
  private readonly STORAGE_KEY = 'smartTableConfig';

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
      "dataStrategy": "SYNC",
      "pagingMode": "paginator",
      "infiniteScrollBehavior": "append",
      "paginatorPosition": "bottom",
      "stripedRows": true,
      "showGridlines": false,
      "rowHover": true,
      "globalFilterFields": ["organization_name", "contact_person", "communication_detail", "email_id", "created_time"],
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
        "additionalReservedSpace": 0
      },
      "encryptionConfig": {
        "enabled": true,
        "encryptedFields": ["communication_detail", "email_id"],
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
            "code": "contact_person",
            "aggregation": "count",
            "display": "Total Contacts: {value}"
          },
          {
            "code": "annual_revenue",
            "aggregation": "sum",
            "display": "Total Revenue: {value}"
          }
        ]
      }
    },
    "advancedFilters": {
      "enabled": true,
      "groups": [
        {
          "name": "System Defined Filters",
          "collapsible": true,
          "filters": [
            { "code": "annual_revenue", "name": "Annual Revenue", "type": "numeric", "operators": ["=", "!=", ">", "<", ">=", "<=", "between", "not between"], "defaultOperator": ">=" }
          ]
        },
        {
          "name": "Date Filters",
          "collapsible": true,
          "filters": [
             { "code": "created_time", "name": "Created Date", "type": "date", "dateOperators": ["in the last 30 days", "this month", "this year", "today"] }
          ]
        },
        {
          "name": "Lead Filters",
          "collapsible": false,
          "filters": [
            { "code": "lead_source", "name": "Lead Source", "type": "select", "options": ["Web", "Organic", "Referral"] }
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
        "code": "contact_person",
        "display": "table_cell",
        "width": "250px",
        "sortable": true,
        "filterable": true,
        "frozen": true,
        "cardHeader": true,
        "listRow": true,
        "filterOnCodes": ["contact_person", "organization_name"],
        "cellTemplate": [
            { "code": "avatar_url", "columnType": "IMAGE", "imageConfig": { "shape": "circle" } },
            { "code": "contact_person", "tag": "p", "bold": true },
            { "code": "organization_name", "tag": "small" }
        ]
      },
      {
        "index": 2,
        "name": "Company",
        "code": "organization_name",
        "display": "table_cell",
        "sortable": true,
        "filterable": true,
        "width": "200px"
      },
      {
        "index": 3,
        "name": "Communication",
        "code": "communication_detail",
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
        "code": "email_id",
        "display": "table_cell",
        "width": "250px",
        "sortable": true,
        "filterable": true,
        "cardHeader1": true,
        "listRow": true
      },
      {
        "index": 5,
        "name": "Annual Revenue",
        "code": "annual_revenue",
        "display": "table_cell",
        "align": "right",
        "sortable": true,
        "filterable": true,
        "width": "150px",
        "cardRow": true,
        "columnType": "numeric"
      },
      {
        "index": 6,
        "name": "Created",
        "code": "created_time",
        "display": "table_cell",
        "columnType": "DATE",
        "width": "180px",
        "sortable": true,
        "filterable": true
      },
      {
        "index": 7,
        "name": "Lead Source",
        "code": "lead_source",
        "display": "table_cell",
        "sortable": true,
        "filterable": true,
        "width": "150px",
        "cardRow": true,
        "listRow": true
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
    ],
    "drawerConfig": {
      "width": "400px",
      "position": "right",
      "buttons": [],
      "headerActions": []
    }
  };

  private configSignal = signal<TableConfig>(this.loadConfig());
  public readonly config = this.configSignal.asReadonly();

  constructor() {
    effect(() => {
        this.persistenceService.saveState(this.STORAGE_KEY, this.configSignal());
    });
  }

  private loadConfig(): TableConfig {
    const saved = this.persistenceService.loadState<TableConfig>(this.STORAGE_KEY);
    return saved ? saved : this.initialTableConfig;
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