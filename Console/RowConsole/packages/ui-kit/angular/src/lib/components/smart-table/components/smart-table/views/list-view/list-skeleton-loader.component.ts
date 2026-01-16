import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-gray-200 rounded-lg">
      <ul class="divide-y divide-gray-200">
        @for (i of skeletonItems(); track i) {
          <li class="p-4 animate-pulse">
            <div class="flex items-center">
              <div class="h-10 w-10 bg-gray-300 rounded-full mr-4 flex-shrink-0"></div>
              <div class="flex-1 min-w-0 space-y-2">
                <div class="h-4 bg-gray-300 rounded w-2/5"></div>
                <div class="h-3 bg-gray-300 rounded w-3/5"></div>
              </div>
              <div class="ml-4 h-4 bg-gray-300 rounded w-1/6"></div>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSkeletonLoaderComponent {
  count = input<number>(10);
  skeletonItems = computed(() => Array(this.count()).fill(0).map((x, i) => i));
}
