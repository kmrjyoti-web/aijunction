import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, WritableSignal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../data-access/config.service';
import { Contact } from '../../data-access/online-data.service';
import { TableViewComponent } from './views/table-view/table-view.component';
import { CardViewComponent } from './views/card-view/card-view.component';
import { ListViewComponent } from './views/list-view/list-view.component';
import { BiViewComponent } from './views/bi-view/bi-view.component';
import { CalendarViewComponent } from './views/calendar-view/calendar-view.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { ColumnChooserComponent } from './column-chooser/column-chooser.component';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { ConfigSidebarComponent } from './config-sidebar/config-sidebar.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { Column, ActiveFilter, DataStrategy, TableConfig } from '../../models/table-config.model';
import { mapToApiRequest } from '../../data-access/api.mapper';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableSkeletonLoaderComponent } from './views/table-view/table-skeleton-loader.component';
import { CardSkeletonLoaderComponent } from './views/card-view/card-skeleton-loader.component';
import { ListSkeletonLoaderComponent } from './views/list-view/list-skeleton-loader.component';
import { calculatePageSizeFromElement } from '../../utils/auto-height.util';
import { DataManagerService } from '../../data-access/data-manager.service';
import { SyncService } from '../../data-access/sync/sync.service';
import { ConnectionStatusService } from '../../data-access/connection-status.service';
import { AiChatbotComponent } from '../ai-chatbot/ai-chatbot.component';
import { PersistenceService } from '../../data-access/persistence.service';
import { SavedQuery, SavedQueryState } from '../../models/saved-query.model';
import { SavedQueriesService } from '../../data-access/saved-queries.service';
import { SaveQueryModalComponent } from './save-query-modal/save-query-modal.component';
import { SavedQueriesMenuComponent } from './saved-queries-menu/saved-queries-menu.component';
import { CustomLayout } from '../../models/custom-layout.model';
import { CustomLayoutService } from '../../data-access/custom-layout.service';
import { UiGalleryComponent } from '../ui-gallery/ui-gallery.component';
import { GenerateLayoutEvent } from '../ui-gallery/create-layout-modal/create-layout-modal.component';
import { Theme, ThemeService } from '../../services/theme.service';
import { CalendarConfigModalComponent } from './calendar-config-modal/calendar-config-modal.component';
import { DensityService } from '../../services/density.service';
import { DensityChooserComponent } from './density-chooser/density-chooser.component';
import { AiSummaryService } from '../../ai-utility/ai-summary.service';
import { AiLayoutService } from '../../ai-utility/ai-layout.service';
import { AiChatbotService, AiFilterRequest } from '../../ai-utility/ai-chatbot.service';
import { SyncOptionsModalComponent } from './sync-options-modal/sync-options-modal.component';
import { ChipFilterService } from '../../data-access/chip-filter.service';
import { Chip, DisplayChip } from '../../models/chip.model';
import { AddChipModalComponent } from './add-chip-modal/add-chip-modal.component';
import { ChipFilterBarComponent } from './chip-filter-bar/chip-filter-bar.component';
import { KeyboardNavigationManager } from '../../utils/keyboard-navigation.util';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { ExportService } from '../../services/export.service';
import { EmptyViewComponent } from '../shared/empty-view/empty-view.component';
import { ToolbarButtonComponent } from '../../../toolbar-button/toolbar-button.component';

type ViewMode = 'table' | 'card' | 'list' | 'bi' | 'calendar';

// Defines the shape of the state object saved to localStorage.
interface TableState {
  viewMode: ViewMode;
  currentPage: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  globalFilterTerm: string;
  advancedFilters: { [key: string]: ActiveFilter };
  visibleColumnCodes: string[];
  activeLayouts: { card: string | null, list: string | null, table: string | null };
}


@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, TableViewComponent, CardViewComponent, ListViewComponent, BiViewComponent, CalendarViewComponent, PaginatorComponent, ColumnChooserComponent, ClickOutsideDirective, TableSkeletonLoaderComponent, CardSkeletonLoaderComponent, ListSkeletonLoaderComponent, FilterSidebarComponent, ConfigSidebarComponent, AiChatbotComponent, SaveQueryModalComponent, UiGalleryComponent, CalendarConfigModalComponent, SyncOptionsModalComponent, AddChipModalComponent, ChipFilterBarComponent, ThemeSettingsComponent, EmptyViewComponent, ToolbarButtonComponent],
  templateUrl: './smart-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  }
})
export class SmartTableComponent {
  private configService = inject(ConfigService);
  private dataManager = inject(DataManagerService);
  public syncService = inject(SyncService);
  private connectionStatusService = inject(ConnectionStatusService);
  private persistenceService = inject(PersistenceService);
  private savedQueriesService = inject(SavedQueriesService);
  private customLayoutService = inject(CustomLayoutService);
  public themeService = inject(ThemeService);
  private densityService = inject(DensityService);
  private aiSummaryService = inject(AiSummaryService);
  private aiLayoutService = inject(AiLayoutService);
  private chipFilterService = inject(ChipFilterService);
  private exportService = inject(ExportService);

  config = this.configService.config;
  data = signal<Contact[]>([]);
  totalRecords = signal(0);
  loading = signal(true);

