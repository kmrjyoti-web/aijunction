import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../../../../models/table-config.model';

@Component({
  selector: 'app-table-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-50">
          <tr>
            @for (col of columns(); track col.code) {
              <th scope="col" class="px-6 py-3 border-b border-gray-200 text-left">
                <div class="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (i of skeletonRows(); track $index) {
            <tr>
              @for (col of columns(); track col.code) {
                <td class="px-6 py-4 whitespace-nowrap border-t border-gray-200">
                    @if (col.columnType === 'IMAGE') {
                      <div class="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
                    } @else if (col.columnType === 'CHECKBOX') {
                      <div class="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                    } @else if (col.cellTemplate && col.cellTemplate.length > 0) {
                      <div class="space-y-2">
                        <div class="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                        <div class="h-3 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                      </div>
                    }
                    @else {
                      <div class="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                    }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonLoaderComponent {
  columns = input.required<Column[]>();
  rows = input<number>(10);

  skeletonRows = computed(() => Array(this.rows()).fill(0));
}
