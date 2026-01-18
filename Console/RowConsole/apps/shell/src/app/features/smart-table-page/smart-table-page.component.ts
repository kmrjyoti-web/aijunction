import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartTableComponent, DataManagerService, ConfigService, DATA_PROVIDER_TOKEN } from '@ai-junction/ui-kit';
import { RowContactDataService } from '@ai-junction/core';


@Component({
  selector: 'app-smart-table-page',
  standalone: true,
  imports: [CommonModule, SmartTableComponent],

  template: `
    <div class="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Use SmartTable directly with default ID 'rowcontact' which maps to defaults -->
        <app-smart-table tableId="rowcontact"></app-smart-table>
    </div>
  `,
  providers: [
    ConfigService,
    DataManagerService,
    RowContactDataService,
    { provide: DATA_PROVIDER_TOKEN, useExisting: RowContactDataService }
  ]
})
export class SmartTablePageComponent { }
