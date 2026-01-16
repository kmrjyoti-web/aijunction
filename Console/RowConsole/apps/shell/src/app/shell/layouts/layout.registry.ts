import { Type } from '@angular/core';
import { LayoutId } from '@ai-junction/platform/layout/layout.types';
import { GoogleShellComponent } from './google/google-shell.component';
import { OutlookShellComponent } from './outlook/outlook-shell.component';
import { ClassicShellComponent } from './classic/classic-shell.component';
import { TemplateShellComponent } from './template/template-shell.component';

export type LayoutOption = {
  id: LayoutId;
  label: string;
  component: Type<unknown>;
};

// Central list of layouts -> components and display labels.
export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: 'google', label: 'Google', component: TemplateShellComponent },
  { id: 'outlook', label: 'Microsoft', component: OutlookShellComponent },
  { id: 'classic', label: 'Classic', component: ClassicShellComponent },
  { id: 'modern', label: 'Modern', component: TemplateShellComponent },
  { id: 'dubai', label: 'Dubai', component: TemplateShellComponent },
];

export function getLayoutOption(id: LayoutId): LayoutOption | undefined {
  return LAYOUT_OPTIONS.find((opt) => opt.id === id);
}
