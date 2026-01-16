import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLayout, LayoutTargetView } from '../../models/custom-layout.model';
import { CreateLayoutModalComponent, GenerateLayoutEvent } from './create-layout-modal/create-layout-modal.component';
import { AiLayoutService } from '../../ai-utility/ai-layout.service';
import { DensityService } from '../../services/density.service';

@Component({
  selector: 'app-ui-gallery',
  standalone: true,
  imports: [CommonModule, CreateLayoutModalComponent],
  templateUrl: './ui-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGalleryComponent {
  isOpen = input.required<boolean>();
  layouts = input.required<CustomLayout[]>();
  currentView = input.required<string>(); // 'table', 'card', 'list'
  activeLayouts = input.required<{ card: string | null, list: string | null, table: string | null }>();

  close = output<void>();
  applyLayout = output<{ view: string; layoutId: string | null }>();
  deleteLayout = output<string>();
  generateLayout = output<GenerateLayoutEvent>();

  private aiLayoutService = inject(AiLayoutService);
  private densityService = inject(DensityService);

  showCreateModal = signal(false);

  // AI Suggestion State
  suggestions = signal('');
  isGeneratingSuggestions = signal(false);

  activeCustomLayout = computed(() => {
    const view = this.currentView();
    const activeIds = this.activeLayouts();
    let activeId: string | null = null;
    if (view === 'table') activeId = activeIds.table;
    if (view === 'list') activeId = activeIds.list;
    if (view === 'card') activeId = activeIds.card;
    
    if (!activeId) return null;
    return this.layouts().find(l => l.id === activeId) ?? null;
  });

  getLayoutTarget(): LayoutTargetView {
    if (this.currentView() === 'table') return 'table-row';
    if (this.currentView() === 'list') return 'list-item';
    return 'card';
  }

  isLayoutActive(layoutId: string | null): boolean {
    const view = this.currentView();
    if (view === 'table') return this.activeLayouts().table === layoutId;
    if (view === 'list') return this.activeLayouts().list === layoutId;
    return this.activeLayouts().card === layoutId;
  }
  
  handleApply(layoutId: string | null): void {
    this.applyLayout.emit({ view: this.currentView(), layoutId });
    this.close.emit();
  }

  async handleSuggestImprovements(): Promise<void> {
    const activeLayout = this.activeCustomLayout();
    if (!activeLayout) return;

    this.isGeneratingSuggestions.set(true);
    this.suggestions.set('');
    try {
      const result = await this.aiLayoutService.suggestLayoutImprovements(
        activeLayout.htmlTemplate,
        window.innerWidth,
        this.densityService.density()
      );
      // Format suggestions for better display
      let formatted = result.suggestions;
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/^\* (.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
      if (formatted.includes('<li')) {
         formatted = `<ul>${formatted}</ul>`;
      }
      this.suggestions.set(formatted);
    } catch (error) {
      console.error('Error getting layout suggestions:', error);
      this.suggestions.set('<p class="text-red-500">Sorry, I was unable to generate suggestions at this time.</p>');
    } finally {
      this.isGeneratingSuggestions.set(false);
    }
  }
}
