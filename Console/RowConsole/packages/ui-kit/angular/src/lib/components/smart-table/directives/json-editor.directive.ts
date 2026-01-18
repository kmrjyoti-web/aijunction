import { Directive, ElementRef, inject, input, output, effect, AfterViewInit, OnDestroy } from '@angular/core';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';

@Directive({
  selector: '[appJsonEditor]',
  standalone: true,
})
export class JsonEditorDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private editor: CodeMirror.Editor | undefined;
  private isInternalChange = false;

  value = input<string>('');
  valueChange = output<string>();

  constructor() {
    effect(() => {
      const newValue = this.value();
      if (this.editor && !this.isInternalChange && this.editor.getValue() !== newValue) {
        const cursor = this.editor.getCursor();
        this.editor.setValue(newValue);
        this.editor.setCursor(cursor);
      }
    });
  }

  ngAfterViewInit(): void {
    const config = {
      value: this.value(),
      mode: { name: 'javascript', json: true },
      theme: 'neo',
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: Infinity
    } as any;

    this.editor = CodeMirror(this.el.nativeElement, config);

    this.editor?.on('change', (instance: CodeMirror.Editor) => {
      const currentValue = instance.getValue();
      this.isInternalChange = true;
      this.valueChange.emit(currentValue);
      // Timeout to allow the parent component's effect to run before we reset the flag
      setTimeout(() => this.isInternalChange = false, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.editor) {
      const wrapper = this.editor.getWrapperElement();
      wrapper.parentNode?.removeChild(wrapper);
      this.editor = undefined;
    }
  }
}
