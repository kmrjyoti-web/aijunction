import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutTargetView } from '../../../models/custom-layout.model';

export interface GenerateLayoutEvent {
  name: string;
  targetView: LayoutTargetView;
  prompt: {
    html?: string;
    image?: {
        data: string; // base64 data
        mimeType: string;
    };
  };
}

@Component({
  selector: 'app-create-layout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-layout-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLayoutModalComponent {
  close = output<void>();
  generate = output<GenerateLayoutEvent>();

  activeTab = signal<'image' | 'html'>('image');
  layoutName = signal('');
  targetView = signal<LayoutTargetView>('card');
  htmlPrompt = signal('');
  imageBase64 = signal<string | null>(null);
  fileName = signal('');

  formIsValid = computed(() => {
    const hasName = this.layoutName().trim().length > 0;
    const hasPrompt = (this.activeTab() === 'image' && !!this.imageBase64()) || (this.activeTab() === 'html' && this.htmlPrompt().trim().length > 0);
    return hasName && hasPrompt;
  });

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileName.set(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageBase64.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  handleGenerate(): void {
    if (!this.formIsValid()) return;

    const event: GenerateLayoutEvent = {
      name: this.layoutName().trim(),
      targetView: this.targetView(),
      prompt: {},
    };

    if (this.activeTab() === 'image' && this.imageBase64()) {
      const parts = this.imageBase64()!.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const data = parts[1];
      event.prompt.image = { data, mimeType };
    } else {
      event.prompt.html = this.htmlPrompt();
    }
    
    this.generate.emit(event);
  }
}
