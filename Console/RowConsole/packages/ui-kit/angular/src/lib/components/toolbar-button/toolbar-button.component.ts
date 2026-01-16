import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconHelper, IconName } from '../../helpers/icon.helper';
import { GlobalIconHelper, IconType } from '../../helpers/global-icon.helper';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonColor = 'default' | 'primary' | 'danger';

@Component({
  selector: 'app-toolbar-button',
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <button 
        type="button"
        (click)="clicked.emit($event)"
        class="
          flex items-center gap-1.5 rounded shadow-sm border
          active:scale-95 transition-all font-medium select-none
          justify-center
        "
        [ngClass]="[
          sizeClasses(),
          colorClasses()
        ]"
        [style.width]="customSize()"
        [style.height]="customSize()"
        [style.color]="customColor()"
        [style.backgroundColor]="customBgColor()"
        [style.borderColor]="customBgColor()"
        [title]="label() || ''"
        [disabled]="disabled()"
        [class.opacity-50]="disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        <!-- SVG Icon -->
        <!-- SVG Icon -->
        @if (resolvedIcon(); as icon) {
          @if (icon.type === 'svg' && icon.content) {
             <span [innerHTML]="sanitizedIconHtml()" [class]="iconSizeClass()"></span>
          } 
          @else if (icon.class) {
             <!-- Font Icon: Use fontSizeClass, avoid width/height constraints -->
             <i [class]="icon.class + ' ' + fontSizeClass()" [style.fontSize]="customIconSize()"></i>
          }
        }
        
        @if (label() && showLabel()) {
          <span>{{ label() }}</span>
        }

        @if (shortcut()) {
          <kbd class="
            hidden sm:inline-block
            ml-1 px-1 py-0.5 
            leading-none font-sans 
            bg-white/50 border border-black/10 rounded-sm
            opacity-60
          "
          [class.text-[10px]]="size() === 'sm'"
          [class.text-xs]="size() !== 'sm'"
          >
            {{ shortcut() }}
          </kbd>
        }

        @if (resolvedEndIcon(); as endIcon) {
          @if (endIcon.type === 'svg' && endIcon.content) {
             <span [innerHTML]="sanitizedEndIconHtml()" 
                   [class.rotate-180]="endIconRotate()" 
                   class="transition-transform ml-1 w-3 h-3 flex items-center justify-center"></span>
          } @else if (endIcon.class) {
             <i [class]="endIcon.class" 
                [class.ml-1]="true"
                [class.text-xs]="true"
                [class.transition-transform]="true"
                [class.rotate-180]="endIconRotate()"></i>
          }
        }
      </button>

      @if (withSeparator()) {
        <div class="h-5 w-px bg-gray-300 mx-1"></div>
      }
    </div>
  `
})
export class ToolbarButtonComponent {
  // Legacy or direct SVG name support
  icon = input<IconName>();

  // Direct class support (backward compatibility)
  iconClass = input<string>();

  // New standardized inputs
  iconName = input<string>();
  iconType = input<IconType>('prime');
  endIconName = input<string>(); // Added endIconName

  // Custom styling
  customSize = input<string>(); // e.g., '32px' for button size
  customIconSize = input<string>(); // e.g., '16px' for icon size
  customColor = input<string>();
  customBgColor = input<string>();

  label = input<string>();
  showLabel = input(true);
  shortcut = input<string>();
  endIconClass = input<string>();
  endIconRotate = input(false);
  size = input<ButtonSize>('sm');
  color = input<ButtonColor>('default');
  withSeparator = input(false);
  active = input(false);
  disabled = input(false);

  clicked = output<Event>();

  private sanitizer = inject(DomSanitizer);

  resolvedIcon = computed(() => {
    // 1. Prefer direct class if provided (legacy/direct control)
    if (this.iconClass()) {
      return { class: this.iconClass(), type: 'prime' as IconType }; // Assume prime/font for class
    }

    // 2. Resolve using GlobalIconHelper if abstract name provided
    if (this.iconName()) {
      return GlobalIconHelper.getIcon(this.iconName()!, this.iconType());
    }

    // 3. Fallback to existing logic for `icon` input (IconName SVG lookup)
    if (this.icon()) {
      return { content: IconHelper[this.icon()!], type: 'svg' as IconType };
    }

    return { class: '', type: 'prime' as IconType };
  });

  resolvedEndIcon = computed(() => {
    if (this.endIconClass()) {
      return { class: this.endIconClass(), type: 'prime' as IconType };
    }
    if (this.endIconName()) {
      return GlobalIconHelper.getIcon(this.endIconName()!, this.iconType());
    }
    return null;
  });

  sanitizedIconHtml = computed(() => {
    const icon = this.resolvedIcon();
    if (icon.type === 'svg' && icon.content) {
      let svg = icon.content;
      // Strip existing sizing to allow CSS control
      svg = svg.replace(/class="([^"]*)"/, (match, classes) => {
        const newClasses = classes.replace(/w-\d+/, '').replace(/h-\d+/, '');
        return `class="${newClasses} w-full h-full"`;
      });
      return this.sanitizer.bypassSecurityTrustHtml(svg);
    }
    return null;
  });

  // Helper for end icon SVG if needed (though usually it's just a chevron)
  sanitizedEndIconHtml = computed(() => {
    const icon = this.resolvedEndIcon();
    if (icon?.type === 'svg' && icon.content) {
      return this.sanitizer.bypassSecurityTrustHtml(icon.content);
    }
    return null;
  });

  constructor() { }

  sizeClasses = computed(() => {
    if (this.customSize()) return ''; // Disable default sizing if custom is set

    switch (this.size()) {
      case 'lg': return 'px-4 py-2 text-sm';
      case 'md': return 'px-3 py-1.5 text-xs';
      case 'sm':
      default: return 'px-2 py-1 text-[11px]';
    }
  });

  colorClasses = computed(() => {
    if (this.customBgColor()) return ''; // Disable default colors if custom is set

    if (this.active()) {
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300';
    }

    switch (this.color()) {
      case 'primary': return 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700';
      case 'danger': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300';
      case 'default':
      default: return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
    }
  });

  iconSizeClass = computed(() => {
    // For SVG icons, we need dimensions
    switch (this.size()) {
      case 'lg': return 'w-5 h-5';
      case 'md': return 'w-4 h-4';
      case 'sm':
      default: return 'w-3.5 h-3.5';
    }
  });

  fontSizeClass = computed(() => {
    // For Font icons, we need font-size
    if (this.customIconSize()) return '';
    switch (this.size()) {
      case 'lg': return 'text-lg';
      case 'md': return 'text-base';
      case 'sm':
      default: return 'text-sm';
    }
  });
}