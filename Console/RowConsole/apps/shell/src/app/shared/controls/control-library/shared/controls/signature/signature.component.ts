
import { Component, ElementRef, ViewChild, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-signature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <div class="relative">
        <canvas 
          #canvas
          [width]="width"
          [height]="height"
          [class]="ui.signaturePad"
          [class.border-danger]="hasError()"
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="startDrawing($event)"
          (touchmove)="draw($event)"
          (touchend)="stopDrawing()"
        ></canvas>

        <button 
           type="button" 
           (click)="clear()"
           [class]="ui.signatureClearBtn"
        >
          Clear
        </button>
      </div>

      <p class="text-xs text-gray-400 mt-1">Sign above inside the box.</p>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class SignatureComponent extends BaseDynamicControl implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private cdr = inject(ChangeDetectorRef);
  
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  
  width = 500;
  height = 200;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    
    // Responsive Width
    const parentWidth = canvas.parentElement?.clientWidth || 500;
    
    // Update width to match container
    this.width = parentWidth;
    
    // Manually trigger change detection to avoid NG0100 error
    // because we are updating a bound property (width) after view check.
    this.cdr.detectChanges(); 
    
    // Ensure canvas internal dimensions match
    canvas.width = this.width;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000';

    // Load existing value if any
    const val = this.control()?.value;
    if (val && typeof val === 'string' && val.startsWith('data:image')) {
       const img = new Image();
       img.onload = () => {
         this.ctx.drawImage(img, 0, 0);
       };
       img.src = val;
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDrawing = true;
    this.ctx.beginPath();
    
    const { x, y } = this.getCoords(event);
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    event.preventDefault();
    
    const { x, y } = this.getCoords(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.save();
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.control()?.setValue(null);
  }

  save() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL();
    this.control()?.setValue(dataUrl);
    this.control()?.markAsDirty();
  }

  private getCoords(event: MouseEvent | TouchEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
}
