import { Directive, ElementRef, Output, EventEmitter, inject, effect } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);
  @Output() clickOutside = new EventEmitter<void>();

  constructor() {
    effect(() => {
      const handleClick = (event: MouseEvent) => {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside) {
          this.clickOutside.emit();
        }
      };

      document.addEventListener('mousedown', handleClick);
      
      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    });
  }
}
