import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DensityService } from '../../../services/density.service';
import { ConfigService } from '../../../data-access/config.service';
import { Density } from '../../../models/density.model';

@Component({
  selector: 'app-density-chooser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './density-chooser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DensityChooserComponent {
  densityService = inject(DensityService);
  configService = inject(ConfigService);

  densities = this.configService.config().config.sizerConfig.densities;
  currentDensity = this.densityService.density;

  setDensity(density: Density): void {
    this.densityService.setDensity(density);
  }

  getIconForDensity(density: Density): string {
    switch(density) {
      case 'comfortable': return 'pi-align-justify';
      case 'cozy': return 'pi-bars';
      case 'compact': return 'pi-table';
      case 'ultra-compact': return 'pi-compress';
    }
  }
}