import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartTableComponent } from '@ai-junction/ui-kit';

@Component({
  selector: 'app-smart-table-page',
  standalone: true,
  imports: [CommonModule, SmartTableComponent],
  template: `
   
   
        <div class="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Use SmartTable directly with default ID 'rowcontact' which maps to defaults -->
            <app-smart-table tableId="rowcontact"></app-smart-table>
        </div>
    
  
  `
})
export class SmartTablePageComponent { }
