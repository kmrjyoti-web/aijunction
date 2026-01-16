import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableConfig } from '../../../models/table-config.model';
import { JsonEditorDirective } from '../../../directives/json-editor.directive';
import { ConfigFormComponent } from './config-form/config-form.component';

@Component({
  selector: 'app-config-sidebar',
  standalone: true,
  imports: [CommonModule, JsonEditorDirective, ConfigFormComponent],
  templateUrl: './config-sidebar.component.html',
  styleUrls: ['./config-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigSidebarComponent {
  isOpen = input.required<boolean>();
  config = input.required<TableConfig>();

  close = output<void>();
  save = output<TableConfig>();
  resetToDefaults = output<void>();

  viewMode = signal<'ui' | 'json'>('ui');

  // This signal is the single source of truth for the config being edited.
  currentConfig = signal<TableConfig | null>(null);

  // This is a derived signal for the JSON editor's string value.
  configString = computed(() => {
    const conf = this.currentConfig();
    return conf ? JSON.stringify(conf, null, 2) : '';
  });

  parseError = signal<string | null>(null);
  copySuccess = signal(false);

  private initialConfig: TableConfig | null = null;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const conf = this.config();
        this.initialConfig = conf;
        // Deep copy to avoid mutating the original config service signal
        this.currentConfig.set(JSON.parse(JSON.stringify(conf)));
        this.parseError.set(null);
        this.viewMode.set('ui'); // Default to UI editor on open
      }
    });
  }

  // Called when the JSON editor's content changes
  onJsonConfigChange(newConfigString: string): void {
    try {
      const parsedConfig = JSON.parse(newConfigString);
      this.currentConfig.set(parsedConfig);
      this.parseError.set(null);
      this.save.emit(parsedConfig); // Auto-save
    } catch (e: any) {
      this.parseError.set(`Invalid JSON: ${e.message}`);
    }
  }

  // Called when the UI form emits a change
  onFormConfigChange(newConfig: TableConfig): void {
    this.currentConfig.set(newConfig); // Update the source of truth
    this.parseError.set(null); // Form changes are structurally valid
    this.save.emit(newConfig); // Auto-save
  }

  handleSave(): void {
    // Deprecated: Auto-save is now active.
    // Keeping method structure if needed for explicit triggering, but mostly unused.
    if (this.parseError()) {
      return;
    }
    const configToSave = this.currentConfig();
    if (configToSave) {
      this.save.emit(configToSave);
    }
  }

  handleRevertChanges(): void {
    if (this.initialConfig) {
      const reverted = JSON.parse(JSON.stringify(this.initialConfig));
      this.currentConfig.set(reverted);
      this.parseError.set(null);
      this.save.emit(reverted); // Auto-save revert
    }
  }

  handleRestoreDefaults(): void {
    if (confirm('Are you sure you want to restore factory defaults? This will overwrite your current configuration.')) {
      this.resetToDefaults.emit();
      this.close.emit();
    }
  }

  copyToClipboard(): void {
    const text = this.configString();
    navigator.clipboard.writeText(text).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }
}