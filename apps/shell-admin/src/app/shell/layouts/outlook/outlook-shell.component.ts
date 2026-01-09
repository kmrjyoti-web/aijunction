import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-outlook-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="outlook-layout">
      <header class="outlook-header">Outlook Shell Header</header>
      <div class="outlook-body">
        <aside class="outlook-nav">Nav</aside>
        <main class="outlook-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .outlook-layout { display: flex; flex-direction: column; height: 100vh; }
    .outlook-header { height: 48px; background: #0078d4; color: white; padding: 0 1rem; display: flex; align-items: center; }
    .outlook-body { display: flex; flex: 1; }
    .outlook-nav { width: 60px; background: #f0f0f0; padding: 1rem 0; text-align: center; }
    .outlook-content { flex: 1; padding: 1rem; }
  `]
})
export class OutlookShellComponent {}
