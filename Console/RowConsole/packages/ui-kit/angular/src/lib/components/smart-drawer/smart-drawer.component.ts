import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { SmartDrawerConfig, SmartDrawerMode } from './smart-drawer.config';
import { SmartDrawerUtil } from './smart-drawer.util';
import { SmartDrawerHelperService } from '../smart-table/services/smart-drawer-helper.service';

@Component({
  selector: 'smart-drawer',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  template: `
    <!-- Modal Backdrop -->
    <!-- Show if modal (open & not minimized) OR if previewing (minimized but hover) -->
    <div *ngIf="(isOpen() && mode() === 'modal' && !isMinimized()) || (isOpen() && isPreviewing())" 
         (click)="handleBackdropClick()"
         class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 animate-in fade-in">
    </div>

    <!-- Main Container -->
    <div *ngIf="isOpen()"
         (mouseenter)="showPreview()"
         (mouseleave)="hidePreview()"
         [class]="containerClasses()"
         [style]="containerStyles()"
         class="fixed z-[1001] bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out border border-gray-100 overflow-hidden"
         [class.animate-slide-in-right]="mode() === 'drawer' && !isMaximized()"
         [class.animate-zoom-in]="mode() === 'modal' && !isMaximized()">
      
      <!-- Fixed Header -->
      <div [class]="(isMinimized() && !isPreviewing()) ? 'h-14 cursor-pointer hover:bg-gray-50' : 'h-16'" 
           (click)="onHeaderClick($event)"
           class="px-6 border-b flex items-center justify-between shrink-0 transition-all duration-300"
           style="background-color: var(--drawer-header-bg, #f9fafb); border-color: var(--drawer-header-border, #f3f4f6);">
        <div class="flex items-center gap-3">
          <!-- Lead Icon -->
          <div *ngIf="config().icon" class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border"
               style="color: var(--drawer-accent-color, #2563eb); border-color: var(--drawer-header-border, #f3f4f6);">
            <i [class]="'fa ' + config().icon"></i>
          </div>
          <div [class]="(isMinimized() && !isPreviewing()) ? 'flex items-center gap-3' : ''">
            <h2 [class]="(isMinimized() && !isPreviewing()) ? 'text-sm font-bold whitespace-nowrap' : 'text-base font-black tracking-tight uppercase'"
                class="transition-all duration-200"
                style="color: var(--drawer-text-color, #1f2937);">{{ title() }}</h2>
            
            <div *ngIf="!(isMinimized() && !isPreviewing())" class="flex items-center gap-2 mt-0.5">
               <span class="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
                     [class]="mode() === 'drawer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                 {{ mode() }}
               </span>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-1">
          <!-- Custom Action Buttons -->
          <ng-container *ngIf="!isMinimized() || isPreviewing()">
            <button *ngFor="let btn of config().headerIconButtons" 
                    (click)="handleHeaderAction(btn)"
                    [title]="btn.title || ''"
                    class="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center">
              <i [class]="'fa ' + btn.icon"></i>
            </button>

            <div class="w-[1px] h-4 bg-gray-200 mx-2"></div>

            <!-- Conversion Toggle -->
            <button (click)="toggleMode()" 
                    title="Toggle Modal/Drawer"
                    class="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-indigo-600 transition-all flex items-center justify-center">
              <i [class]="mode() === 'modal' ? 'fa fa-columns' : 'fa fa-window-maximize'"></i>
            </button>

            <!-- External View -->
            <button *ngIf="config().showNewTab" 
                    (click)="openInNewTab()"
                    title="Open in New Tab"
                    class="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-green-600 transition-all flex items-center justify-center">
              <i class="fa fa-external-link-alt"></i>
            </button>
          </ng-container>

          <!-- Window Controls -->
          <button *ngIf="config().showMinimize !== false" 
                  (click)="isMinimized.set(!isMinimized()); isPreviewing.set(false)"
                  class="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-amber-600 transition-all flex items-center justify-center">
            <i class="fa fa-minus text-[10px]"></i>
          </button>

          <button *ngIf="config().showMaximize !== false" 
                  (click)="toggleMaximize()"
                  class="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center">
            <i [class]="isMaximized() ? 'fa fa-compress-arrows-alt' : 'fa fa-expand-arrows-alt'"></i>
          </button>

          <button (click)="close()" 
                  class="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center ml-1">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-8 relative" [class.hidden]="isMinimized() && !isPreviewing()">
        
        <!-- Skeleton Loader -->
        <div *ngIf="isLoading()"
             class="absolute inset-0 bg-white z-10 p-8 flex flex-col gap-6 animate-pulse">
            
            <!-- Header Skeleton -->
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gray-100"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-50 rounded w-1/4"></div>
                </div>
            </div>

            <!-- Content Blocks -->
            <div class="space-y-4 mt-4">
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-4 bg-gray-100 rounded w-full"></div>
                <div class="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>

             <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="h-32 bg-gray-50 rounded-xl"></div>
                <div class="h-32 bg-gray-50 rounded-xl"></div>
            </div>
            
            <div class="space-y-2 mt-4">
                <div class="h-3 bg-gray-50 rounded w-full"></div>
                <div class="h-3 bg-gray-50 rounded w-full"></div>
                <div class="h-3 bg-gray-50 rounded w-2/3"></div>
            </div>
        </div>

        <!-- Dynamic Component Outlet -->
        <ng-container [ngComponentOutlet]="activeComponent()"
                      [ngComponentOutletInputs]="inputs()"
                      (ngComponentOutletActivate)="onComponentActivate($event)">
        </ng-container>
             
        <!-- Projected Content fallback -->
        <ng-content *ngIf="!activeComponent()"></ng-content>
      </div>

      <!-- Fixed Footer -->
      <div *ngIf="!isMinimized() && config().footerButtons && config().footerButtons?.length" 
           class="p-6 border-t flex justify-end gap-3 shrink-0"
           style="background-color: var(--drawer-footer-bg, #ffffff); border-color: var(--drawer-header-border, #f3f4f6);">
        <button *ngFor="let btn of config().footerButtons" 
                (click)="handleFooterAction(btn.action)"
                [disabled]="btn.disabled"
                [class]="btn.class || 'px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50'">
          {{ btn.label }}
        </button>
      </div>
    </div>

    <style>
      .animate-slide-in-right {
        animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .animate-zoom-in {
        animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes zoomIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    </style>
  `
})
export class SmartDrawerComponent {
  private helperService = inject(SmartDrawerHelperService);

