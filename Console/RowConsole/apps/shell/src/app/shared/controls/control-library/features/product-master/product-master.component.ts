
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { PRODUCT_MASTER_SCHEMA } from './product-master.config';

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  template: `
    <div class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10 animate-fade-in">
      <app-dynamic-form 
        [config]="schema"
        (formSubmit)="handleSubmit($event)">
      </app-dynamic-form>
      
      @if (submittedData) {
        <div class="mt-8 p-4 bg-gray-900 rounded-lg overflow-x-auto">
           <h3 class="text-green-400 font-bold mb-2">Submitted Data</h3>
           <pre class="text-blue-300 text-sm font-mono">{{ submittedData | json }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProductMasterComponent {
  schema = PRODUCT_MASTER_SCHEMA;
  submittedData: any = null;

  handleSubmit(data: any) {
    this.submittedData = data;
    console.log('Product Master Submitted:', data);
  }
}