  // AI State
  showAiActions = signal(false);
  isAiLoading = signal(false);
  aiModalContent = signal<{ title: string, content: string } | null>(null);
  showChatbot = signal(false);

  // Saved Queries State
  showSavedQueriesMenu = signal(false);
  showSaveQueryModal = signal(false);
  savedQueries = signal<SavedQuery[]>([]);

  // UI Gallery State
  showUiGallery = signal(false);
  customLayouts = signal<CustomLayout[]>([]);
  activeLayouts: WritableSignal<{ card: string | null, list: string | null, table: string | null }>;

  // Calendar View State
  showCalendarConfigModal = signal(false);
  activeCalendarConfig = signal<{ dateFieldCode: string } | null>(null);

  // Sync Modal State
  showSyncOptionsModal = signal(false);

  // Chip Filter State
  showAddChipModal = signal(false);
  chips = this.chipFilterService.chips;

  // Export State
  showExportOptions = signal(false);
  isExporting = signal(false);
  exportingMessage = signal('');

  // Responsive state
  isMobile = signal(window.innerWidth < 640);

  // State Signals
  viewMode: WritableSignal<ViewMode>;
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  sortColumn: WritableSignal<string | null>;
  sortDirection: WritableSignal<'asc' | 'desc'>;
  globalFilterTerm: WritableSignal<string>;
  advancedFilters: WritableSignal<{ [key: string]: ActiveFilter }>;

  showFilterSidebar = signal(false);
  showConfigSidebar = signal(false);
  showThemeSettings = signal(false);
  showFreezeOptions = signal(false);

  showColumnChooser = signal(false);
  showCardsPerRowChooser = signal(false);
  showViewOptions = signal(false);
  showFilterMenu = signal(false);
  showMobileActionsMenu = signal(false);
  allTableColumns = signal<Column[]>([]);
  visibleTableColumns = signal<Column[]>([]);

  scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  // Page sizing state
  autoSizingEnabled = signal(this.config().config.sizerConfig.enabled);

  // Density state from the new service
  currentDensity = this.densityService.density;
  currentDensitySetting = computed(() => {
    const densityName = this.currentDensity();
    const sizerConfig = this.config().config.sizerConfig;
    return sizerConfig.densities.find(d => d.name === densityName) ?? sizerConfig.densities[1];
  });

  // Keyboard navigation state
  keyboardActiveRowIndex = signal<number | null>(null);
  private selectionAnchorIndex = signal<number | null>(null);
  private keyboardManager = new KeyboardNavigationManager();
  private postFetchFocus = signal<'first' | 'last' | null>(null);

  // Data Strategy state
  showStrategyChooser = signal(false);
  readonly dataStrategies: DataStrategy[] = ['SYNC', 'ONLINE_FIRST', 'OFFLINE_FIRST', 'HYBRID'];
  readonly strategyDescriptions: { [key in DataStrategy]: string } = {
    'SYNC': "Fast, offline access. Data is synced with the server in the background.",
    'ONLINE_FIRST': "Always fetches the latest data from the server. Falls back to local data if the server is unavailable.",
    'OFFLINE_FIRST': "Loads instantly from your device. May not be the absolute latest data.",
    'HYBRID': "Fetches latest data and updates your device for offline use. Falls back to local data if the server is unavailable."
  };

  // Infinite Scroll state
  isInfiniteScroll = computed(() => this.config().config.pagingMode === 'infinite');

  totalPages = computed(() => {
    const total = this.totalRecords();
    const size = this.pageSize();
    if (size <= 0) {
      return 0;
    }
    return Math.ceil(total / size);
  });

  allDataLoaded = computed(() => {
    const total = this.totalRecords();
    if (total === 0 && this.data().length > 0) return false;
    if (total === 0) return true;

    const behavior = this.config().config.infiniteScrollBehavior ?? 'append';
    if (behavior === 'append') {
      return this.data().length >= total;
    } else { // 'replace' mode
      return this.currentPage() >= this.totalPages();
    }
  });

  chooserColumns = computed(() => this.allTableColumns().filter(c => c.showOnColumnChooser !== false));
  dateColumns = computed(() => this.allTableColumns().filter(c => c.columnType === 'DATE'));

  connectionStatus = computed(() => {
    const status = this.connectionStatusService.status();
    switch (status) {
      case 'Online':
        return { text: 'Online', class: 'bg-green-500' };
      case 'Connecting':
        return { text: 'Connecting...', class: 'bg-yellow-500 animate-pulse' };
      case 'Offline':
        return { text: 'Offline', class: 'bg-red-500' };
      default:
        return { text: 'Unknown', class: 'bg-gray-500' };
    }
  });

  aiModalFormattedContent = computed(() => {
    const modal = this.aiModalContent();
    if (!modal || !modal.content) {
      return { title: '', content: '' };
    }
    let formatted = modal.content;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (formatted.match(/^\* .*/m)) {
      formatted = '<ul>' + formatted.replace(/^\* (.*)$/gm, '<li class="ml-4 list-disc">$1</li>') + '</ul>';
    }
    return { title: modal.title, content: formatted };
  });

