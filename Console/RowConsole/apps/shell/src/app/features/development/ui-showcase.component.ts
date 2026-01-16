import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ui-showcase',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Development: UI Controls Showcase</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Instruction Card -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
           <h2 class="text-xl font-semibold mb-4 text-blue-600">How to add controls</h2>
           <p class="mb-4 text-gray-600">
             Paste your custom control files (Component, HTML, SCSS) into:
           </p>
           <code class="block bg-gray-100 p-3 rounded text-sm mb-4">
             apps/shell/src/app/shared/controls/
           </code>
           <p class="text-gray-600">
             Then import them here in <code>ui-showcase.component.ts</code> and add them to the imports array.
           </p>
        </div>

        <!-- Example Placeholder -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
           <h2 class="text-xl font-semibold mb-4">Control Preview</h2>
           <p class="text-gray-500 italic">
             Import your controls to see them here.
           </p>
           <!-- <app-your-custom-control></app-your-custom-control> -->
        </div>
      </div>
    </div>
  `
})
export class UiShowcaseComponent { }
