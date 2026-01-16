
import { Component, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state().isOpen && config()) {
      <!-- Backdrop with Blur -->
      <div 
        class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        (click)="cancel()"
      ></div>

      <!-- Modal Panel -->
      <div class="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div 
          class="
             pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl 
             border border-gray-100 p-6 transform transition-all animate-scaleIn
             flex flex-col gap-6
          "
          role="dialog"
          aria-modal="true"
        >
          <!-- Header Area -->
          <div class="flex items-start gap-5">
            
            <!-- Icon Circle -->
            <div 
              [class]="iconBgClass()" 
              class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full shadow-sm ring-4 ring-opacity-20 ring-white"
            >
              <div [innerHTML]="iconSvg()" [class]="iconTextClass()"></div>
            </div>

            <!-- Text Content -->
            <div class="flex-1 pt-1">
              <h3 class="text-xl font-bold text-slate-900 leading-tight">
                {{ config()?.title }}
              </h3>
              <p class="mt-2 text-sm text-slate-500 leading-relaxed">
                {{ config()?.message }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-2">
            @if (showCancel()) {
              <button 
                type="button" 
                class="
                  px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 
                  font-semibold text-sm hover:bg-gray-50 hover:text-gray-900 
                  focus:ring-4 focus:ring-gray-100 transition-all shadow-sm
                "
                (click)="cancel()"
              >
                {{ config()?.cancelText || 'Cancel' }}
              </button>
            }
            
            <button 
              type="button" 
              [class]="confirmButtonClass()"
              class="
                px-5 py-2.5 rounded-xl text-white font-semibold text-sm 
                shadow-lg hover:shadow-xl hover:-translate-y-0.5 
                focus:ring-4 transition-all flex items-center gap-2
              "
              (click)="confirm()"
            >
              {{ config()?.confirmText || 'Confirm' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .animate-scaleIn { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class ConfirmDialogComponent {
  private service = inject(ConfirmDialogService);
  private sanitizer = inject(DomSanitizer);

  state = this.service.state;
  config = computed(() => this.state().config);
  type = computed(() => this.config()?.type || 'info');
  showCancel = computed(() => this.config()?.showCancel !== false);

  // Computed Styles based on Type
  iconBgClass = computed(() => {
    switch (this.type()) {
      case 'danger': return 'bg-red-50';
      case 'warning': return 'bg-amber-50';
      case 'success': return 'bg-green-50';
      default: return 'bg-blue-50';
    }
  });

  iconTextClass = computed(() => {
    switch (this.type()) {
      case 'danger': return 'text-red-600 w-7 h-7';
      case 'warning': return 'text-amber-600 w-7 h-7';
      case 'success': return 'text-green-600 w-7 h-7';
      default: return 'text-blue-600 w-7 h-7';
    }
  });

  confirmButtonClass = computed(() => {
    switch (this.type()) {
      case 'danger': return 'bg-red-600 hover:bg-red-500 focus:ring-red-200 shadow-red-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-200 shadow-amber-200';
      case 'success': return 'bg-green-600 hover:bg-green-500 focus:ring-green-200 shadow-green-200';
      default: return 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-200 shadow-blue-200';
    }
  });

  iconSvg = computed(() => {
    let iconName: IconName = 'shieldCheck';
    switch (this.type()) {
      case 'danger': iconName = 'trash'; break;
      case 'warning': iconName = 'shieldCheck'; break; 
      case 'success': iconName = 'checkCircle'; break;
      default: iconName = 'shieldCheck';
    }
    if (!IconHelper[iconName]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[iconName]);
  });

  confirm() {
    this.service.close(true);
  }

  cancel() {
    this.service.close(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.state().isOpen) {
      this.cancel();
    }
  }
}