  activeCustomTemplate = computed(() => {
    const layouts = this.customLayouts();
    const activeIds = this.activeLayouts();
    const currentView = this.viewMode();

    let activeId: string | null = null;
    if (currentView === 'card') activeId = activeIds.card;
    if (currentView === 'list') activeId = activeIds.list;
    if (currentView === 'table') activeId = activeIds.table;

    if (!activeId) return null;

    const layout = layouts.find(l => l.id === activeId);
    return layout ? layout.htmlTemplate : null;
  });

  calculatedChips = computed<DisplayChip[]>(() => {
    // This calculation is based on currently loaded data, not the entire dataset on the server.
    const allData = this.data();
    const chipConfigs = this.chips();

    if (allData.length === 0 || chipConfigs.length === 0) {
      return [];
    }

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const numberFormatter = new Intl.NumberFormat('en-US');

    return chipConfigs.map(chip => {
      let value: number;
      let displayValue: string;
      let dataSet = allData;

      if (chip.aggregation === 'count' && chip.filterValue) {
        dataSet = allData.filter(item => String(item[chip.columnCode]).toLowerCase() === String(chip.filterValue).toLowerCase());
      }

      switch (chip.aggregation) {
        case 'count':
          value = dataSet.length;
          displayValue = numberFormatter.format(value);
          break;
        case 'sum':
          value = dataSet.reduce((acc, item) => acc + (Number(item[chip.columnCode]) || 0), 0);
          displayValue = currencyFormatter.format(value);
          break;
        case 'average':
          const total = dataSet.reduce((acc, item) => acc + (Number(item[chip.columnCode]) || 0), 0);
          value = dataSet.length > 0 ? total / dataSet.length : 0;
          displayValue = currencyFormatter.format(value);
          break;
        default:
          value = 0;
          displayValue = 'N/A';
      }

      return { ...chip, displayValue };
    });
  });

  private searchSubject = new Subject<string>();
  private lastFocusedElementId = signal<string | null>(null);
  private initialFetchDone = signal(false);
  private readonly initialState: Omit<TableState, 'visibleColumnCodes'>;

  // Selection state
  selectedIds = signal(new Set<number>());

