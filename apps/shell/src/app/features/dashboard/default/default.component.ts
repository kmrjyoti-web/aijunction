import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-stub">
      <h2>Default Dashboard</h2>
      <p>UI Kit has been removed. Dashboard widgets are cleared.</p>
    </div>
  `,
  styles: [`
    .dashboard-stub {
      padding: 20px;
      text-align: center;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
  `]
})
export class DefaultComponent { }
