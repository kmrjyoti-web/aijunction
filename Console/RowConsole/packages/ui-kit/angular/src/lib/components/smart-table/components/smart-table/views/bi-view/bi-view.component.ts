import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../data-access/online-data.service';
import { Column } from '../../../../models/table-config.model';
import { D3BarChartDirective } from '../../../../directives/d3-bar-chart.directive';
import { AiDashboardService, BiDashboard } from '../../../../ai-utility/ai-dashboard.service';

@Component({
  selector: 'app-bi-view',
  standalone: true,
  imports: [CommonModule, D3BarChartDirective],
  templateUrl: './bi-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiViewComponent {
  data = input.required<Contact[]>();
  columns = input.required<Column[]>();
  
  private aiDashboardService = inject(AiDashboardService);

  isLoading = signal(true);
  dashboardContent = signal<BiDashboard | null>(null);
  error = signal<string | null>(null);

  constructor() {
    effect(async (onCleanup) => {
      const currentData = this.data();
      const currentColumns = this.columns();
      
      if (currentData.length > 0) {
        this.isLoading.set(true);
        this.error.set(null);
        try {
          const content = await this.aiDashboardService.generateBiDashboard(currentData, currentColumns);
          this.dashboardContent.set(content);
        } catch (err) {
          console.error('Failed to generate BI dashboard:', err);
          this.error.set('Could not load AI-powered dashboard. Please try again.');
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }
}