  // Computed signals from service
  activeState = computed(() => this.helperService.activeDrawer());

  // -- Backward Compat Inputs --
  @Input('config') set legacyConfig(val: SmartDrawerConfig) {
    this._legacyConfig.set(val);
  }
  @Input('open') set legacyOpen(val: boolean) {
    this._legacyOpen.set(val);
  }
  @Output() closed = new EventEmitter<void>();

  private _legacyConfig = signal<SmartDrawerConfig | null>(null);
  private _legacyOpen = signal<boolean>(false);

  // Merge config: Prefer legacy config if present (declarative usage), otherwise service
  config = computed(() => {
    const leg = this._legacyConfig();
    const srv = this.activeState().config;
    if (leg) {
      // Merge service state into legacy if needed (e.g. for dynamic updates from service)
      // But predominantly use legacy config from input
      return { ...srv, ...leg };
    }
    return srv;
  });

  title = computed(() => this.activeState().title || this.config().title || 'Drawer');
  activeComponent = computed(() => this.activeState().component);
  inputs = computed(() => this.activeState().inputs);

  // Open state: OR of service and legacy input
  isOpen = computed(() => this.activeState().isOpen || this._legacyOpen());

  // Local state
  mode = signal<SmartDrawerMode>('drawer');
  isMaximized = signal(false);
  isMinimized = signal(false);
  isPreviewing = signal(false); // New signal for hover preview
  isLoading = computed(() => this.config().isLoading ?? false);

  constructor() {
    // Sync initial mode from config when it opens
    // Effect or doing it in computation? 
    // Computation for defaults is cleaner but mode is mutable locally
  }

  // Use a computed for the Effective Mode to allow local overrides but default to config
  // Actually, we use a signal 'mode' initialized properly.
  // Since signals are reactive, we need an effect to update 'mode' when config changes? 
  // For now, let's just initialize it implicitly or rely on the user to toggle.
  // Better: Reset mode when drawer opens.

  ngOnInit() {
    // Logic moved to effect or simply reactive in template
  }

  // Debounce timer
  private previewDebounce: any;

  showPreview() {
    if (this.isMinimized()) {
      clearTimeout(this.previewDebounce);
      this.isPreviewing.set(true);
    }
  }

  hidePreview() {
    this.previewDebounce = setTimeout(() => {
      this.isPreviewing.set(false);
    }, 100);
  }