  constructor() {
    // 1. Define initial state defaults
    this.initialState = {
      viewMode: this.isMobile() ? 'card' : 'table',
      currentPage: 1,
      pageSize: this.config().api.defaultPageSize,
      sortColumn: 'organization_name',
      sortDirection: 'asc',
      globalFilterTerm: '',
      advancedFilters: {},
      activeLayouts: { card: null, list: null, table: null },
    };

    // 2. Load saved state from persistence
    const savedState = this.persistenceService.loadState<TableState>('smartTableState');

    // 3. Initialize signals with saved state or defaults
    this.viewMode = signal(savedState?.viewMode ?? this.initialState.viewMode);
    this.currentPage = signal(savedState?.currentPage ?? this.initialState.currentPage);
    this.pageSize = signal(savedState?.pageSize ?? this.initialState.pageSize);
    this.sortColumn = signal(savedState?.sortColumn ?? this.initialState.sortColumn);
    this.sortDirection = signal(savedState?.sortDirection ?? this.initialState.sortDirection);
    this.globalFilterTerm = signal(savedState?.globalFilterTerm ?? this.initialState.globalFilterTerm);
    this.advancedFilters = signal(savedState?.advancedFilters ?? this.initialState.advancedFilters);
    this.activeLayouts = signal(savedState?.activeLayouts ?? this.initialState.activeLayouts);

    this.loadSavedQueries();
    this.loadCustomLayouts();

    const performInitialFetch = () => {
      this.loading.set(true);
      const restoredPage = this.currentPage();

      if (this.isInfiniteScroll() && this.config().config.infiniteScrollBehavior === 'append' && restoredPage > 1) {
        // Restore state for infinite scroll by fetching all pages up to the restored one.
        this.fetchPagesSequentially(restoredPage).then(() => {
          this.initialFetchDone.set(true);
        });
      } else {
        // For paginator mode, 'replace' mode, or first page of infinite scroll.
        // In 'replace' mode, we always want page 1.
        const pageToFetch = (this.isInfiniteScroll() && this.config().config.infiniteScrollBehavior === 'replace') ? 1 : restoredPage;
        if (this.isInfiniteScroll() && this.config().config.infiniteScrollBehavior === 'replace') {
          this.currentPage.set(1);
        }
        this.fetchPage(pageToFetch);
        this.initialFetchDone.set(true);
      }
    };

    // This effect handles SYNC mode fetching whenever conditions are met.
    effect(() => {
      const isSync = this.config().config.dataStrategy === 'SYNC';
      if (isSync && this.syncService.isPrimed() && !this.initialFetchDone()) {
        performInitialFetch();

        if (this.showSyncOptionsModal()) {
          setTimeout(() => this.showSyncOptionsModal.set(false), 500);
        }
      }
    }, { allowSignalWrites: true });

    // Initial data source setup. This runs only ONCE at component creation.
    const strategy = this.config().config.dataStrategy;
    if (strategy === 'SYNC') {
      if (this.syncService.isPrimed()) {
        performInitialFetch();
      } else {
        this.showSyncOptionsModal.set(true);
        this.loading.set(false);
      }
    } else {
      performInitialFetch();
    }

    // This effect MUST run before the persistence effect to set up columns correctly.
    effect(() => {
      const all = [...this.config().columns].sort((a, b) => a.index - b.index);
      this.allTableColumns.set(all);

      const defaultVisibleCodes = all.filter(c => c.display === 'table_cell').map(c => c.code);
      const visibleCodes = new Set(savedState?.visibleColumnCodes ?? defaultVisibleCodes);

      this.visibleTableColumns.set(all.filter(c => visibleCodes.has(c.code)));
    }, { allowSignalWrites: true });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.globalFilterTerm.set(searchTerm);
      this.resetAndFetch();
    });

    effect(() => {
      const isLoading = this.loading();
      const lastFocusedId = this.lastFocusedElementId();
      if (!isLoading && lastFocusedId) {
        setTimeout(() => {
          const elementToFocus = document.getElementById(lastFocusedId);
          if (elementToFocus) {
            elementToFocus.focus();
            if (elementToFocus instanceof HTMLInputElement) {
              elementToFocus.select();
            }
          }
          this.lastFocusedElementId.set(null);
        }, 0);
      }
    });

    effect((onCleanup) => {
      const density = this.currentDensity();
      const sizerConfig = this.config().config.sizerConfig;

      const handleResize = () => {
        this.isMobile.set(window.innerWidth < 640);
        if (this.autoSizingEnabled()) {
          const containerEl = this.scrollContainer()?.nativeElement;
          if (containerEl) {
            const densitySetting = sizerConfig.densities.find(d => d.name === density) ?? sizerConfig.densities[1];
            const rowHeight = densitySetting.rowHeight;
            const reservedSpace = sizerConfig.additionalReservedSpace ?? 0;
            const newSize = calculatePageSizeFromElement(containerEl, rowHeight, reservedSpace);

            if (newSize !== this.pageSize()) {
              this.pageSize.set(newSize);
              this.resetAndFetch();
            }
          }
        }
      };

      window.addEventListener('resize', handleResize);

      // We need to wait for the view to be initialized to get the element reference.
      // A small timeout ensures that the container element is rendered before we calculate.
      setTimeout(() => handleResize(), 50);

      onCleanup(() => window.removeEventListener('resize', handleResize));
    }, { allowSignalWrites: true });

    this.setupStatePersistence();
  }

  private setupStatePersistence(): void {
    effect(() => {
      const state: TableState = {
        viewMode: this.viewMode(),
        currentPage: this.currentPage(),
        pageSize: this.pageSize(),
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDirection(),
        globalFilterTerm: this.globalFilterTerm(),
        advancedFilters: this.advancedFilters(),
        visibleColumnCodes: this.visibleTableColumns().map(c => c.code),
        activeLayouts: this.activeLayouts(),
      };
      this.persistenceService.saveState('smartTableState', state);
    });
  }

  resetViewAndFilters(): void {
    this.persistenceService.clearState('smartTableState');
    this.densityService.setDensity(this.config().config.sizerConfig.defaultDensity);

    this.viewMode.set(this.initialState.viewMode);
    this.currentPage.set(this.initialState.currentPage);
    this.pageSize.set(this.initialState.pageSize);
    this.sortColumn.set(this.initialState.sortColumn);
    this.sortDirection.set(this.initialState.sortDirection);
    this.globalFilterTerm.set('');
    this.advancedFilters.set(this.initialState.advancedFilters);
    this.visibleTableColumns.set(this.allTableColumns().filter(c => c.display === 'table_cell'));
    this.activeLayouts.set(this.initialState.activeLayouts);

    this.showViewOptions.set(false);
    this.resetAndFetch();
  }

  async handleAiAction(action: 'narrate' | 'insights' | 'adopt' | 'metrics'): Promise<void> {
    this.showAiActions.set(false);
    this.isAiLoading.set(true);
    try {
      switch (action) {
        case 'narrate':
          const narration = await this.aiSummaryService.generateNarration(this.data(), this.allTableColumns());
          this.aiModalContent.set({ title: 'Data Narration', content: narration });
          break;
        case 'insights':
          const insights = await this.aiSummaryService.suggestInsights(this.data(), this.allTableColumns());
          this.aiModalContent.set({ title: 'Suggested Insights', content: insights });
          break;
        case 'adopt':
          const newConfig = await this.aiLayoutService.getAutoAdoptedConfig(this.config(), window.innerWidth);
          this.configService.updateFullConfig(newConfig);
          break;
        case 'metrics':
          const metrics = await this.aiSummaryService.getQuickMetrics(this.data(), this.allTableColumns());
          this.aiModalContent.set({ title: 'Key Metrics', content: metrics });
          break;
      }
    } catch (error) {
      console.error(`AI Action '${action}' failed:`, error);
      this.aiModalContent.set({ title: 'Error', content: 'An error occurred while processing the AI request.' });
    } finally {
      this.isAiLoading.set(false);
    }
  }

  handleAiFilter(filter: AiFilterRequest): void {
    if (filter.globalSearch) {
      this.globalFilterTerm.set(filter.globalSearch);
      this.advancedFilters.set({});
    } else if (filter.advancedFilters && filter.advancedFilters.length > 0) {
      const newFilters: { [key: string]: ActiveFilter } = {};
      for (const f of filter.advancedFilters) {
        newFilters[f.code] = f;
      }
      this.advancedFilters.set(newFilters);
      this.globalFilterTerm.set('');
    }
    this.resetAndFetch();
  }

  // --- Saved Queries ---
  loadSavedQueries(): void {
    this.savedQueriesService.getSavedQueries().subscribe(queries => {
      this.savedQueries.set(queries);
    });
  }

  openSaveQueryModal(): void {
    this.showSavedQueriesMenu.set(false);
    this.showSaveQueryModal.set(true);
  }

  handleSaveQuery(name: string): void {
    this.showSaveQueryModal.set(false);
    const state: SavedQueryState = {
      globalFilterTerm: this.globalFilterTerm(),
      advancedFilters: this.advancedFilters(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
    };
    this.savedQueriesService.saveQuery(name, state).subscribe(() => {
      this.loadSavedQueries();
    });
  }

  handleApplySavedQuery(queryId: string): void {
    this.showSavedQueriesMenu.set(false);
    const query = this.savedQueries().find(q => q.id === queryId);
    if (query) {
      const state = query.state;
      this.globalFilterTerm.set(state.globalFilterTerm ?? this.initialState.globalFilterTerm);
      this.advancedFilters.set(state.advancedFilters ?? this.initialState.advancedFilters);
      this.sortColumn.set(state.sortColumn ?? this.initialState.sortColumn);
      this.sortDirection.set(state.sortDirection ?? this.initialState.sortDirection);
      this.resetAndFetch();
    }
  }

  handleDeleteSavedQuery(queryId: string): void {
    this.savedQueriesService.deleteQuery(queryId).subscribe(() => {
      this.loadSavedQueries();
    });
  }

  // --- UI Gallery ---
  loadCustomLayouts(): void {
    this.customLayoutService.getLayouts().subscribe(layouts => {
      this.customLayouts.set(layouts);
    });
  }

  async handleGenerateLayout(event: GenerateLayoutEvent): Promise<void> {
    this.isAiLoading.set(true);
    try {
      const result = await this.aiLayoutService.generateLayout(event.prompt, event.targetView, this.allTableColumns());
      this.customLayoutService.saveLayout({
        name: event.name,
        targetView: event.targetView,
        htmlTemplate: result.htmlTemplate
      }).subscribe(() => {
        this.loadCustomLayouts();
      });
    } catch (error) {
      console.error('AI layout generation failed:', error);
      this.aiModalContent.set({ title: 'Layout Generation Error', content: 'An error occurred while generating the layout.' });
    } finally {
      this.isAiLoading.set(false);
    }
  }

  handleApplyLayout(event: { view: string, layoutId: string | null }): void {
    const { view, layoutId } = event;
    this.activeLayouts.update(current => {
      const newLayouts = { ...current };
      if (view === 'card') newLayouts.card = layoutId;
      if (view === 'list') newLayouts.list = layoutId;
      if (view === 'table') newLayouts.table = layoutId;
      return newLayouts;
    });
  }

  handleDeleteLayout(layoutId: string): void {
    this.customLayoutService.deleteLayout(layoutId).subscribe(() => {
      this.loadCustomLayouts();
    });
  }

  // --- Chip Filters ---
  handleAddChip(chipConfig: Omit<Chip, 'id'>): void {
    this.chipFilterService.addChip(chipConfig);
    this.showAddChipModal.set(false);
  }

  handleRemoveChip(chipId: string): void {
    this.chipFilterService.removeChip(chipId);
  }

  handleApplyChipFilter(chip: DisplayChip): void {
    const column = this.allTableColumns().find(c => c.code === chip.columnCode);
    if (!column || !chip.filterValue) return;

    const newFilter: ActiveFilter = {
      code: chip.columnCode,
      name: column.name,
      type: 'select',
      operator: '=',
      value1: chip.filterValue,
    };

    this.advancedFilters.set({ [newFilter.code]: newFilter });
    this.resetAndFetch();
  }

  // --- Density Control ---
  setDensity(density: any): void { // Using any to avoid importing Density type if not strictly needed, or I should import it.
    // Actually, Density is imported in the file line 38?? No, line 5.
    this.densityService.setDensity(density);
  }

  getDensityIcon(density: string): string {
    switch (density) {
      case 'comfortable': return 'pi-align-justify';
      case 'cozy': return 'pi-bars';
      case 'compact': return 'pi-table';
      case 'ultra-compact': return 'pi-compress';
      default: return 'pi-table';
    }
  }

  // --- Column Freezing ---
  handleFreezeColumns(count: number): void {
    this.showFreezeOptions.set(false);
    const currentConfig = this.config();
    const newConfig = JSON.parse(JSON.stringify(currentConfig)) as TableConfig;

    const visibleCodes = this.visibleTableColumns().map(c => c.code);

    newConfig.columns.forEach((col: Column) => {
      const visibleIndex = visibleCodes.indexOf(col.code);
      if (visibleIndex !== -1) { // It's a visible column
        col.frozen = visibleIndex < count;
      } else { // Not a visible column, ensure it's not frozen
        col.frozen = false;
      }
    });

    this.configService.updateFullConfig(newConfig);
  }

  private checkAndFetchForFill(): void {
    // Use a small timeout to allow the DOM to update with the new data
    setTimeout(() => {
      const config = this.config().config;
      // Only run in infinite scroll 'append' mode
      if (config.pagingMode !== 'infinite' || config.infiniteScrollBehavior !== 'append') {
        return;
      }

      const containerEl = this.scrollContainer()?.nativeElement;
      // Check if container exists, not all data is loaded, and there's no scrollbar
      if (containerEl && !this.allDataLoaded() && containerEl.scrollHeight <= containerEl.clientHeight) {
        if (!this.loading()) { // Guard to prevent race conditions
          this.fetchMoreData();
        }
      }
    }, 100);
  }

  private async fetchPagesSequentially(pageCount: number) {
    if (pageCount < 1) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    // Reset state for sequential loading
    this.currentPage.set(0);
    this.data.set([]);

    try {
      for (let i = 1; i <= pageCount; i++) {
        await this.fetchAndAppendPage(i);
      }
    } catch (e) {
      // Error is logged in fetchAndAppendPage
    } finally {
      this.loading.set(false);
      this.checkAndFetchForFill();
    }
  }

  private fetchAndAppendPage(page: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = mapToApiRequest(
        page, this.pageSize(), this.sortColumn(), this.sortDirection(),
        this.globalFilterTerm(), this.advancedFilters(), this.config().columns
      );

      this.dataManager.getData(request).subscribe({
        next: response => {
          this.data.update(currentData => [...currentData, ...response.data]);
          this.totalRecords.set(response.total_records);
          this.currentPage.set(page);
          resolve();
        },
        error: err => {
          console.error(`Failed to fetch page ${page}`, err);
          this.loading.set(false);
          reject(err);
        }
      });
    });
  }

  fetchPage(page: number): void {
    if (page < 1) return;
    this.loading.set(true);

    const request = mapToApiRequest(
      page, this.pageSize(), this.sortColumn(), this.sortDirection(),
      this.globalFilterTerm(), this.advancedFilters(), this.config().columns
    );

    this.dataManager.getData(request).subscribe({
      next: response => {
        this.data.set(response.data);
        this.totalRecords.set(response.total_records);
        this.currentPage.set(page);
        this.loading.set(false);

        this.checkAndFetchForFill();

        const focus = this.postFetchFocus();
        const newData = this.data();
        if (focus === 'first' && newData.length > 0) {
          this.keyboardActiveRowIndex.set(0);
          this.scrollActiveItemIntoView(newData[0].organization_id);
        } else if (focus === 'last' && newData.length > 0) {
          const lastIndex = newData.length - 1;
          this.keyboardActiveRowIndex.set(lastIndex);
          this.scrollActiveItemIntoView(newData[lastIndex].organization_id);
        } else {
          this.keyboardActiveRowIndex.set(null);
        }
        this.postFetchFocus.set(null);
      },
      error: err => {
        console.error("Failed to fetch data", err);
        this.loading.set(false);
      }
    });
  }

  fetchMoreData(): void {
    if (this.loading() || !this.isInfiniteScroll() || this.allDataLoaded()) {
      return;
    }

    this.loading.set(true);
    const nextPage = this.currentPage() + 1;
    const request = mapToApiRequest(
      nextPage, this.pageSize(), this.sortColumn(), this.sortDirection(),
      this.globalFilterTerm(), this.advancedFilters(), this.config().columns
    );

    const behavior = this.config().config.infiniteScrollBehavior ?? 'append';

    this.dataManager.getData(request).subscribe({
      next: response => {
        if (behavior === 'append') {
          this.data.update(currentData => [...currentData, ...response.data]);
        } else { // 'replace'
          this.data.set(response.data);
          this.scrollContainer()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.totalRecords.set(response.total_records);
        this.currentPage.set(nextPage);
        this.loading.set(false);
        this.checkAndFetchForFill();
      },
      error: err => {
        console.error("Failed to fetch more data", err);
        this.loading.set(false);
      }
    });
  }

  // --- Data Fetching and Resetting ---
  private resetAndFetch(): void {
    this.currentPage.set(1);
    this.keyboardActiveRowIndex.set(null);
    this.selectedIds.set(new Set()); // Clear selection on re-fetch

    if (this.isInfiniteScroll()) {
      this.data.set([]);
    }

    this.fetchPage(1);
  }

  // --- Event Handlers ---
  handleSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn.set(event.column);
    this.sortDirection.set(event.direction);
    this.resetAndFetch();
  }

  onGlobalSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  handleFilterChange(event: { code: string; filter: ActiveFilter | null }): void {
    this.advancedFilters.update(currentFilters => {
      const newFilters = { ...currentFilters };
      if (event.filter) {
        newFilters[event.code] = event.filter;
      } else {
        delete newFilters[event.code];
      }
      return newFilters;
    });
    this.resetAndFetch();
  }

  handlePageChange(page: number): void {
    if (this.isInfiniteScroll()) return;
    this.currentPage.set(page);
    this.fetchPage(page);
    this.selectedIds.set(new Set());
  }

  onContentScroll(event: Event): void {
    if (!this.isInfiniteScroll()) {
      return;
    }

    const element = event.target as HTMLElement;
    const threshold = 100; // pixels from the bottom
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (position >= height - threshold) {
      this.fetchMoreData();
    }
  }

  handlePageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.resetAndFetch();
  }

  handleAutoSizingToggle(): void {
    this.autoSizingEnabled.update(enabled => !enabled);
    if (this.autoSizingEnabled()) {
      const containerEl = this.scrollContainer()?.nativeElement;
      if (containerEl) {
        const density = this.currentDensity();
        const sizerConfig = this.config().config.sizerConfig;
        const densitySetting = sizerConfig.densities.find(d => d.name === density) ?? sizerConfig.densities[1];
        const rowHeight = densitySetting.rowHeight;
        const reservedSpace = sizerConfig.additionalReservedSpace ?? 0;
        const newSize = calculatePageSizeFromElement(containerEl, rowHeight, reservedSpace);
        if (newSize !== this.pageSize()) {
          this.pageSize.set(newSize);
          this.resetAndFetch();
        }
      }
    }
  }

  handleApplyFilters(filters: { [key: string]: ActiveFilter }): void {
    this.advancedFilters.set(filters);
    this.resetAndFetch();
    this.showFilterSidebar.set(false);
  }

  handleRowClick(contact: Contact): void {
    const index = this.data().findIndex(item => item.organization_id === contact.organization_id);
    if (index > -1) {
      this.keyboardActiveRowIndex.set(index);
      this.selectionAnchorIndex.set(index); // Set anchor on direct interaction
    }
  }

  handleSelectionChange(newSelection: Set<number>): void {
    this.selectedIds.set(newSelection);
    // Note: We cannot reliably update the anchor here without knowing which item was last toggled.
    // The anchor is primarily managed by direct click and keyboard navigation.
  }

  private toggleSelectionByIndex(index: number): void {
    if (index < 0 || index >= this.data().length) return;

    const rowId = this.data()[index].organization_id;
    const newSelection = new Set(this.selectedIds());
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    this.selectedIds.set(newSelection);
  }

  changeView(mode: ViewMode): void {
    if (mode === 'calendar' && !this.activeCalendarConfig()) {
      this.showCalendarConfigModal.set(true);
      return;
    }
    this.viewMode.set(mode);
    this.showViewOptions.set(false);
  }

  toggleColumnVisibility(column: Column): void {
    this.visibleTableColumns.update(currentCols => {
      const isVisible = currentCols.some(c => c.code === column.code);
      if (isVisible) {
        return currentCols.filter(c => c.code !== column.code);
      } else {
        // Add column back in its original order
        const newCols: Column[] = [];
        for (const allCol of this.allTableColumns()) {
          if (currentCols.some(c => c.code === allCol.code) || allCol.code === column.code) {
            newCols.push(allCol);
          }
        }
        return newCols;
      }
    });
  }

  handleVisibleColumnReorder(reorderedColumns: Column[]): void {
    this.visibleTableColumns.set(reorderedColumns);
  }

  handleAllColumnsOrderChange(reorderedColumns: Column[]): void {
    // This updates the master order of all columns
    this.allTableColumns.set(reorderedColumns);
    // This updates the visible columns to respect the new master order
    this.visibleTableColumns.update(currentVisible => {
      const visibleCodes = new Set(currentVisible.map(c => c.code));
      return reorderedColumns.filter(c => visibleCodes.has(c.code));
    });
  }

  handleRowAction(event: { action: string; row: Contact }): void {
    const { action, row } = event;
    const phone = row.communication_detail?.replace(/\D/g, '');

    switch (action) {
      case 'call':
        if (phone) window.location.href = `tel:${phone}`;
        break;
      case 'whatsapp':
        if (phone) window.open(`https://wa.me/${phone}`, '_blank');
        break;
      case 'email':
        if (row.email_id) window.location.href = `mailto:${row.email_id}`;
        break;
      case 'sms':
        if (phone) window.location.href = `sms:${phone}`;
        break;
      default:
        console.log('Unhandled row action:', action, 'on row:', row);
        break;
    }
  }

  handleHeaderAction(event: { action: string; selectedIds: number[] }): void {
    console.log('Header action:', event.action, 'on IDs:', event.selectedIds);
    // Implement logic for bulk actions
  }

  handleToolbarAction(key: string): void {
    switch (key) {
      case 'refresh':
        this.resetAndFetch();
        break;
      case 'toggle:filter-sidebar':
        this.showFilterSidebar.update(v => !v);
        break;
      case 'toggle:config-sidebar':
        this.showConfigSidebar.update(v => !v);
        break;
      case 'toggle:theme-settings':
        this.showThemeSettings.update(v => !v);
        break;
      case 'add:contacts':
        console.log('Add new contact clicked');
        // Logic to open a form/drawer for adding a new contact
        break;
      // Handle export actions, etc.
      default:
        console.log('Toolbar action:', key);
    }
  }

  handleEmptyStateAction(key: string): void {
    console.log('Empty state action triggered:', key);
    // Delegate to the main toolbar action handler
    this.handleToolbarAction(key);
  }

  handleConfigSave(newConfig: TableConfig): void {
    this.configService.updateFullConfig(newConfig);
    this.showConfigSidebar.set(false);
  }

  handleConfigReset(): void {
    this.configService.resetToDefaults();
    this.showConfigSidebar.set(false);
  }

  handleCardsPerRowChange(count: number): void {
    this.configService.updateCardsPerRow(count);
  }

  changeDataStrategy(strategy: DataStrategy): void {
    this.showStrategyChooser.set(false);
    if (strategy === 'SYNC') {
      this.showSyncOptionsModal.set(true);
    } else {
      this.configService.updateDataStrategy(strategy);
      this.initialFetchDone.set(false);
      this.resetAndFetch();
    }
  }

  handleStartSync(): void {
    this.configService.updateDataStrategy('SYNC');
    this.initialFetchDone.set(false);
    this.syncService.startFullSync();
  }

  handleManualSync(): void {
    this.syncService.startFullSync();
  }

  toggleInfiniteScrollBehavior(): void {
    const currentBehavior = this.config().config.infiniteScrollBehavior ?? 'append';
    const newBehavior = currentBehavior === 'append' ? 'replace' : 'append';
    this.configService.updateInfiniteScrollBehavior(newBehavior);
    this.resetAndFetch(); // Reset and fetch to apply new behavior
  }

  handleApplyCalendarConfig(config: { dateFieldCode: string }): void {
    this.activeCalendarConfig.set(config);
    this.showCalendarConfigModal.set(false);
    this.viewMode.set('calendar');
  }

  async handleExport(format: 'csv' | 'pdf' | 'excel'): Promise<void> {
    this.showExportOptions.set(false);
    const total = this.totalRecords();
    if (total === 0) {
      console.warn('No data to export.');
      return;
    }

    this.isExporting.set(true);
    this.exportingMessage.set(`Fetching all ${total} records for export...`);

    // Request all data based on current filters and sorting.
    const request = mapToApiRequest(
      1,
      total,
      this.sortColumn(),
      this.sortDirection(),
      this.globalFilterTerm(),
      this.advancedFilters(),
      this.config().columns
    );

    this.dataManager.getData(request).subscribe({
      next: response => {
        this.exportingMessage.set(`Generating ${format.toUpperCase()} file...`);

        // Use visible table columns for export if in table view, otherwise all columns.
        const exportColumns = this.viewMode() === 'table' ? this.visibleTableColumns() : this.allTableColumns();

        this.exportService.exportData(format, response.data, exportColumns, this.config().config.title);

        // Short delay to allow user to see the "Generating" message
        setTimeout(() => {
          this.isExporting.set(false);
          this.exportingMessage.set('');
        }, 1000);
      },
      error: err => {
        console.error('Failed to fetch data for export:', err);
        this.exportingMessage.set('Error during export. Please try again.');
        setTimeout(() => {
          this.isExporting.set(false);
          this.exportingMessage.set('');
        }, 3000);
      }
    });
  }

  // --- Keyboard Navigation ---
  handleContentKeydown(event: KeyboardEvent): void {
    const currentData = this.data();
    const currentIndex = this.keyboardActiveRowIndex();
    const isPaginatorMode = !this.isInfiniteScroll();

    // Check for ArrowUp at the first item to go to the previous page
    if (event.key === 'ArrowUp' && currentIndex === 0 && isPaginatorMode) {
      event.preventDefault();
      const prevPage = this.currentPage() - 1;
      if (prevPage >= 1) {
        this.postFetchFocus.set('last');
        this.handlePageChange(prevPage);
      }
      return;
    }

    // Check for ArrowDown at the last item to go to the next page
    if (event.key === 'ArrowDown' && currentIndex === currentData.length - 1 && isPaginatorMode) {
      event.preventDefault();
      const nextPage = this.currentPage() + 1;
      if (nextPage <= this.totalPages()) {
        this.postFetchFocus.set('first');
        this.handlePageChange(nextPage);
      }
      return;
    }

    this.keyboardManager.updateState(
      currentData,
      currentIndex,
      this.selectedIds(),
      this.selectionAnchorIndex()
    );

    const update = this.keyboardManager.handleKeydown(event);

    if (update) {
      this.keyboardActiveRowIndex.set(update.newActiveIndex);
      this.selectedIds.set(update.newSelection);
      this.selectionAnchorIndex.set(update.newAnchorIndex);

      const activeItem = this.data()[update.newActiveIndex];
      if (activeItem) {
        this.scrollActiveItemIntoView(activeItem.organization_id);
      }
    }
  }

  private scrollActiveItemIntoView(itemId: number): void {
    const viewMode = this.viewMode();
    let elementId: string;
    switch (viewMode) {
      case 'table': elementId = `table-item-${itemId}`; break;
      case 'card': elementId = `card-item-${itemId}`; break;
      case 'list': elementId = `list-item-${itemId}`; break;
      default: return;
    }

    setTimeout(() => {
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  }
}