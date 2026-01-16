import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LivePreviewComponent } from '../../ui/live-preview.component';

@Component({
    selector: 'app-ui-config-page',
    templateUrl: './ui-config-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, LivePreviewComponent],
})
export class UiConfigPageComponent {
    layoutService = inject(LayoutService);

    layouts: { name: Layout, label: string }[] = [
        { name: 'default', label: 'Default' },
        { name: 'google', label: 'Google' },
        { name: 'outlook', label: 'Outlook' },
        { name: 'vscode', label: 'VS Code' },
        { name: 'nature', label: 'Nature' },
        { name: 'blue', label: 'Blue' },
    ];

    menuOrientations: { name: MenuOrientation, label: string }[] = [
        { name: 'vertical', label: 'Vertical' },
        { name: 'horizontal', label: 'Horizontal' },
    ];

    contentWidths: { name: ContentWidth, label: string }[] = [
        { name: 'wide', label: 'Wide' },
        { name: 'boxed', label: 'Boxed' },
    ];

    backgroundImages: { name: string, url: string }[] = [
        { name: 'Abstract 1', url: 'https://picsum.photos/id/1060/1920/1080' },
        { name: 'Abstract 2', url: 'https://picsum.photos/id/1076/1920/1080' },
        { name: 'Nature', url: 'https://picsum.photos/id/10/1920/1080' },
        { name: 'City', url: 'https://picsum.photos/id/22/1920/1080' },
    ];

    iconStyles: { name: IconStyle, label: string }[] = [
        { name: 'outline', label: 'Outline' },
        { name: 'solid', label: 'Solid' },
    ];

    fonts: { name: string, family: string }[] = [
        { name: 'Inter', family: 'Inter' },
        { name: 'Roboto', family: 'Roboto' },
        { name: 'Lato', family: 'Lato' },
        { name: 'Source Code Pro', family: 'Source Code Pro' },
    ];

    fontWeights: { name: string, value: number }[] = [
        { name: 'Normal', value: 400 },
        { name: 'Medium', value: 500 },
        { name: 'Semibold', value: 600 },
        { name: 'Bold', value: 700 },
    ];

    selectLayout(layout: Layout) {
        this.layoutService.setLayout(layout);
    }

    selectMenuOrientation(orientation: MenuOrientation) {
        this.layoutService.setMenuOrientation(orientation);
    }

    selectContentWidth(width: ContentWidth) {
        this.layoutService.setContentWidth(width);
    }

    selectBackgroundImage(url: string | null) {
        this.layoutService.setBackgroundImage(url);
    }

    setIconStyle(style: IconStyle) {
        this.layoutService.iconStyle.set(style);
    }

    setIconStrokeWidth(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.layoutService.iconStrokeWidth.set(parseFloat(value));
    }

    setFontFamily(family: string) {
        this.layoutService.setFontFamily(family);
    }

    setFontSize(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.layoutService.setFontSize(parseFloat(value));
    }

    setFontWeight(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.layoutService.setFontWeight(parseInt(value, 10));
    }

    setZoomLevel(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.layoutService.setZoomLevel(parseFloat(value));
    }
}