import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-google-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="google-layout">
      <header class="google-header">Google Shell Header</header>
      <div class="google-body">
        <aside class="google-nav">Nav</aside>
        <main class="google-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .google-layout { display: flex; flex-direction: column; height: 100vh; }
    .google-header { height: 64px; background: #eee; border-bottom: 1px solid #ccc; padding: 1rem; }
    .google-body { display: flex; flex: 1; }
    .google-nav { width: 250px; border-right: 1px solid #ccc; padding: 1rem; }
    .google-content { flex: 1; padding: 1rem; }
  `]
})
export class GoogleShellComponent {}
