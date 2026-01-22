import { Component, inject, ViewChild, AfterViewInit, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SmartTableComponent, TableConfig, SmartDrawerComponent, SmartDrawerHelperService, SmartDrawerConfig } from "../../../../ui-kit/angular/src";
import { ROW_CONTACT_TABLE_CONFIG } from './row-contact-table.config';
import { ConfigService } from '../../../../ui-kit/angular/src/lib/components/smart-table/data-access/config.service';
import { DATA_PROVIDER_TOKEN } from '../../../../ui-kit/angular/src/lib/components/smart-table/models/data-provider.interface';
import { RowContactDataService } from '../../../../core/src/lib/offline/row-contact/services/row-contact-data.service';
import { DataManagerService } from '../../../../ui-kit/angular/src/lib/components/smart-table/data-access/data-manager.service';
import { RowContactSyncHandler } from '../../../../core/src/lib/sync/handlers/row-contact-sync.service';
import { VerifyContactComponent } from './components/verify-contact/verify-contact.component';
import { SyncManagerService } from '../../../../core/src/lib/sync/management/sync-manager.service';

@Component({
    selector: 'app-row-contact-list',
    standalone: true,
    imports: [CommonModule, SmartTableComponent, SmartDrawerComponent, VerifyContactComponent],
    templateUrl: './row-contact-list.component.html',
    providers: [
        ConfigService,
        DataManagerService,
        RowContactDataService, // Provide locally so it gets the local ConfigService
        { provide: DATA_PROVIDER_TOKEN, useExisting: RowContactDataService }
    ]
})
export class RowContactListComponent implements AfterViewInit {
    // tableConfig is no longer directly used by template if SmartTable uses ConfigService internally
    // but we can keep it for reference or if we switch to Input binding later.
    tableConfig: TableConfig = ROW_CONTACT_TABLE_CONFIG;

    private configService = inject(ConfigService);
    public drawerHelper = inject(SmartDrawerHelperService);
    private syncHandler = inject(RowContactSyncHandler);
    private syncManager = inject(SyncManagerService);
    private destroyRef = inject(DestroyRef);

    drawerConfig: SmartDrawerConfig = {
        title: 'Contact Details',
        mode: 'drawer',
        showClose: true,
        showMaximize: true,
        showMinimize: true
    };

    constructor() {
        // Initialize the local ConfigService with our specific configuration, allowing persistence to override
        this.configService.initConfig(ROW_CONTACT_TABLE_CONFIG);

        // FORCE override strategy from code config to ensure development changes take effect
        // This overrides potentially stale local storage values
        if (ROW_CONTACT_TABLE_CONFIG.config.dataStrategy) {
            this.configService.updateDataStrategy(ROW_CONTACT_TABLE_CONFIG.config.dataStrategy);
        }

        // Keep drawerConfig sync'd with helper title
        effect(() => {
            const state = this.drawerHelper.currentState();
            this.drawerConfig.title = state.title || '';
        });

        console.log('[RowContactListComponent] Config Initialized.');
    }

    @ViewChild(SmartTableComponent) smartTable!: SmartTableComponent;

    ngAfterViewInit() {
        // Auto-refresh when sync finishes priming data
        // We subscribe here to ensure smartTable is available
        this.syncManager.dataPrimed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(key => {
            if (key === 'ROW_CONTACT' && this.smartTable) {
                console.log('[RowContactListComponent] Data priming detected. Refreshing table...');
                this.smartTable.resetAndFetch();
            }
        });
    }

    onToolbarAction(event: any) {
        console.log('Toolbar Action:', event);
        if (event.key === 'create') {
            this.drawerHelper.open('create', null, 'Create New Contact');
        }
    }

    onRowAction(event: any) {
        console.log('[RowContactListComponent] Row Action:', event);
        if (event.action === 'verify') {
            const data = event.row;
            this.drawerHelper.open('details', data, 'Verify Contact');
        }
        switch (event.action) {
            case 'edit':
                // this.openEditDrawer(event.row);
                break;
            case 'delete':
                // this.confirmDelete(event.row);
                break;
        }
    }
    handleSync() {
        console.log('[RowContactListComponent] Handling Sync Trigger...');

        // Listen for the first page of data to be ready
        const sub = this.syncHandler.firstPageSynced$.subscribe(() => {
            console.log('[RowContactListComponent] First page synced. Refreshing table...');
            this.smartTable.resetAndFetch();
            sub.unsubscribe(); // Clean up
        });

        this.syncHandler.syncDown().then(() => {
            console.log('[RowContactListComponent] Sync completed. Final table refresh.');
            this.smartTable.resetAndFetch();
        });
    }
}