  containerClasses = computed(() => {
    const list = [];

    // Effective state: if minimized AND NOT previewing -> Show minimized bar.
    // If minimized AND previewing -> Show "Preview" (Small Card).
    const isPreviewing = this.isPreviewing();
    const showMinimized = this.isMinimized() && !isPreviewing;

    if (this.isMaximized()) {
      return 'top-0 left-0 w-full h-full rounded-none';
    }

    if (showMinimized) {
      return 'bottom-0 right-20 w-72 h-14 rounded-t-xl rounded-b-none border-b-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]';
    }

    // PREVIEW MODE SPECIFIC CLASS
    if (isPreviewing) {
      // A fixed card size anchored to the bottom-right (same x-axis as minimized bar)
      return 'bottom-0 right-20 w-[480px] h-[600px] rounded-t-2xl shadow-2xl border-b-0';
    }

    const mode = this.mode();
    const conf = this.config();
    const pos = conf.position || (mode === 'drawer' ? 'right' : 'center');

    // Drawer Mode Specifics (Standard)
    if (mode === 'drawer') {
      if (pos === 'left') list.push('top-0 left-0 h-full rounded-r-3xl');
      else if (pos === 'right') list.push('top-0 right-0 h-full rounded-l-3xl');
      else if (pos === 'top') list.push('top-0 left-0 w-full rounded-b-3xl');
      else if (pos === 'bottom') list.push('bottom-0 left-0 w-full rounded-t-3xl');
      else list.push('top-0 right-0 h-full rounded-l-3xl'); // Default Right
    }
    // Modal Mode Specifics
    else {
      // Corners & Edges
      if (pos === 'center') list.push('top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem]');
      else if (pos === 'top') list.push('top-10 left-1/2 -translate-x-1/2 rounded-[2.5rem]');
      else if (pos === 'bottom') list.push('bottom-10 left-1/2 -translate-x-1/2 rounded-[2.5rem]');
      else if (pos === 'left') list.push('top-1/2 left-10 -translate-y-1/2 rounded-[2.5rem]');
      else if (pos === 'right') list.push('top-1/2 right-10 -translate-y-1/2 rounded-[2.5rem]');
      else if (pos === 'top-left') list.push('top-10 left-10 rounded-[2.5rem]');
      else if (pos === 'top-right') list.push('top-10 right-10 rounded-[2.5rem]');
      else if (pos === 'bottom-left') list.push('bottom-10 left-10 rounded-[2.5rem]');
      else if (pos === 'bottom-right') list.push('bottom-10 right-10 rounded-[2.5rem]');
      else list.push('top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem]'); // Default Center
    }

    return list.join(' ');
  });

  containerStyles = computed(() => {
    const isPreviewing = this.isPreviewing();
    const showMinimized = this.isMinimized() && !isPreviewing;

    if (this.isMaximized() || showMinimized || isPreviewing) return {}; // Preview handles its own size via classes

    const mode = this.mode();
    const conf = this.config();
    const pos = conf.position || (mode === 'drawer' ? 'right' : 'center');
    const styles: any = {};


    // Width Logic
    if (conf.width) {
      styles.width = typeof conf.width === 'number' ? conf.width + 'px' : conf.width;
    } else {
      styles.width = mode === 'drawer' ? (['top', 'bottom'].includes(pos) ? '100%' : '600px') : '800px';
    }
    styles.maxWidth = mode === 'drawer' ? '100vw' : '95vw';

    // Height Logic
    if (conf.height) {
      styles.height = typeof conf.height === 'number' ? conf.height + 'px' : conf.height;
    } else {
      if (mode === 'drawer') {
        styles.height = ['left', 'right'].includes(pos) || !pos ? '100%' : '400px';
      } else {
        styles.height = '80vh';
      }
    }

    return styles;
  });

  toggleMode() {
    this.mode.update(m => m === 'drawer' ? 'modal' : 'drawer');
  }

  toggleMaximize() {
    this.isMaximized.update(v => !v);
    if (this.isMaximized()) {
      this.isMinimized.set(false);
      this.isPreviewing.set(false);
    }
  }

  close() {
    this.helperService.close();
    this.closed.emit();
  }

  handleBackdropClick() {
    if (this.config().showClose !== false) {
      this.close();
    }
  }

  openInNewTab() {
    SmartDrawerUtil.openInNewTab(`/standalone-drawer?type=${this.config().id || 'default'}`);
  }

  onComponentActivate(componentInstance: any) {
    const ref = this.activeState().drawerRef;
    if (ref) {
      ref.componentInstance = componentInstance;
    }
    // Also set initial mode from config if newly opened
    this.mode.set(this.config().mode || 'drawer');
  }

  handleFooterAction(action?: string | (() => void)) {
    if (!action) return;

    if (typeof action === 'function') {
      action();
      return;
    }

    const ref = this.activeState().drawerRef;
    if (ref && ref.componentInstance && typeof ref.componentInstance[action] === 'function') {
      ref.componentInstance[action]();
    } else {
      console.warn(`Action ${action} not found on dynamic component.`);
      if (action.toLowerCase() === 'close' || action.toLowerCase() === 'cancel') {
        this.close();
      }
    }
  }

  handleHeaderAction(btn: any) {
    if (btn.action) {
      if (typeof btn.action === 'function') {
        btn.action();
      } else {
        this.handleFooterAction(btn.action);
      }
    }
  }

  onHeaderClick(event: MouseEvent) {
    if (this.isMinimized()) {
      // Prevent restoring if clicking a button inside (though buttons usually stop propagation)
      const target = event.target as HTMLElement;
      if (target.closest('button')) return;

      this.isMinimized.set(false);
      this.isPreviewing.set(false);
    }
  }
}
