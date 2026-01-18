import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-smart-drawer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <!-- Backdrop -->
    @if (isOpen()) {
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" (click)="close.emit()"></div>
    }

    <!-- Drawer -->
    <aside
      class="fixed top-0 right-0 h-full w-96 md:w-[30rem] lg:w-[36rem] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()">
      
      <!-- Header -->
      <header class="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div>
           <h2 class="text-xl font-bold text-gray-800">{{ title() }}</h2>
           @if (subtitle()) {
             <p class="text-sm text-gray-500 mt-1">{{ subtitle() }}</p>
           }
        </div>
        <button (click)="close.emit()" 
            class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <i class="pi pi-times text-xl"></i>
        </button>
      </header>

      <!-- Content -->
      <div class="flex-grow overflow-y-auto p-0">
        <ng-content></ng-content>
      </div>

       <!-- Footer (Optional slot) -->
       <footer class="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-3 empty:hidden">
          <ng-content select="[drawer-footer]"></ng-content>
       </footer>
    </aside>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartDrawerComponent {
    isOpen = input.required<boolean>();
    title = input<string>('');
    subtitle = input<string>('');

    close = output<void>();
}
