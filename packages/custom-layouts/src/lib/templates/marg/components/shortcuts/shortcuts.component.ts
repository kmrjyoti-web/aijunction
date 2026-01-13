import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as feather from 'feather-icons';

interface ShortcutGroup {
    title: string;
    items: ShortcutItem[];
}

interface ShortcutItem {
    label: string;
    keys: string;
}

@Component({
    selector: 'app-marg-shortcuts-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="title">
             <i data-feather="keyboard"></i>
             <span>SHORTCUT KEYS</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="shortcut-grid">
            <!-- Common Keys -->
            <div class="shortcut-column">
              <div class="group-title">COMMON KEYS</div>
              <div class="group-content">
                <div class="shortcut-row" *ngFor="let item of commonKeys">
                  <span class="label">{{ item.label }}</span>
                  <span class="keys">{{ item.keys }}</span>
                </div>
              </div>
            </div>

            <!-- Right Column -->
             <div class="shortcut-column">
                <!-- Navigation -->
                <div class="group-section">
                    <div class="group-title">NAVIGATION</div>
                    <div class="group-content">
                        <div class="shortcut-row" *ngFor="let item of navigationKeys">
                        <span class="label">{{ item.label }}</span>
                        <span class="keys">{{ item.keys }}</span>
                        </div>
                    </div>
                </div>

                <!-- Sale Window -->
                 <div class="group-section">
                    <div class="group-title">SALE WINDOW</div>
                    <div class="group-content">
                        <div class="shortcut-row" *ngFor="let item of saleWindowKeys">
                        <span class="label">{{ item.label }}</span>
                        <span class="keys">{{ item.keys }}</span>
                        </div>
                    </div>
                 </div>

                 <!-- Item List -->
                  <div class="group-section">
                    <div class="group-title">ITEM LIST ON BILLING WINDOW</div>
                    <div class="group-content">
                        <div class="shortcut-row" *ngFor="let item of itemListKeys">
                        <span class="label">{{ item.label }}</span>
                        <span class="keys">{{ item.keys }}</span>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(2px);
    }

    .modal-content {
      background: white;
      width: 900px;
      max-width: 95vw;
      max-height: 90vh;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      background: #eee;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;

      .title {
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: #666;
        padding: 0;
        &:hover { color: #000; }
      }
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      background: #fff;
    }

    .shortcut-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .group-title {
      color: #1976d2;
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 13px;
      text-transform: uppercase;
    }
    
    .group-section {
        margin-bottom: 20px;
    }

    .shortcut-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      border: 1px solid #e0e0e0;
      margin-bottom: -1px; /* collapse borders */
      font-size: 12px;
      color: #333;
      background: #fff;
      font-weight: 600;

      &:hover {
        background: #f5f5f5;
      }
      
      &:first-child {
         border-top-left-radius: 3px;
         border-top-right-radius: 3px;
      }
       &:last-child {
         border-bottom-left-radius: 3px;
         border-bottom-right-radius: 3px;
      }

      .keys {
        color: #1976d2;
        font-weight: 700;
        min-width: 60px;
        text-align: right;
      }
    }
  `]
})
export class MargShortcutModalComponent implements AfterViewInit {
    @Output() close = new EventEmitter<void>();

    ngAfterViewInit() {
        feather.replace();
    }

    commonKeys: ShortcutItem[] = [
        { label: 'SALE BILL', keys: 'Alt + N' },
        { label: 'SALE BILL LIST', keys: 'Alt + M' },
        { label: 'PURCHASE BILL', keys: 'Alt + P' },
        { label: 'ITEM LIST', keys: 'Alt + I' },
        { label: 'LEDGER LIST', keys: 'Alt + L' },
        { label: 'PARTY WISE OUTSTANDING', keys: 'Alt+O' },
        { label: 'RE-ORDER', keys: 'Ctrl+F1' },
        { label: 'RECEIPT', keys: 'Alt + R' },
        { label: 'PAYMENT', keys: 'Ctrl + F2' },
        { label: 'CASH A/C AND BANK A/C', keys: 'Alt + B' },
        { label: 'SALE BILL CHALLAN', keys: 'Alt + C' },
        { label: 'STOCK ISSUE', keys: 'Alt + K' },
        { label: 'STOCK RECEIVE', keys: 'Alt + U' },
        { label: 'BREAKAGE/EXPRECEIVE', keys: 'Alt + X' },
        { label: 'COUNTER SALE', keys: 'Alt + A' },
    ];

    navigationKeys: ShortcutItem[] = [
        { label: 'HOME/DASHBOARD', keys: 'Alt + H' },
        { label: 'SETTINGS', keys: 'Ctrl+I' },
        { label: 'CALCULATOR', keys: 'Alt + F12' },
    ];

    saleWindowKeys: ShortcutItem[] = [
        { label: 'CHANGE CALCULATION', keys: 'CTRL + R' },
        { label: 'FAST SCANNING', keys: 'CTRL + B' },
        { label: 'LAST DEAL', keys: 'ALT + D' },
        { label: 'Net rate', keys: '*' },
        { label: 'CREATE PRESCRIPTION (IN CHEMIST)', keys: 'F7' },
        { label: 'LOT RATE', keys: 'F7' },
    ];

    itemListKeys: ShortcutItem[] = [
        { label: 'ITEM LEDGER', keys: 'F4' },
        { label: 'OLD RATE', keys: 'F6' },
        { label: 'SUBSTITITUE', keys: 'F7' },
        { label: 'GROUP', keys: 'F8' },
        { label: 'COMPANY', keys: 'F9' },
        { label: 'CATEGORY', keys: 'ALT +F11' },
        { label: 'SHORTAGE', keys: '*' },
    ];
}
