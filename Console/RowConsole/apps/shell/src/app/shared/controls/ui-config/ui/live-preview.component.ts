import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
    selector: 'app-live-preview',
    templateUrl: './live-preview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
})
export class LivePreviewComponent {
    layoutService = inject(LayoutService);

    headerBgColor = computed(() => {
        switch (this.layoutService.layout()) {
            case 'default':
                return 'var(--secondary)';
            case 'google':
                return '#ffffff';
            case 'outlook':
                return 'var(--primary)';
            case 'vscode':
                return '#3c3c3c';
            default:
                return 'var(--primary)';
        }
    });
}