
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SnippetGroup {
  title: string;
  items: { name: string; code: string }[];
}

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-h-[80vh] flex flex-col md:flex-row">
      
      <!-- Sidebar / Tab Navigation -->
      <div class="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex-shrink-0">
        <h3 class="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          Implementation
        </h3>
        
        <nav class="space-y-2">
          @for (tab of tabs; track tab.id) {
            <button 
              (click)="activeTab.set(tab.id)"
              class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group"
              [class.bg-white]="activeTab() === tab.id"
              [class.shadow-md]="activeTab() === tab.id"
              [class.text-primary]="activeTab() === tab.id"
              [class.ring-1]="activeTab() === tab.id"
              [class.ring-gray-200]="activeTab() === tab.id"
              [class.text-slate-600]="activeTab() !== tab.id"
              [class.hover:bg-slate-100]="activeTab() !== tab.id"
            >
              <span>{{ tab.label }}</span>
              @if (activeTab() === tab.id) {
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              }
            </button>
          }
        </nav>

        <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-xs text-blue-800 font-medium">
            This library supports <strong>Hybrid Implementation</strong>. You can mix dynamic forms, standalone controls, and native directives in the same app.
          </p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-8 md:p-10 overflow-y-auto max-h-[calc(100vh-100px)] bg-white">
         
         @switch (activeTab()) {
           
           <!-- DYNAMIC FORM GUIDE -->
           @case ('dynamic') {
             <div class="space-y-8 animate-fadeIn">
                <div>
                  <h1 class="text-3xl font-bold text-slate-900 mb-2">Dynamic Forms</h1>
                  <p class="text-lg text-slate-500">The core engine. Renders forms entirely from a JSON Schema configuration.</p>
                </div>

                <div class="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Implementation Step 1: Template</h3>
                  <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm font-mono text-blue-300">
                    &lt;app-dynamic-form [config]="mySchema" (formSubmit)="onSubmit($event)"&gt;&lt;/app-dynamic-form&gt;
                  </div>
                </div>

                <div class="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Implementation Step 2: JSON Schema</h3>
                  <p class="text-sm text-slate-600 mb-4">Define your structure in TypeScript or load from an API.</p>
                  <pre class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-400 leading-relaxed">{{ jsonExample }}</pre>
                </div>

                <div>
                  <h3 class="font-bold text-slate-800 mb-3">Supported Control Types</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (type of controlTypes; track type) {
                      <span class="px-2.5 py-1 bg-gray-100 text-slate-600 text-xs font-mono rounded-md border border-gray-200">
                        {{ type }}
                      </span>
                    }
                  </div>
                </div>
             </div>
           }

           <!-- STANDALONE COMPONENTS GUIDE -->
           @case ('standalone') {
             <div class="space-y-12 animate-fadeIn">
                <div>
                  <h1 class="text-3xl font-bold text-slate-900 mb-2">Standalone Controls</h1>
                  <p class="text-lg text-slate-500">Use specialized components individually within your standard Angular templates. Each component supports <code>FormControl</code> binding.</p>
                </div>

                @for (group of standaloneGroups; track group.title) {
                  <div>
                    <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span class="w-1.5 h-6 bg-primary rounded-full"></span>
                      {{ group.title }}
                    </h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      @for (item of group.items; track item.name) {
                        <div class="bg-slate-50 p-5 rounded-lg border border-gray-200 flex flex-col">
                          <h4 class="font-bold text-slate-700 text-sm mb-2">{{ item.name }}</h4>
                          <div class="bg-slate-900 rounded-lg p-3 overflow-x-auto text-xs font-mono text-purple-300 flex-1 flex items-center">
                            <pre [innerText]="item.code"></pre>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="mt-8 pt-8 border-t border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Common Input Properties</h3>
                  <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">label</span> Floating label text</li>
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">placeholder</span> Placeholder text</li>
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">required</span> Adds validator & asterisk</li>
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">disabled</span> Disables interaction</li>
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">options</span> Array for selection controls</li>
                    <li class="flex items-center gap-2"><span class="font-mono bg-gray-100 px-1 rounded text-primary">formControl</span> Standard ReactiveForms binding</li>
                  </ul>
                </div>
             </div>
           }

           <!-- DIRECTIVES GUIDE -->
           @case ('directive') {
             <div class="space-y-8 animate-fadeIn">
                <div>
                  <h1 class="text-3xl font-bold text-slate-900 mb-2">Smart UI Directives</h1>
                  <p class="text-lg text-slate-500">The lightweight approach. Apply the "Smart" aesthetic to vanilla HTML elements instantly.</p>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p class="text-sm text-yellow-800">
                    <strong>Note:</strong> Directives only provide <em>styling</em>. You are responsible for handling state (ngModel or FormControl) and logic.
                  </p>
                </div>

                <!-- Input Example -->
                <div class="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Styling Native Inputs</h3>
                  <p class="text-sm text-slate-500 mb-4">Use <code>smartContainer</code> on the wrapper, <code>smartInput</code> on the input, and <code>smartLabel</code> on the label.</p>
                  
                  <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm font-mono text-orange-300">
                    <pre [innerText]="snippets.directive.input"></pre>
                  </div>
                </div>

                <!-- Button Example -->
                <div class="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Styling Native Buttons</h3>
                  <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm font-mono text-orange-300">
                    <pre [innerText]="snippets.directive.button"></pre>
                  </div>
                </div>

                <!-- Checkbox Example -->
                <div class="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 class="font-bold text-slate-800 mb-4">Styling Checkboxes & Radios</h3>
                  <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm font-mono text-orange-300">
                    <pre [innerText]="snippets.directive.checkbox"></pre>
                  </div>
                </div>

                <!-- API Table -->
                <div class="overflow-hidden border border-gray-200 rounded-xl">
                  <table class="min-w-full text-sm text-left">
                    <thead class="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                      <tr>
                        <th class="px-6 py-3">Selector</th>
                        <th class="px-6 py-3">Inputs</th>
                        <th class="px-6 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr class="bg-white">
                        <td class="px-6 py-3 font-mono text-primary">smartContainer</td>
                        <td class="px-6 py-3 text-gray-500">-</td>
                        <td class="px-6 py-3">Wrapper block for layout & spacing.</td>
                      </tr>
                      <tr class="bg-gray-50">
                        <td class="px-6 py-3 font-mono text-primary">smartInput</td>
                        <td class="px-6 py-3 font-mono text-xs">size, hasError, hasIconPrefix</td>
                        <td class="px-6 py-3">Tailwind classes for text inputs/selects.</td>
                      </tr>
                      <tr class="bg-white">
                        <td class="px-6 py-3 font-mono text-primary">smartLabel</td>
                        <td class="px-6 py-3 font-mono text-xs">size, floatingMode</td>
                        <td class="px-6 py-3">Floating label behavior.</td>
                      </tr>
                      <tr class="bg-gray-50">
                        <td class="px-6 py-3 font-mono text-primary">smartButton</td>
                        <td class="px-6 py-3 font-mono text-xs">variant, size</td>
                        <td class="px-6 py-3">Button variants (primary, ghost, danger...).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

             </div>
           }
         }
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DocumentationComponent {
  activeTab = signal<'dynamic' | 'standalone' | 'directive'>('dynamic');

  tabs = [
    { id: 'dynamic', label: 'Dynamic Forms (JSON)' },
    { id: 'standalone', label: 'Standalone Controls' },
    { id: 'directive', label: 'Native Directives' }
  ];

  controlTypes = [
    'text', 'number', 'email', 'password', 'textarea', 'select', 'multi-select', 
    'checkbox', 'radio-group', 'switch', 'date', 'mobile', 'currency', 'rating', 
    'slider', 'tags', 'segment', 'file-upload', 'signature', 'otp', 'button', 'fieldset',
    'editor', 'color', 'toggle-button', 'autocomplete', 'list-checkbox', 'confirm-dialog', 'alert-dialog'
  ];

  jsonExample = `{
  "title": "User Registration",
  "layout": "standard",
  "rows": [
    {
      "columns": [
        {
          "span": "col-span-12 md:col-span-6",
          "field": {
            "key": "firstName",
            "type": "text",
            "label": "First Name",
            "validators": { "required": true }
          }
        },
        {
          "span": "col-span-12 md:col-span-6",
          "field": {
            "key": "role",
            "type": "select",
            "label": "Role",
            "options": [
               { "label": "Admin", "value": "admin" },
               { "label": "User", "value": "user" }
            ]
          }
        }
      ]
    }
  ]
}`;

  // Comprehensive list of standalone examples
  standaloneGroups: SnippetGroup[] = [
    {
      title: "Text Inputs",
      items: [
        { name: "Text", code: `<smart-textbox label="Name" placeholder="John Doe" [formControl]="ctrl"></smart-textbox>` },
        { name: "Password", code: `<smart-textbox type="password" label="Password" [formControl]="ctrl"></smart-textbox>` },
        { name: "Number", code: `<smart-textbox type="number" label="Age" [formControl]="ctrl"></smart-textbox>` },
        { name: "Textarea", code: `<smart-textbox type="textarea" label="Description" [props]="{rows:4}" [formControl]="ctrl"></smart-textbox>` },
        { name: "Email", code: `<smart-textbox type="email" label="Email" prefixIcon="envelope" [formControl]="ctrl"></smart-textbox>` },
      ]
    },
    {
      title: "Selection",
      items: [
        { name: "Select", code: `<smart-select label="City" [options]="opts" [formControl]="ctrl"></smart-select>` },
        { name: "Multi Select", code: `<smart-multi-select label="Skills" [options]="opts" [formControl]="ctrl"></smart-multi-select>` },
        { name: "Autocomplete", code: `<smart-autocomplete label="Search" [options]="opts" [formControl]="ctrl"></smart-autocomplete>` },
        { name: "Tags", code: `<smart-tags label="Keywords" [formControl]="ctrl"></smart-tags>` },
        { name: "Segment", code: `<smart-segment label="Priority" [options]="opts" [formControl]="ctrl"></smart-segment>` },
      ]
    },
    {
      title: "Buttons & SplitButtons",
      items: [
        { 
          name: "Standard Button", 
          code: `<smart-button placeholder="Save" [props]="{variant:'primary'}" (click)="onSave()"></smart-button>` 
        },
        { 
          name: "Split Button", 
          code: `<smart-button 
  placeholder="Save" 
  prefixIcon="checkCircle"
  [props]="{ buttonType: 'split', variant: 'primary' }"
  [options]="[
    { label: 'Save & Close', value: 'close', icon: 'lock' },
    { label: 'Save & New', value: 'new', icon: 'plus' }
  ]"
  (click)="onSave()"
></smart-button>` 
        },
        {
          name: "Button Group",
          code: `<smart-button
  [props]="{ buttonType: 'group' }"
  [options]="[
    { label: 'Left', value: 'left', icon: 'alignLeft' },
    { label: 'Center', value: 'center', icon: 'alignCenter' },
    { label: 'Right', value: 'right', icon: 'alignRight' }
  ]"
></smart-button>`
        }
      ]
    },
    {
      title: "Dialog Triggers",
      items: [
        { 
          name: "Confirm Dialog", 
          code: `<smart-dialog-button 
  placeholder="Delete"
  [props]="{ 
    dialogTitle: 'Delete Item?', 
    dialogMessage: 'This action cannot be undone.', 
    dialogType: 'danger', 
    confirmText: 'Delete' 
  }" 
></smart-dialog-button>` 
        },
        { 
          name: "Alert Dialog", 
          code: `<smart-dialog-button 
  placeholder="Info"
  [field]="{ type: 'alert-dialog', key: 'alert' }"
  [props]="{ 
    dialogTitle: 'Success', 
    dialogMessage: 'Operation completed successfully.', 
    dialogType: 'success', 
    confirmText: 'OK' 
  }" 
></smart-dialog-button>` 
        }
      ]
    },
    {
      title: "Toggles & Checks",
      items: [
        { name: "Checkbox", code: `<smart-checkbox label="Accept Terms" [formControl]="ctrl"></smart-checkbox>` },
        { name: "Switch", code: `<smart-switch label="Notifications" [formControl]="ctrl"></smart-switch>` },
        { name: "Toggle Button", code: `<smart-toggle-button label="Bold" prefixIcon="bold" [formControl]="ctrl"></smart-toggle-button>` },
        { name: "Radio Group", code: `<smart-radio-group label="Gender" [options]="opts" [formControl]="ctrl"></smart-radio-group>` },
        { name: "Checkbox Group", code: `<smart-checkbox-group label="Interests" [options]="opts" [formControl]="ctrl"></smart-checkbox-group>` },
        { name: "List Checkbox", code: `<smart-list-checkbox label="Users" [options]="opts" [formControl]="ctrl"></smart-list-checkbox>` },
      ]
    },
    {
      title: "Special Inputs",
      items: [
        { name: "Date", code: `<smart-date-picker label="Birthday" [formControl]="ctrl"></smart-date-picker>` },
        { name: "Mobile", code: `<smart-mobile label="Phone" [props]="{defaultCountry:'+1'}" [formControl]="ctrl"></smart-mobile>` },
        { name: "Currency", code: `<smart-currency label="Price" [props]="{currency:'$'}" [formControl]="ctrl"></smart-currency>` },
        { name: "OTP", code: `<smart-otp label="Verification Code" [props]="{length:4}" [formControl]="ctrl"></smart-otp>` },
        { name: "Color", code: `<smart-color-picker label="Theme Color" [formControl]="ctrl"></smart-color-picker>` },
      ]
    },
    {
      title: "Rich Content",
      items: [
        { name: "Rating", code: `<smart-rating label="Score" [formControl]="ctrl"></smart-rating>` },
        { name: "Slider", code: `<smart-slider label="Volume" [min]="0" [max]="100" [formControl]="ctrl"></smart-slider>` },
        { name: "Signature", code: `<smart-signature label="Sign Here" [formControl]="ctrl"></smart-signature>` },
        { name: "File Upload", code: `<smart-file-upload label="Avatar" [props]="{accept:'image/*'}" [formControl]="ctrl"></smart-file-upload>` },
        { name: "Rich Editor", code: `<smart-rich-editor label="Bio" [formControl]="ctrl"></smart-rich-editor>` },
      ]
    }
  ];

  snippets = {
    directive: {
      input: `<div smartContainer>
  <input 
     smartInput 
     type="text" 
     id="email" 
     placeholder=" " <!-- Required for CSS peer logic -->
  />
  <label smartLabel for="email">Email Address</label>
</div>`,
      button: `<button smartButton variant="primary">Primary</button>
<button smartButton variant="outline">Outline</button>
<button smartButton variant="danger" size="small">Delete</button>`,
      checkbox: `<label class="flex items-center gap-2">
  <input type="checkbox" smartCheckbox />
  <span>I agree to terms</span>
</label>

<label class="flex items-center gap-2">
  <input type="radio" smartRadio name="opt" />
  <span>Option A</span>
</label>`
    }
  };
}
