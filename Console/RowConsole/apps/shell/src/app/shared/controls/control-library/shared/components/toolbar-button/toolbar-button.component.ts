import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

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
        "
        [ngClass]="[
          sizeClasses(),
          colorClasses()
        ]"
        [title]="label() || ''"
      >
        @if (iconHtml()) {
          <span [innerHTML]="iconHtml()" [class]="iconSizeClass()"></span>
        }
        @if (iconClass()) {
          <i [class]="iconClass()" [ngClass]="iconSizeClass()"></i>
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


        @if (endIconClass()) {
          <i [class]="endIconClass()" [class.rotate-180]="endIconRotate()" class="text-xs transition-transform ml-1"></i>
        }
      </button>

      @if (withSeparator()) {
        <div class="h-5 w-px bg-gray-300 mx-1"></div>
      }
    </div>
  `
})
export class ToolbarButtonComponent {
  icon = input<IconName>();
  iconClass = input<string>();
  label = input<string>();
  showLabel = input(true);
  shortcut = input<string>();
  endIconClass = input<string>();
  endIconRotate = input(false);
  size = input<ButtonSize>('sm');
  color = input<ButtonColor>('default');
  withSeparator = input(false);
  active = input(false);

  clicked = output<Event>();

  private sanitizer = inject(DomSanitizer);

  sizeClasses = computed(() => {
    switch (this.size()) {
      case 'lg': return 'px-4 py-2 text-sm';
      case 'md': return 'px-3 py-1.5 text-xs';
      case 'sm':
      default: return 'px-2 py-1 text-[11px]';
    }
  });

  colorClasses = computed(() => {
    if (this.active()) {
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300';
    }

    switch (this.color()) {
      case 'primary': return 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700'; // Updated to match "add:contact" style
      case 'danger': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300';
      case 'default':
      default: return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
    }
  });

  iconSizeClass = computed(() => {
    switch (this.size()) {
      case 'lg': return 'w-5 h-5';
      case 'md': return 'w-4 h-4';
      case 'sm':
      default: return 'w-3.5 h-3.5';
    }
  });

  iconHtml = computed(() => {
    const iconName = this.icon();
    if (!iconName || !IconHelper[iconName]) return null;
    let svg = IconHelper[iconName];
    // Strip existing sizing classes to allow parent container to control size
    svg = svg.replace(/class="([^"]*)"/, (match, classes) => {
      const newClasses = classes.replace(/w-\d+/, '').replace(/h-\d+/, '');
      return `class="${newClasses} w-full h-full"`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}