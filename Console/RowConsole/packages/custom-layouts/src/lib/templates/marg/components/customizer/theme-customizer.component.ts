import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MargThemeService, MargTheme } from '../../services/marg-theme.service';

@Component({
  selector: 'app-marg-theme-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="customizer-toggle" (click)="toggle()">
      <i class="icon" [class.open]="isOpen()">⚙️</i>
    </div>

    <div class="customizer-panel" [class.open]="isOpen()">
      <div class="header">
        <h3>Theme Settings</h3>
        <button class="close-btn" (click)="toggle()">×</button>
      </div>

        <div class="content">
        
        <!-- Theme Presets -->
        <div class="section">
           <h4>Color Presets</h4>
           <div class="presets-grid">
               <div class="preset-item" *ngFor="let p of presets" (click)="applyPreset(p)" 
                    [title]="p.name"
                    [style.background]="'linear-gradient(135deg, ' + p.sidebarBg + ' 50%, ' + p.headerBg + ' 50%)'">
               </div>
           </div>
        </div>
        
        <!-- Colors -->
        <div class="section">
          <h4>Colors</h4>
          
          <div class="control-group">
            <label>Header Background</label>
            <input type="color" [ngModel]="themeService.theme().headerBg" (ngModelChange)="update('headerBg', $event)">
          </div>

          <div class="control-group">
            <label>Sidebar Background</label>
            <input type="color" [ngModel]="themeService.theme().sidebarBg" (ngModelChange)="update('sidebarBg', $event)">
          </div>

          <div class="control-group">
            <label>Sidebar Text</label>
            <input type="color" [ngModel]="themeService.theme().sidebarText" (ngModelChange)="update('sidebarText', $event)">
          </div>
          
           <div class="control-group">
            <label>Accent Color</label>
            <input type="color" [ngModel]="themeService.theme().accent" (ngModelChange)="update('accent', $event)">
          </div>
          
           <div class="control-group">
            <label>Icon Color</label>
            <input type="color" [ngModel]="themeService.theme().iconColor" (ngModelChange)="update('iconColor', $event)">
          </div>
        </div>

        <!-- Typography & Zoom -->
        <div class="section">
           <h4>Appearance</h4>
           
           <div class="control-group">
             <label>Font Family</label>
             <select [ngModel]="themeService.theme().fontFamily" (ngModelChange)="update('fontFamily', $event)" style="width: 140px; padding: 4px;">
                <option *ngFor="let font of themeService.availableFonts" [value]="font.value">{{ font.label }}</option>
             </select>
           </div>

           <div class="control-group">
            <label>Font Weight</label>
            <select [ngModel]="themeService.theme().fontWeight" (ngModelChange)="update('fontWeight', $event)" style="width: 140px; padding: 4px;">
               <option *ngFor="let w of themeService.fontWeights" [value]="w.value">{{ w.label }}</option>
            </select>
          </div>

           <div class="control-group">
             <label>Font Size ({{themeService.theme().fontSize}}px)</label>
             <div class="size-controls">
                <button class="icon-btn" (click)="themeService.decreaseFontSize()">-</button>
                <input type="range" min="10" max="24" [ngModel]="themeService.theme().fontSize" (ngModelChange)="update('fontSize', $event)">
                <button class="icon-btn" (click)="themeService.increaseFontSize()">+</button>
             </div>
           </div>

           <div class="control-group">
             <label>Zoom ({{themeService.theme().zoom}}%)</label>
             <div class="size-controls">
                <button class="icon-btn" (click)="themeService.decreaseZoom()">-</button>
                <input type="range" min="70" max="150" step="5" [ngModel]="themeService.theme().zoom" (ngModelChange)="update('zoom', $event)">
                <button class="icon-btn" (click)="themeService.increaseZoom()">+</button>
             </div>
           </div>

            <!-- Background -->
            <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4>Background</h4>
                    <label style="font-size: 11px; cursor: pointer;">
                        <input type="checkbox" [ngModel]="themeService.theme().bgFullPage" (ngModelChange)="update('bgFullPage', $event)"> Full Page
                    </label>
                </div>
                
                <!-- Image Grid -->
                <div class="bg-selector">
                     <div class="bg-option" 
                          *ngFor="let bg of themeService.backgroundImages"
                          (click)="update('bgImage', bg.value)"
                          [class.active]="themeService.theme().bgImage === bg.value"
                          [style.background-image]="bg.value || 'none'"
                          [title]="bg.label">
                          <span *ngIf="!bg.value">None</span>
                     </div>
                </div>

                <!-- Opacity Slider -->
                <div class="control-group" style="margin-top: 15px;" *ngIf="themeService.theme().bgImage">
                    <label>Opacity ({{(themeService.theme().bgOpacity * 100) | number:'1.0-0'}}%)</label>
                    <input type="range" min="0.1" max="1" step="0.05" 
                           [ngModel]="themeService.theme().bgOpacity" 
                           (ngModelChange)="update('bgOpacity', $event)" 
                           style="width: 140px;">
                </div>
            </div>

         <div class="actions">
            <button class="reset-btn" (click)="themeService.reset()">Reset to Default</button>
         </div>

      </div>
    </div>
  `,
  styles: [`
    .customizer-toggle {
      position: fixed;
      right: 0;
      top: 150px;
      background: #1e5f74;
      color: white;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px 0 0 4px;
      cursor: pointer;
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 20px;
    }

    .customizer-panel {
      position: fixed;
      right: -300px;
      top: 0;
      width: 300px;
      height: 100vh;
      background: white;
      box-shadow: -5px 0 15px rgba(0,0,0,0.1);
      z-index: 1001;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;

      &.open {
        right: 0;
      }

      .header {
        padding: 15px;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 { margin: 0; font-size: 16px; color: #333; }
        .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
      }

      .content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;

        .section {
          margin-bottom: 25px;
          
          h4 { margin: 0 0 15px 0; font-size: 14px; color: #888; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        }

        .control-group {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          label { font-size: 13px; color: #555; }
          input[type="color"] { border: none; width: 40px; height: 25px; cursor: pointer; padding: 0; background: none; }
          input[type="range"] { width: 100px; }
          
          .size-controls {
            display: flex;
            align-items: center;
            gap: 5px;
            
            .icon-btn {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #ccc;
                background: #f0f0f0;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                &:hover { background: #e0e0e0; }
            }
          }
        }
        
        .mode-selector {
             display: flex;
             gap: 10px;
             margin-bottom: 10px;
             
             button {
                 flex: 1;
                 padding: 8px;
                 border: 1px solid #ddd;
                 background: #f9f9f9;
                 cursor: pointer;
                 border-radius: 4px;
                 
                 &.active {
                     background: #1e5f74;
                     color: white;
                     border-color: #1e5f74;
                 }
             }
        }
        
        .bg-selector {
            display: flex;
            flex-wrap: wrap; /* Allow wrapping for more options */
            gap: 8px;
            
            .bg-option {
                width: 60px;
                height: 40px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #555;
                font-weight: 500;
                
                &.active {
                    border-color: #1e5f74;
                    border-width: 2px;
                    box-shadow: 0 0 5px rgba(30, 95, 116, 0.3);
                }

                &:hover {
                    border-color: #999;
                }
            }
        }
        .presets-grid {
             display: grid;
             grid-template-columns: repeat(4, 1fr);
             gap: 8px;
             margin-bottom: 5px;
             
             .preset-item {
                 height: 30px;
                 border-radius: 4px;
                 cursor: pointer;
                 border: 1px solid #ddd;
                 transition: transform 0.2s;
                 
                 &:hover {
                     transform: scale(1.1);
                     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                 }
             }
        }
      }
      
      .actions {
          padding: 15px;
          border-top: 1px solid #ddd;
          
          .reset-btn {
              width: 100%;
              padding: 10px;
              background: #f44336;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
          }
      }
    }
  `]
})
export class MargThemeCustomizerComponent {
  themeService = inject(MargThemeService);
  isOpen = signal(false);

  presets = [
    { name: 'Teal (Default)', headerBg: '#1e5f74', sidebarBg: '#0d1e25', sidebarText: '#b0bec5', accent: '#26a69a', iconColor: '#90a4ae' },
    { name: 'Midnight', headerBg: '#1a237e', sidebarBg: '#000051', sidebarText: '#c5cae9', accent: '#534bae', iconColor: '#9fa8da' },
    { name: 'Forest', headerBg: '#2e7d32', sidebarBg: '#1b5e20', sidebarText: '#c8e6c9', accent: '#66bb6a', iconColor: '#a5d6a7' },
    { name: 'Crimson', headerBg: '#b71c1c', sidebarBg: '#7f0000', sidebarText: '#ffcdd2', accent: '#e57373', iconColor: '#ef9a9a' },
    { name: 'Purple', headerBg: '#4a148c', sidebarBg: '#311b92', sidebarText: '#d1c4e9', accent: '#7e57c2', iconColor: '#b39ddb' },
    { name: 'Corporate (Light)', headerBg: '#0078d4', sidebarBg: '#f3f2f1', sidebarText: '#323130', accent: '#0078d4', iconColor: '#605e5c' },
    { name: 'Dark Slate', headerBg: '#263238', sidebarBg: '#102027', sidebarText: '#cfd8dc', accent: '#78909c', iconColor: '#90a4ae' },
    { name: 'Sunset', headerBg: '#e65100', sidebarBg: '#bf360c', sidebarText: '#ffccbc', accent: '#ff6f00', iconColor: '#ffab91' },
    { name: 'Ocean', headerBg: '#01579b', sidebarBg: '#004d40', sidebarText: '#b3e5fc', accent: '#00b0ff', iconColor: '#81d4fa' },
    { name: 'Berry', headerBg: '#880e4f', sidebarBg: '#4a148c', sidebarText: '#f8bbd0', accent: '#f50057', iconColor: '#f48fb1' },
    { name: 'Charcoal', headerBg: '#212121', sidebarBg: '#000000', sidebarText: '#e0e0e0', accent: '#9e9e9e', iconColor: '#bdbdbd' },
    { name: 'Coffee', headerBg: '#4e342e', sidebarBg: '#3e2723', sidebarText: '#d7ccc8', accent: '#8d6e63', iconColor: '#bcaaa4' },
    { name: 'Teal Light', headerBg: '#00796b', sidebarBg: '#e0f2f1', sidebarText: '#004d40', accent: '#00695c', iconColor: '#00897b' },
    { name: 'Royal', headerBg: '#f9a825', sidebarBg: '#212121', sidebarText: '#fff9c4', accent: '#ffeb3b', iconColor: '#fff59d' }
  ];

  toggle() {
    this.isOpen.update(v => !v);
  }

  update(key: keyof MargTheme, value: any) {
    this.themeService.updateTheme({ [key]: value });
  }

  applyPreset(preset: any) {
    this.themeService.updateTheme({
      headerBg: preset.headerBg,
      sidebarBg: preset.sidebarBg,
      sidebarText: preset.sidebarText,
      accent: preset.accent,
      iconColor: preset.iconColor
    });
  }
}
