import { Injectable, signal, inject, effect } from '@angular/core';
import { Density } from '../models/density.model';
import { PersistenceService } from '../data-access/persistence.service';
import { ConfigService } from '../data-access/config.service';

@Injectable({ providedIn: 'root' })
export class DensityService {
  private persistenceService = inject(PersistenceService);
  private configService = inject(ConfigService);
  private readonly STORAGE_KEY = 'smartTableDensity';

  readonly density = signal<Density>(this.getInitialDensity());

  constructor() {
    effect(() => {
      this.persistenceService.saveState(this.STORAGE_KEY, this.density());
    });
  }

  setDensity(newDensity: Density): void {
    this.density.set(newDensity);
  }

  private getInitialDensity(): Density {
    const savedDensity = this.persistenceService.loadState<Density>(this.STORAGE_KEY);
    return savedDensity ?? this.configService.config().config.sizerConfig.defaultDensity;
  }
}
