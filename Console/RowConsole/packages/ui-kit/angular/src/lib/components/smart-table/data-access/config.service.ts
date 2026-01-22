import { Injectable, signal, inject, effect } from '@angular/core';
import { DataStrategy, TableConfig, SMART_TABLE_DEFAULT_CONFIG } from '../models/table-config.model';
import { PersistenceService } from './persistence.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private persistenceService = inject(PersistenceService);
  private defaultConfig = inject(SMART_TABLE_DEFAULT_CONFIG, { optional: true });

  private getStorageKey(id: string): string {
    return `smart-table-config-${id}`;
  }

  // Fallback if no token is provided, though consumer SHOULD provide it
  private readonly initialTableConfig: TableConfig = this.defaultConfig ?? {
    feature: 'default_feature',
    key: 'default_key',
    api: { url: '', pathTable: '', pathExport: '', method: 'GET', defaultPageSize: 10 },
    config: {
      id: 'default-table',
      title: 'Default Table',
      dataStrategy: 'ONLINE_FIRST',
      pagingMode: 'paginator',
      paginatorPosition: 'bottom',
      enableColumnChooser: true,
      enableRowMenu: true,
      enableHeaderActions: true,
      enableSavedQueries: false,
      enableConfigButton: true,
      defaultRows: 10,
      role: 'USER',
      toolbarActions: [],
      sizerConfig: { enabled: true, defaultDensity: 'comfort', densities: [] } as any
    },
    columns: [],
    rowMenu: []
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

    // Migration: Ensure enableQuickActions exists
    if (saved.config.enableQuickActions === undefined) {
      saved.config.enableQuickActions = defaultConfig.config.enableQuickActions ?? false;
    }

    // Migration: Ensure enableRowMenuIcons exists
    if (saved.config.enableRowMenuIcons === undefined) {
      saved.config.enableRowMenuIcons = defaultConfig.config.enableRowMenuIcons ?? false;
    }

    // Migration: Ensure rowActions and rowMenu exist
    if (!saved.rowActions || saved.rowActions.length === 0) {
      saved.rowActions = defaultConfig.rowActions || [];
    }
    if (!saved.rowMenu || saved.rowMenu.length === 0) {
      saved.rowMenu = defaultConfig.rowMenu || [];
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