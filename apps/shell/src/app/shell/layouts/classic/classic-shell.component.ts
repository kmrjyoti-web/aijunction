import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-classic-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="classic-layout">
      <header class="classic-header">Classic Shell Header</header>
      <div class="classic-body">
        <aside class="classic-nav">Nav</aside>
        <main class="classic-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .classic-layout { display: flex; flex-direction: column; height: 100vh; }
    .classic-header { height: 48px; background: #f0f0f0; border-bottom: 1px solid #ddd; padding: 0.5rem 1rem; }
    .classic-body { display: flex; flex: 1; }
    .classic-nav { width: 200px; border-right: 1px solid #ddd; padding: 1rem; background: #f8f8f8; }
    .classic-content { flex: 1; padding: 1rem; }
  `]
})
export class ClassicShellComponent {}
