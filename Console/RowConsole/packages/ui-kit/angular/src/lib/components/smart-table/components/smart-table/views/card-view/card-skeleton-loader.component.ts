import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      @for (i of skeletonItems(); track i) {
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="p-5">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 bg-gray-300 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div class="space-y-4 mt-6">
              <div class="h-3 bg-gray-300 rounded w-full"></div>
              <div class="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeletonLoaderComponent {
  count = input<number>(8);
  skeletonItems = computed(() => Array(this.count()).fill(0).map((x, i) => i));
}
