
import { Component, ElementRef, ViewChild, inject, OnInit, HostListener, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { TranslationService } from '../../../services/translation.service';
import { Subject, debounceTime, filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_EDITOR_CONFIG, EditorConfig } from '../../../models/editor-config.model';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  target: HTMLElement | null;
  templateElement: HTMLElement | null; // Track the parent template wrapper
  isTableContext: boolean;
  isImageContext: boolean;
  isLinkContext: boolean;
}

interface ResizeState {
  element: HTMLElement;
  type: 'col' | 'row';
  startMouse: number;
  startSize: number;
}

@Component({
  selector: 'smart-rich-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container" #containerRef>
      
      <!-- Label -->
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <div [class]="ui.editorContainer" [class.border-danger]="hasError()">
        
        <!-- Toolbar (Split into 2 Rows) -->
        <div class="flex flex-col border-b border-gray-200 bg-gray-50">
          
          <!-- ROW 1: Icons & Actions -->
          <div class="flex items-center gap-1 flex-wrap p-2 border-b border-gray-200/60" [class.opacity-50]="showCodeView" [class.pointer-events-none]="showCodeView">
            
            <!-- History -->
            @if (editorConfig().showToolbar.history) {
              <button type="button" (click)="exec('undo')" [class]="ui.editorBtn" title="Undo"><div [innerHTML]="getSafeIcon('undo')"></div></button>
              <button type="button" (click)="exec('redo')" [class]="ui.editorBtn" title="Redo"><div [innerHTML]="getSafeIcon('redo')"></div></button>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
            }

            <!-- Basic Format -->
            @if (editorConfig().showToolbar.basicFormatting) {
              <button type="button" (click)="exec('bold')" [class]="ui.editorBtn" title="Bold"><div [innerHTML]="getSafeIcon('bold')"></div></button>
              <button type="button" (click)="exec('italic')" [class]="ui.editorBtn" title="Italic"><div [innerHTML]="getSafeIcon('italic')"></div></button>
              <button type="button" (click)="exec('underline')" [class]="ui.editorBtn" title="Underline"><div [innerHTML]="getSafeIcon('underline')"></div></button>
              <button type="button" (click)="exec('strikeThrough')" [class]="ui.editorBtn" title="Strikethrough"><div [innerHTML]="getSafeIcon('strikethrough')"></div></button>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
            }

            <!-- Colors -->
            @if (editorConfig().showToolbar.colors) {
              <div class="relative flex items-center group" title="Text Color">
                <input type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" (click)="saveSelection()" (input)="applyColor('foreColor', $event)">
                <button type="button" [class]="ui.editorBtn"><div [innerHTML]="getSafeIcon('fontColor')"></div></button>
              </div>
              <div class="relative flex items-center group" title="Highlight">
                <input type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" (click)="saveSelection()" (input)="applyColor('hiliteColor', $event)" value="#fde047">
                <button type="button" [class]="ui.editorBtn"><div [innerHTML]="getSafeIcon('highlight')"></div></button>
              </div>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
            }

            <!-- Alignment -->
            @if (editorConfig().showToolbar.alignment) {
              <button type="button" (click)="exec('justifyLeft')" [class]="ui.editorBtn" title="Align Left"><div [innerHTML]="getSafeIcon('alignLeft')"></div></button>
              <button type="button" (click)="exec('justifyCenter')" [class]="ui.editorBtn" title="Align Center"><div [innerHTML]="getSafeIcon('alignCenter')"></div></button>
              <button type="button" (click)="exec('justifyRight')" [class]="ui.editorBtn" title="Align Right"><div [innerHTML]="getSafeIcon('alignRight')"></div></button>
              <button type="button" (click)="exec('justifyFull')" [class]="ui.editorBtn" title="Justify"><div [innerHTML]="getSafeIcon('alignJustify')"></div></button>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
            }

            <!-- Indent & Lists -->
            @if (editorConfig().showToolbar.lists) {
              <button type="button" (click)="exec('outdent')" [class]="ui.editorBtn" title="Decrease Indent"><div [innerHTML]="getSafeIcon('outdent')"></div></button>
              <button type="button" (click)="exec('indent')" [class]="ui.editorBtn" title="Increase Indent"><div [innerHTML]="getSafeIcon('indent')"></div></button>
              <button type="button" (click)="exec('insertUnorderedList')" [class]="ui.editorBtn" title="Bullet List"><div [innerHTML]="getSafeIcon('listBullet')"></div></button>
              <button type="button" (click)="exec('insertOrderedList')" [class]="ui.editorBtn" title="Ordered List"><div [innerHTML]="getSafeIcon('listOrdered')"></div></button>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
            }

            <!-- Script & Code -->
            @if (editorConfig().showToolbar.scripts) {
              <button type="button" (click)="exec('subscript')" [class]="ui.editorBtn" title="Subscript"><div [innerHTML]="getSafeIcon('subscript')"></div></button>
              <button type="button" (click)="exec('superscript')" [class]="ui.editorBtn" title="Superscript"><div [innerHTML]="getSafeIcon('superscript')"></div></button>
              <button type="button" (click)="exec('inlineCode')" [class]="ui.editorBtn" title="Inline Code"><div [innerHTML]="getSafeIcon('inlineCode')"></div></button>
            }

            <!-- Toggle Code View (Always active if config allows, Right Aligned) -->
            @if (editorConfig().showToolbar.codeView) {
              <div class="ml-auto border-l border-gray-300 pl-2">
                 <button 
                    type="button" 
                    (click)="toggleCodeView()" 
                    [class]="ui.editorBtn" 
                    [class.bg-gray-200]="showCodeView"
                    [class.text-primary]="showCodeView"
                    title="Code View"
                    class="pointer-events-auto"
                  >
                  <div [innerHTML]="getSafeIcon('code')"></div>
                </button>
              </div>
            }
          </div>

          <!-- ROW 2: Dropdowns & Transliteration -->
          <div class="flex items-center gap-2 p-2 bg-gray-50/50" [class.opacity-50]="showCodeView" [class.pointer-events-none]="showCodeView">
            
            <!-- Insert Template -->
            @if (editorConfig().showToolbar.templates) {
              <select 
                (change)="insertTemplate($event)" 
                class="h-8 text-xs border border-gray-300 rounded px-2 bg-white text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer min-w-[100px]"
                title="Insert Component"
              >
                <option value="" disabled selected>Insert...</option>
                @for (tmpl of editorConfig().dropdownOptions.templates; track tmpl.value) {
                  <option [value]="tmpl.value">{{ tmpl.label }}</option>
                }
              </select>
            }

            <!-- Heading -->
            @if (editorConfig().showToolbar.headings) {
              <select 
                (change)="applyHeading($event)" 
                class="h-8 text-xs border border-gray-300 rounded px-2 bg-white text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer min-w-[90px]"
                title="Text Format"
              >
                <option value="" disabled selected>Style</option>
                @for (head of editorConfig().dropdownOptions.headings; track head.value) {
                  <option [value]="head.value">{{ head.label }}</option>
                }
              </select>
            }

            <!-- Font Selection -->
            @if (editorConfig().showToolbar.fonts) {
              <select 
                (change)="applyFont($event)" 
                class="h-8 text-xs border border-gray-300 rounded px-2 bg-white text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer min-w-[110px]"
                title="Font Family"
              >
                <option value="" disabled selected>Font Family</option>
                @for (font of editorConfig().dropdownOptions.fonts; track font) {
                  <option [value]="font" [style.font-family]="font">{{ font }}</option>
                }
              </select>
            }

            <!-- Font Size -->
            @if (editorConfig().showToolbar.fontSizes) {
              <select 
                (change)="applyFontSize($event)" 
                class="h-8 text-xs border border-gray-300 rounded px-2 bg-white text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer min-w-[80px]"
                title="Font Size"
              >
                <option value="" disabled selected>Size</option>
                @for (size of editorConfig().dropdownOptions.fontSizes; track size.value) {
                  <option [value]="size.value">{{ size.label }}</option>
                }
              </select>
            }

            <!-- Transliteration Controls -->
            @if (isTransliterationEnabled()) {
               <div class="ml-auto flex items-center gap-2 border-l border-gray-200 pl-2">
                 <!-- Converting Spinner -->
                 @if (isConverting()) {
                    <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 } 
                 
                 <!-- Full UI: Dropdown & Toggle (Visible when showControls = true) -->
                 @if (showTransliterationControls()) {
                    @if (!isConverting()) {
                       <div [innerHTML]="getSafeIcon('language')" class="text-gray-400 w-4 h-4"></div>
                    }
                    <select 
                      [value]="selectedLanguage()" 
                      (change)="onLanguageChange($event)"
                      class="h-8 text-xs border border-gray-300 rounded px-2 bg-white text-primary font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      @for (lang of supportedLanguages(); track lang) {
                        <option [value]="lang">{{ lang }}</option>
                      }
                    </select>

                    <button 
                      type="button" 
                      (click)="toggleAutoConvert()" 
                      class="h-8 px-2 text-[10px] rounded border transition-colors flex items-center justify-center font-bold"
                      [class.bg-primary]="isAutoConvert()"
                      [class.text-white]="isAutoConvert()"
                      [class.border-primary]="isAutoConvert()"
                      [class.bg-white]="!isAutoConvert()"
                      [class.text-gray-500]="!isAutoConvert()"
                      [class.border-gray-300]="!isAutoConvert()"
                      title="Auto-convert typing to {{ selectedLanguage() }}"
                    >
                      AUTO
                    </button>
                 } @else {
                    <!-- Compact UI: Manual Trigger Button (Visible when showControls = false) -->
                    <button 
                       type="button"
                       (click)="manualConvert()"
                       [class]="ui.editorBtn"
                       [title]="'Transliterate to ' + selectedLanguage()"
                    >
                       <div [innerHTML]="getSafeIcon('magic')"></div>
                    </button>
                 }
               </div>
            }

          </div>

        </div>

        <!-- Editable Area -->
        <div class="relative">
          
          <!-- Visual Editor -->
          <div 
            [id]="field.key"
            #editor
            contenteditable="true"
            [style.display]="showCodeView ? 'none' : 'block'"
            [class]="ui.editorContent"
            (input)="onInput()"
            (blur)="onBlur()"
            (contextmenu)="onContextMenu($event)"
            (mousemove)="onEditorMouseMove($event)"
            (mousedown)="onEditorMouseDown($event)"
            spellcheck="false"
          ></div>

          <!-- Code Editor -->
          <textarea
            [style.display]="showCodeView ? 'block' : 'none'"
            [formControl]="$any(control())"
            [class]="ui.editorContent"
            class="w-full font-mono text-sm resize-y outline-none bg-slate-50 text-slate-700"
            spellcheck="false"
          ></textarea>

        </div>

      </div>

      <!-- Hidden File Input for Image Change -->
      <input type="file" #imageUploadInput class="hidden" accept="image/*" (change)="handleImageUpload($event)">

      <!-- Custom Context Menu -->
      @if (menu().visible) {
        <div 
          class="absolute z-50 bg-white shadow-xl border border-gray-200 rounded-lg py-2 w-72 text-sm flex flex-col animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto"
          [style.top.px]="menu().y"
          [style.left.px]="menu().x"
          (click)="$event.stopPropagation()"
        >
           <!-- (Context Menu Content Omitted for Brevity - Same as before) -->
           <!-- ... -->
        </div>
        <div class="fixed inset-0 z-40" (click)="closeContextMenu()"></div>
      }

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class RichTextEditorComponent extends BaseDynamicControl implements OnInit {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef<HTMLInputElement>;
  
  private sanitizer = inject(DomSanitizer);
  private translationService = inject(TranslationService);
  private destroyRef = inject(DestroyRef);
  
  private savedRange: Range | null = null;
  
  showCodeView = false;
  
  // Context Menu State
  menu = signal<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    templateElement: null,
    isTableContext: false,
    isImageContext: false,
    isLinkContext: false
  });

  // Resize State
  resizeState: ResizeState | null = null;
  resizeTarget: { element: HTMLElement, type: 'col' | 'row' } | null = null;

  // Transliteration State
  isTransliterationEnabled = computed(() => !!this.field.transliteration?.enabled);
  showTransliterationControls = computed(() => this.isTransliterationEnabled() && !!this.field.transliteration?.showControls);

  supportedLanguages = computed(() => this.field.transliteration?.languages || ['Hindi', 'Gujarati', 'Urdu', 'Marathi', 'Bengali']);
  selectedLanguage = signal('Hindi');
  isAutoConvert = signal(false);
  isConverting = signal(false);

  // Configuration (Computed to allow field-level overrides via props)
  editorConfig = computed<EditorConfig>(() => {
    const customConfig = this.field.props?.['editorConfig'] as Partial<EditorConfig>;
    
    if (!customConfig) return DEFAULT_EDITOR_CONFIG;

    return {
      showToolbar: { 
        ...DEFAULT_EDITOR_CONFIG.showToolbar, 
        ...(customConfig.showToolbar || {}) 
      },
      dropdownOptions: {
        templates: customConfig.dropdownOptions?.templates || DEFAULT_EDITOR_CONFIG.dropdownOptions.templates,
        headings: customConfig.dropdownOptions?.headings || DEFAULT_EDITOR_CONFIG.dropdownOptions.headings,
        fonts: customConfig.dropdownOptions?.fonts || DEFAULT_EDITOR_CONFIG.dropdownOptions.fonts,
        fontSizes: customConfig.dropdownOptions?.fontSizes || DEFAULT_EDITOR_CONFIG.dropdownOptions.fontSizes,
      }
    };
  });

  // Debounce Subject for Transliteration
  private contentSubject = new Subject<string>();

  override ngOnInit() {
    super.ngOnInit();
    if (this.field.transliteration?.defaultLanguage) {
      this.selectedLanguage.set(this.field.transliteration.defaultLanguage);
    }
    
    if (this.field.transliteration?.autoConvert) {
      this.isAutoConvert.set(true);
    }

    // Setup Debounced Auto-Convert
    this.contentSubject.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => this.isAutoConvert()), // Only if auto is on
      debounceTime(2000), // Wait 2 seconds (longer for rich text)
      switchMap(html => {
        if (!html) return Promise.resolve('');
        this.isConverting.set(true);
        // We pass the full HTML. The service is instructed to preserve tags.
        return this.translationService.transliterate(html, this.selectedLanguage());
      })
    ).subscribe({
      next: (converted) => {
        this.isConverting.set(false);
        if (converted && this.editorRef) {
          const currentSelection = this.saveSelectionSnapshot();
          this.editorRef.nativeElement.innerHTML = converted;
          this.control()?.setValue(converted, { emitEvent: false });
        }
      },
      error: () => this.isConverting.set(false)
    });
  }

  ngAfterViewInit() {
     const initialVal = this.control()?.value;
     if (initialVal && this.editorRef) {
       this.editorRef.nativeElement.innerHTML = initialVal;
     }
  }

  // --- Transliteration Controls ---
  toggleAutoConvert() {
    this.isAutoConvert.update(v => !v);
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLanguage.set(select.value);
  }
  
  async manualConvert() {
    if (this.isConverting()) return;
    const val = this.editorRef.nativeElement.innerHTML;
    if (!val) return;

    this.isConverting.set(true);
    const converted = await this.translationService.transliterate(val, this.selectedLanguage());
    this.editorRef.nativeElement.innerHTML = converted;
    this.control()?.setValue(converted);
    this.isConverting.set(false);
  }

  saveSelectionSnapshot() {
    return null;
  }

  // --- Core Editor Logic ---
  
  onInput() {
    const html = this.editorRef.nativeElement.innerHTML;
    const clean = (html === '<br>' || html === '<div><br></div>') ? '' : html;
    
    this.control()?.setValue(clean);
    this.control()?.markAsDirty();

    if (this.isTransliterationEnabled() && this.isAutoConvert()) {
      this.contentSubject.next(html);
    }
  }
  
  onBlur() {
    this.control()?.markAsTouched();
  }

  getSafeIcon(name: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }

  exec(command: string, value: string | undefined = undefined) {
    if (this.showCodeView) return;
    if (command === 'inlineCode') {
       const sel = window.getSelection();
       if (sel && !sel.isCollapsed) {
          const text = sel.toString();
          const html = `<code class="bg-gray-100 text-pink-600 rounded px-1 font-mono text-sm">${text}</code>`;
          document.execCommand('insertHTML', false, html);
       }
       return;
    }
    document.execCommand(command, false, value);
    this.editorRef.nativeElement.focus();
    this.onInput();
  }

  toggleCodeView() {
    this.showCodeView = !this.showCodeView;
    if (!this.showCodeView) {
      // Switching BACK to Visual Mode: Sync data from Control (updated by Textarea)
      setTimeout(() => {
        if (this.editorRef) {
          this.editorRef.nativeElement.innerHTML = this.control()?.value || '';
        }
      });
    }
  }

  saveSelection() {
    if (this.showCodeView) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && this.editorRef.nativeElement.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0);
    } else {
        this.savedRange = null;
    }
  }

  insertTemplate(event: Event) {
    if (this.showCodeView) return;
    const select = event.target as HTMLSelectElement;
    const type = select.value;
    select.value = '';
    // ... Template logic ... 
  }

  applyHeading(event: Event) {
    if (this.showCodeView) return;
    const select = event.target as HTMLSelectElement;
    const block = select.value;
    if (block) {
      this.exec('formatBlock', block);
      select.value = '';
    }
  }

  applyFont(event: Event) {
    if (this.showCodeView) return;
    const select = event.target as HTMLSelectElement;
    const font = select.value;
    if (font) {
      this.exec('fontName', font);
      select.value = ''; 
    }
  }

  applyFontSize(event: Event) {
    if (this.showCodeView) return;
    const select = event.target as HTMLSelectElement;
    const size = select.value;
    if (size) {
      this.exec('fontSize', size);
      select.value = '';
    }
  }

  applyColor(command: string, event: Event) {
    if (this.showCodeView) return;
    const input = event.target as HTMLInputElement;
    const color = input.value;
    if (this.savedRange) {
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(this.savedRange);
        }
    } else {
        this.editorRef.nativeElement.focus();
    }
    this.exec(command, color);
  }

  // Image Upload Logic
  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        // Just insert at cursor for now
        this.exec('insertImage', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  // --- Context Menu & Resize (Placeholders for compilation) ---
  onContextMenu(event: MouseEvent) {}
  onEditorMouseMove(event: MouseEvent) {}
  onEditorMouseDown(event: MouseEvent) {}
  closeContextMenu() { this.menu.update(m => ({ ...m, visible: false })); }
}
