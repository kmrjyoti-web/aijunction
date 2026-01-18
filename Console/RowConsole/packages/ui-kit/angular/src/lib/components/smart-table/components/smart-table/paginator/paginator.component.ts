import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalRecords = input.required<number>();
  pageSizeOptions = input<number[]>([12, 20, 50, 100]);
  infiniteScroll = input(false);
  infiniteScrollBehavior = input<'append' | 'replace'>('append');
  currentRecordCount = input<number>(0);
  autoSizingEnabled = input<boolean>(false);

  // New inputs
  dataStrategy = input<string>();
  connectionStatus = input<{ text: string; class: string }>();
  lastSyncTime = input<number | null>();
  isSyncing = input<boolean>();

  pageChange = output<number>();
  pageSizeChange = output<number>();
  autoSizingToggle = output<void>();

  // New output
  chatbotToggle = output<void>();

  private isAppendMode = computed(() => this.infiniteScroll() && this.infiniteScrollBehavior() === 'append');

  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  recordRangeStart = computed(() => {
    if (this.isAppendMode()) {
      return this.totalRecords() > 0 ? 1 : 0;
    }
    // For regular paginator and 'replace' infinite scroll, the calculation is the same.
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  recordRangeEnd = computed(() => {
    if (this.isAppendMode()) {
      return this.currentRecordCount(); // This is data().length from parent
    }
    // For regular paginator and 'replace' infinite scroll, the calculation is the same.
    return Math.min(this.currentPage() * this.pageSize(), this.totalRecords());
  });


  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }
    return range;
  });

  relativeSyncTime = computed(() => {
    const lastSync = this.lastSyncTime();
    if (!lastSync) return 'never';

    const now = new Date().getTime();
    const diffSeconds = Math.round((now - lastSync) / 1000);

    if (diffSeconds < 2) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return new Date(lastSync).toLocaleDateString();
  });

  fullSyncTime = computed(() => {
    const lastSync = this.lastSyncTime();
    if (!lastSync) return '';
    return new Date(lastSync).toLocaleString();
  });

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  toFirstPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(1);
    }
  }

  toLastPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.totalPages());
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const newSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSizeChange.emit(newSize);
  }
}
