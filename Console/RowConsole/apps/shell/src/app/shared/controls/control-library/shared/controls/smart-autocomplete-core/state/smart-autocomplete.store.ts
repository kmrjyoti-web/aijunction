
import { Injectable, computed, signal, inject } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap, catchError, of } from 'rxjs';
import { ApiResult, AutocompleteSourceConfig } from '../models/autocomplete-config.model';
import { SmartAutocompleteService } from '../services/smart-autocomplete.service';

@Injectable()
export class SmartAutocompleteStore<TModel = any> {
    private acService = inject(SmartAutocompleteService);

    private readonly _config = signal<AutocompleteSourceConfig<TModel> | null>(null);
    private readonly _baseFilters = signal<Record<string, any>>({});
    
    // State
    private readonly queryText = signal<string>('');
    private readonly loading = signal<boolean>(false);
    private readonly error = signal<string | null>(null);
    private readonly result = signal<ApiResult<TModel[]> | null>(null);
    private readonly completedSearch = signal<boolean>(false);

    // Selectors
    readonly config = this._config.asReadonly();
    readonly query = computed(() => this.queryText());
    readonly isLoading = computed(() => this.loading());
    readonly errorMessage = computed(() => this.error());
    readonly hasCompletedSearch = computed(() => this.completedSearch());
    readonly items = computed<TModel[]>(() => {
        const res = this.result();
        return (res?.data || []) as TModel[];
    });

    private readonly queryInput$ = new Subject<string>();

    constructor() {
        this.initDebounce();
    }

    init(config: AutocompleteSourceConfig<TModel>, baseFilters: Record<string, any> = {}) {
        this._config.set(config);
        this._baseFilters.set(baseFilters);
        this.queryText.set('');
        this.result.set(null);
        this.completedSearch.set(false);
    }

    updateQuery(text: string) {
        this.queryText.set(text);
        this.queryInput$.next(text);
    }

    private initDebounce() {
        this.queryInput$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(() => {
                this.loading.set(true);
                this.error.set(null);
                this.completedSearch.set(false);
            }),
            switchMap(text => {
                const cfg = this._config();
                const baseFilters = this._baseFilters();
                const trimmed = (text || '').trim();

                if (!cfg || !trimmed) {
                    this.loading.set(false);
                    this.result.set({ is_success: true, data: [] });
                    return of(null);
                }

                return this.acService.search<TModel>(cfg, trimmed, baseFilters).pipe(
                    catchError(err => {
                        this.error.set('Error loading data');
                        return of({ is_success: false, data: [] });
                    })
                );
            })
        ).subscribe(res => {
            this.loading.set(false);
            this.completedSearch.set(true);
            if (res) this.result.set(res);
        });
    }
}
