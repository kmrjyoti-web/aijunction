import { Injectable, signal, inject } from '@angular/core';
import { Chip } from '../models/chip.model';
import { PersistenceService } from './persistence.service';
import { effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChipFilterService {
  private persistenceService = inject(PersistenceService);
  private readonly STORAGE_KEY = 'smartTableChips';

  chips = signal<Chip[]>(this.loadChips());

  constructor() {
    effect(() => {
        this.saveChips(this.chips());
    });
  }

  addChip(chipConfig: Omit<Chip, 'id'>): void {
    const newChip: Chip = {
        id: new Date().toISOString(),
        ...chipConfig
    };
    this.chips.update(chips => [...chips, newChip]);
  }

  removeChip(chipId: string): void {
    this.chips.update(chips => chips.filter(c => c.id !== chipId));
  }
  
  private loadChips(): Chip[] {
    return this.persistenceService.loadState<Chip[]>(this.STORAGE_KEY) ?? [];
  }

  private saveChips(chips: Chip[]): void {
    this.persistenceService.saveState(this.STORAGE_KEY, chips);
  }
}
