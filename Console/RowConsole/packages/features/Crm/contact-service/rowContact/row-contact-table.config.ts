import { TableConfig } from "../../../../ui-kit/angular/src";

export const ROW_CONTACT_TABLE_CONFIG: TableConfig = {
    feature: 'RowContact',
    key: 'RowContact',
    api: {
        url: 'https://localhost:7232/api',
        pathTable: 'v1/Master/RowContact/GetAll',
        pathExport: '/row-contact/export',
        method: 'GET',
        defaultPageSize: 10
    },
    config: {
        id: 'row-contact-table-v2',
        title: 'Row Contact List',
        primaryKey: 'rowContactUniqueId',
        dataStrategy: 'OFFLINE_FIRST',
        autoSync: false,
        pagingMode: 'paginator',
        enableColumnChooser: true,
        enableRowMenu: true,
        enableHeaderActions: true,
        enableSavedQueries: true,
        enableConfigButton: true,
        showFilterByColor: true,
        enableChipFilters: true,
        enableMultiSelect: true,
        defaultRows: 10,
        role: 'admin',
        toolbarActions: [
            { label: 'New Contact', icon: 'pi pi-plus', key: 'create' }
        ],
        sizerConfig: {
            enabled: true,
            defaultDensity: 'compact',
            autoSizeOffset: 180,
            densities: [
                { "name": "comfortable", "rowHeight": 60, "cssClass": "text-base" },
                { "name": "cozy", "rowHeight": 50, "cssClass": "text-sm" },
                { "name": "compact", "rowHeight": 36, "cssClass": "text-xs" },
                { "name": "ultra-compact", "rowHeight": 28, "cssClass": "text-xs" }
            ]
        },
        cardViewConfig: {
            cardsPerRow: 4
        },
        emptyStateConfig: {
            enabled: true,
            title: 'No Contacts Found',
            subtitle: 'Get started by adding a new contact or importing from CSV.',
            actions: [
                { label: 'Add Contact', key: 'create', icon: 'pi pi-plus', class: 'p-button-primary' }
            ]
        }
    },
    columns: [
        {
            index: 0,
            name: 'Avatar',
            code: 'avatarUrl',
            display: 'none',
            visible: false,
            showOnColumnChooser: false,
            columnType: 'IMAGE',
            cardHeader: false
        },
        {
            index: 1,
            name: 'Contact Person',
            code: 'contactPerson',
            display: 'table_cell',
            sortable: true,
            filterable: true,
            cardHeader: true,
            cellTemplate: [
                { code: 'avatarUrl', columnType: 'IMAGE', imageConfig: { shape: 'circle' } },
                { code: 'contactPerson', tag: 'p', bold: true },
                { code: 'organizationName', tag: 'small' }
            ]
        },
        {
            index: 2,
            name: 'Organization',
            code: 'organizationName',
            display: 'table_cell',
            columnType: 'TEXT',
            sortable: true,
            filterable: true,
            listRow: true,
            genericValidation: {
                minLength: 3,
                bgcolor: '#e6fffa', // Light Green (just for demo, technically it's error color but we use it for styling here)
                tooltip: 'Valid Organization'
            }
        },
        {
            index: 3,
            name: 'Email',
            code: 'emailId',
            display: 'table_cell',
            columnType: 'EMAIL',
            sortable: true,
            filterable: true,
            cardRow: true
        },
        {
            index: 4,
            name: 'Phone',
            code: 'communicationDetail',
            display: 'table_cell',
            columnType: 'MOBILE',
            sortable: true,
            filterable: true,
            cardRow: true
        },
        {
            index: 5,
            name: 'Lead Source',
            code: 'leadSource',
            display: 'table_cell',
            columnType: 'TEXT',
            sortable: true,
            filterable: true,
            cardRow: true,
            genericValidation: {
                maxLength: 4, // "Google" (6) will fail. "Web" (3) will pass.
                bgcolor: '#ffe6e6', // Light Red for long sources
                tooltip: 'Source name too long'
            }
        }
    ],
    rowMenu: [
        {
            label: 'Actions',
            items: [
                {
                    label: 'Edit s', icon: 'pi pi-pencil', action: 'edit',
                    items: [
                        { label: 'Sub Item 1', icon: 'pi pi-user', action: 'sub1' },
                        { label: 'Sub Item 2', icon: 'pi pi-cog', action: 'sub2' }
                    ]
                },
                { label: 'Delete s', icon: 'pi pi-trash', action: 'delete' }
            ]
        }
    ],
    rowActions: [
        { label: 'Edit', icon: 'pi pi-pencil', action: 'edit' },
        { label: 'Delete', icon: 'pi pi-trash', action: 'delete', color: 'text-red-500' }
    ]
};
