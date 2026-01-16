
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject the service to ensure it's initialized on app startup.
  private themeService = inject(ThemeService);
}
