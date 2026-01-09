import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@ai-junction/platform/layout/layout.service';
import { GoogleShellComponent } from './layouts/google/google-shell.component';
import { OutlookShellComponent } from './layouts/outlook/outlook-shell.component';
import { ClassicShellComponent } from './layouts/classic/classic-shell.component';

@Component({
  selector: 'app-shell-host',
  standalone: true,
  imports: [CommonModule, GoogleShellComponent, OutlookShellComponent, ClassicShellComponent],
  template: `
    @switch (activeLayout()) {
      @case ('google') {
        <app-google-shell></app-google-shell>
      }
      @case ('outlook') {
        <app-outlook-shell></app-outlook-shell>
      }
      @case ('classic') {
        <app-classic-shell></app-classic-shell>
      }
      @default {
        <div>Unknown Layout</div>
      }
    }
  `
})
export class ShellHostComponent {
  private layoutService = inject(LayoutService);
  
  // Expose the signal for the template
  activeLayout = this.layoutService.activeLayoutId;
}
