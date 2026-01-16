import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../../../models/table-config.model';
import { AggregationMethod, Chip } from '../../../models/chip.model';
import { AiChipGeneratorService } from '../../../ai-utility/ai-chip-generator.service';

@Component({
  selector: 'app-add-chip-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-chip-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddChipModalComponent {
  isOpen = input.required<boolean>();
  columns = input.required<Column[]>();
  
  close = output<void>();
  addChip = output<Omit<Chip, 'id'>>();

  private aiChipService = inject(AiChipGeneratorService);
  
  activeTab = signal<'manual' | 'ai'>('manual');
  
  // Manual form state
  label = signal('');
  selectedColumnCode = signal<string>('');
  selectedAggregation = signal<AggregationMethod>('count');
  filterValue = signal('');
  
  // AI form state
  aiPrompt = signal('');
  isGenerating = signal(false);

  numericColumns = computed(() => this.columns().filter(c => c.columnType === 'numeric'));
  categoricalColumns = computed(() => this.columns().filter(c => c.columnType !== 'numeric' && c.filterable));
  
  availableAggregations = computed<AggregationMethod[]>(() => {
    const colCode = this.selectedColumnCode();
    const isNumeric = this.numericColumns().some(c => c.code === colCode);
    if (isNumeric) {
      return ['sum', 'average', 'count'];
    }
    return ['count'];
  });
  
  isCategoricalCount = computed(() => {
    const colCode = this.selectedColumnCode();
    const isNumeric = this.numericColumns().some(c => c.code === colCode);
    return this.selectedAggregation() === 'count' && !isNumeric;
  });

  manualFormIsValid = computed(() => this.label().trim() && this.selectedColumnCode());

  handleManualSave(): void {
    if (!this.manualFormIsValid()) return;
    this.addChip.emit({
      label: this.label().trim(),
      columnCode: this.selectedColumnCode(),
      aggregation: this.selectedAggregation(),
      filterValue: this.isCategoricalCount() ? this.filterValue().trim() : undefined
    });
    this.resetForms();
  }
  
  async handleAiGenerate(): Promise<void> {
    if (!this.aiPrompt().trim()) return;
    this.isGenerating.set(true);
    try {
      const chipConfig = await this.aiChipService.generateChipConfig(this.aiPrompt(), this.columns());
      this.addChip.emit(chipConfig);
      this.resetForms();
    } catch (e) {
      console.error("AI chip generation failed", e);
      // In a real app, you might want to show an error message to the user
    } finally {
      this.isGenerating.set(false);
    }
  }

  private resetForms(): void {
    this.label.set('');
    this.selectedColumnCode.set('');
    this.selectedAggregation.set('count');
    this.filterValue.set('');
    this.aiPrompt.set('');
  }
}
