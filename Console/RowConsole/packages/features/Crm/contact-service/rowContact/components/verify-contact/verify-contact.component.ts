import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartDrawerHelperService } from '../../../../../../ui-kit/angular/src/lib/components/smart-table/services/smart-drawer-helper.service';

@Component({
  selector: 'app-verify-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header / Status -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800">Verify Contact</h3>
        <span class="px-3 py-1 rounded-full text-xs font-semibold"
            [ngClass]="{
                'bg-green-100 text-green-700': data()?.verification_status === 'VERIFIED_BY_ADMIN',
                'bg-yellow-100 text-yellow-700': data()?.verification_status !== 'VERIFIED_BY_ADMIN'
            }">
            {{ data()?.verification_status || 'PENDING VERIFICATION' }}
        </span>
      </div>

      @if (data(); as contact) {
        <!-- Organization Details -->
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Organization</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400">Name</label>
                    <p class="font-medium text-gray-800">{{ contact.organization_name || 'N/A' }}</p>
                </div>
                <div>
                    <label class="block text-xs text-gray-400">Licence Reg No</label>
                    <p class="font-medium text-gray-800">{{ contact.licence_reg_no_1 || 'N/A' }}</p>
                </div>
            </div>
        </div>

        <!-- Contact Person -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Primary Contact</h4>
             <div class="flex items-center gap-4 mb-4">
                <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {{ contact.contact_person?.charAt(0) || '?' }}
                </div>
                <div>
                    <p class="font-bold text-gray-900">{{ contact.contact_person }}</p>
                    <p class="text-sm text-gray-500">Owner / Manager</p>
                </div>
             </div>

             <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <i class="pi pi-phone text-gray-400"></i>
                    <span class="text-gray-700">{{ contact.mobile_number || contact.communication_detail || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-envelope text-gray-400"></i>
                    <span class="text-gray-700">{{ contact.email_id || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-map-marker text-gray-400"></i>
                    <span class="text-gray-700 text-sm">
                        {{ contact.address }}<br>
                        {{ contact.city }} {{ contact.state }} - {{ contact.pin_code }}
                    </span>
                </div>
             </div>
        </div>
        
        <!-- Raw Data (Debug) -->
        <details class="text-xs text-gray-400 cursor-pointer">
            <summary>View Raw Data</summary>
            <pre class="bg-gray-900 text-green-400 p-4 rounded mt-2 overflow-auto max-h-40">{{ contact | json }}</pre>
        </details>

        <!-- Actions -->
        <div class="flex items-center gap-3 mt-8 pt-4 border-t border-gray-100">
            <button (click)="onVerify()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors shadow-sm font-medium">
                Verify Contact using OTP
            </button>
            <button (click)="drawerHelper.close()" class="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">
                Dismiss
            </button>
        </div>

      } @else {
        <div class="flex flex-col items-center justify-center h-64 text-gray-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>No contact selected.</p>
        </div>
      }
    </div>
  `
})
export class VerifyContactComponent {
  data = input<any>();
  drawerHelper = inject(SmartDrawerHelperService);

  onVerify() {
    console.log('Verifying contact:', this.data());
    // Implement verification logic here
    this.drawerHelper.close();
  }
}
