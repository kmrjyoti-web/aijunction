
import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { COMPONENT_GALLERY_DATA, ComponentDef } from './gallery.data';
import { FormFieldConfig, FormSchema } from '../../models/form-schema.model';
import { DynamicFieldComponent } from '../../components/dynamic-field/dynamic-field.component';
import { AiAssistantService, ChatMessage } from '../../services/ai-assistant.service';
import { IconHelper, IconName } from '../../helpers/icon.helper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-component-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DynamicFieldComponent],
  template: `
    <div class="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      
      <!-- 1. SIDEBAR MENU -->
      <div class="w-64 bg-slate-50 border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="font-bold text-slate-800">Components</h2>
          <input type="text" placeholder="Filter..." class="mt-2 w-full text-xs px-2 py-1.5 rounded border border-gray-300" (input)="filterComponents($event)">
        </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          @for (comp of filteredComponents(); track comp.id) {
            <button 
              (click)="selectComponent(comp)"
              class="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors"
              [class.bg-white]="selectedComponent()?.id === comp.id"
              [class.shadow-sm]="selectedComponent()?.id === comp.id"
              [class.text-primary]="selectedComponent()?.id === comp.id"
              [class.text-slate-600]="selectedComponent()?.id !== comp.id"
              [class.hover:bg-slate-100]="selectedComponent()?.id !== comp.id"
            >
              <div [innerHTML]="getSafeIcon(comp.icon)" class="w-4 h-4 opacity-70"></div>
              <span class="font-medium">{{ comp.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- 2. MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        
        @if (selectedComponent(); as comp) {
          <!-- Toolbar -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                {{ comp.name }}
                <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wide border border-blue-100">
                  {{ activeVersion()?.version }}
                </span>
              </h1>
              <p class="text-sm text-slate-500 mt-1">{{ comp.description }}</p>
            </div>

            <div class="flex items-center gap-3">
               <!-- Version Selector -->
               <div class="relative">
                 <select 
                   [ngModel]="activeVersionIndex()" 
                   (ngModelChange)="changeVersion($event)"
                   class="appearance-none pl-3 pr-8 py-1.5 rounded-md border border-gray-300 text-sm bg-white hover:border-primary focus:ring-primary cursor-pointer"
                 >
                   @for (ver of comp.versions; track $index) {
                     <option [value]="$index">{{ ver.version }}</option>
                   }
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                 </div>
               </div>
            </div>
          </div>

          <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            <!-- LEFT: Playground & Properties -->
            <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
               
               <!-- Playground -->
               <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[200px] flex flex-col justify-center relative group">
                  <div class="absolute top-2 right-2 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">Playground</div>
                  
                  <!-- THE DYNAMIC COMPONENT RENDERER -->
                  <!-- We wrap it in a form group because BaseDynamicControl expects it -->
                  <form [formGroup]="demoFormGroup">
                     @if (activeConfig()) {
                       <smart-field [field]="activeConfig()!" [group]="demoFormGroup"></smart-field>
                     }
                  </form>

               </div>

               <!-- Tabs for Details -->
               <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div class="flex border-b border-gray-200">
                    <button (click)="detailTab.set('props')" [class]="tabClass('props')">Properties JSON</button>
                    <button (click)="detailTab.set('api')" [class]="tabClass('api')">API & Docs</button>
                  </div>
                  
                  <div class="p-6 bg-slate-50 min-h-[200px]">
                    @if (detailTab() === 'props') {
                       <div class="relative">
                         <textarea 
                           [value]="configJson()" 
                           readonly 
                           class="w-full h-64 font-mono text-xs bg-slate-900 text-green-400 p-4 rounded-lg outline-none resize-none"
                         ></textarea>
                         <div class="absolute top-2 right-4 text-gray-500 text-xs">Read-only (Use AI to edit)</div>
                       </div>
                    } @else {
                       <div class="prose prose-sm max-w-none text-slate-600">
                         <h4 class="text-slate-900">API Documentation</h4>
                         <p>{{ activeVersion()?.apiDocs }}</p>
                         
                         <h4 class="text-slate-900 mt-4">CSS Classes</h4>
                         <p>Uses <code>Tailwind CSS</code> for styling. Override via the <code>ui</code> property in the config.</p>
                       </div>
                    }
                  </div>
               </div>

            </div>

            <!-- RIGHT: AI Assistant -->
            <div class="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-[50vh] md:h-auto">
               <div class="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-indigo-900">AI Designer</h3>
                    <p class="text-[10px] text-indigo-600 font-medium">Auto-detects context</p>
                  </div>
               </div>

               <!-- Chat Messages -->
               <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth" #chatContainer>
                  @if (messages().length === 0) {
                    <div class="text-center mt-10 opacity-60">
                       <p class="text-sm text-slate-500">Ask me to change the label, add validation, or change colors.</p>
                       <div class="mt-4 flex flex-col gap-2">
                         <button (click)="quickPrompt('Make label red')" class="text-xs bg-white border px-2 py-1 rounded shadow-sm hover:bg-indigo-50">"Make label red"</button>
                         <button (click)="quickPrompt('Add required validator')" class="text-xs bg-white border px-2 py-1 rounded shadow-sm hover:bg-indigo-50">"Add required validator"</button>
                       </div>
                    </div>
                  }

                  @for (msg of messages(); track $index) {
                    <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                       <div 
                         class="max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm"
                         [class.bg-indigo-600]="msg.role === 'user'"
                         [class.text-white]="msg.role === 'user'"
                         [class.rounded-tr-none]="msg.role === 'user'"
                         [class.bg-white]="msg.role === 'model'"
                         [class.text-slate-700]="msg.role === 'model'"
                         [class.rounded-tl-none]="msg.role === 'model'"
                         [class.border]="msg.role === 'model'"
                       >
                         {{ msg.text }}
                         @if (msg.isAction) {
                           <div class="mt-1 text-[10px] opacity-70 flex items-center gap-1">
                             <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Updated Config
                           </div>
                         }
                       </div>
                    </div>
                  }
                  
                  @if (isAiThinking()) {
                    <div class="flex justify-start">
                      <div class="bg-white border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  }
               </div>

               <!-- Chat Input -->
               <div class="p-3 border-t border-gray-200 bg-white">
                 <div class="relative">
                   <input 
                     #chatInput
                     type="text" 
                     placeholder="Ask AI to modify this control..."
                     class="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                     (keydown.enter)="sendMessage(chatInput.value); chatInput.value = ''"
                   >
                   <button 
                     class="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                     (click)="sendMessage(chatInput.value); chatInput.value = ''"
                   >
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                   </button>
                 </div>
               </div>

            </div>

          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-slate-400">
             <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
             </div>
             <p class="text-lg font-medium">Select a component to view</p>
          </div>
        }

      </div>
    </div>
  `
})
export class ComponentGalleryComponent {
  private sanitizer = inject(DomSanitizer);
  private aiService = inject(AiAssistantService);

  components = COMPONENT_GALLERY_DATA;

  // State
  selectedComponent = signal<ComponentDef | null>(null);
  activeVersionIndex = signal(0);
  activeConfig = signal<FormFieldConfig | null>(null);
  detailTab = signal<'props' | 'api'>('props');
  searchQuery = signal('');

  // Chat State
  messages = signal<ChatMessage[]>([]);
  isAiThinking = signal(false);

  // Playground Form State
  demoFormGroup = new FormGroup({});

  // Computed
  filteredComponents = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.components.filter(c => c.name.toLowerCase().includes(q));
  });

  activeVersion = computed(() => {
    const comp = this.selectedComponent();
    if (!comp) return null;
    return comp.versions[this.activeVersionIndex()];
  });

  configJson = computed(() => {
    return JSON.stringify(this.activeConfig(), null, 2);
  });

  constructor() {
    // When active version changes, update active config (deep copy to allow mutation by AI)
    effect(() => {
      const ver = this.activeVersion();
      if (ver) {
        // Deep copy
        const freshConfig = JSON.parse(JSON.stringify(ver.config));

        // Reset form group control
        if (this.demoFormGroup.contains(freshConfig.key)) {
          this.demoFormGroup.removeControl(freshConfig.key);
        }
        this.demoFormGroup.addControl(freshConfig.key, new FormControl(freshConfig.defaultValue || ''));

        this.activeConfig.set(freshConfig);
        this.messages.set([]); // Clear chat on switch
      }
    }, { allowSignalWrites: true });
  }

  // --- Actions ---

  selectComponent(comp: ComponentDef) {
    this.selectedComponent.set(comp);
    this.activeVersionIndex.set(0); // Reset to first version (usually v1 or latest based on array order)
  }

  changeVersion(index: any) {
    this.activeVersionIndex.set(Number(index));
  }

  filterComponents(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // --- AI Chat Logic ---

  quickPrompt(text: string) {
    this.sendMessage(text);
  }

  async sendMessage(text: string) {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = { role: 'user', text };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isAiThinking.set(true);

    const currentConfig = this.activeConfig();
    const compName = this.selectedComponent()?.name || 'Component';

    if (currentConfig) {
      // 2. Call Service
      const response = await this.aiService.sendMessage(
        text,
        currentConfig,
        compName,
        this.messages()
      );

      this.isAiThinking.set(false);

      // 3. Handle Response
      if (response.newConfig) {
        // Update the component config in real-time
        this.activeConfig.set(response.newConfig);

        // Add AI Message with "Action" flag
        this.messages.update(msgs => [...msgs, {
          role: 'model',
          text: response.text,
          isAction: true
        }]);
      } else {
        // Just text response
        this.messages.update(msgs => [...msgs, {
          role: 'model',
          text: response.text
        }]);
      }
    }
  }

  // --- UI Helpers ---

  getSafeIcon(name: any): any {
    if (!name || !IconHelper[name as IconName]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name as IconName]);
  }

  tabClass(tab: string) {
    const isActive = this.detailTab() === tab;
    return `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700'
      }`;
  }
}
