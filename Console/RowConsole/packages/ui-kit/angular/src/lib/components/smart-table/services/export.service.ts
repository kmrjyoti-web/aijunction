import { Injectable } from '@angular/core';
import { Column } from '../models/table-config.model';
import { Contact } from '../data-access/online-data.service';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportData(format: 'csv' | 'pdf' | 'excel', data: Contact[], columns: Column[], fileName: string): void {
    switch (format) {
      case 'csv':
        this.exportAsCsv(data, columns, fileName);
        break;
      case 'excel':
        // As a fallback, export as CSV with .xlsx extension which Excel can open
        this.exportAsCsv(data, columns, fileName, 'xlsx');
        break;
      case 'pdf':
        // In a real app, use a library like 'jspdf' and 'jspdf-autotable'
        alert('PDF export is not implemented in this demo.');
        console.warn('PDF export is not implemented.');
        break;
    }
  }

  private exportAsCsv(data: Contact[], columns: Column[], fileName: string, extension: 'csv' | 'xlsx' = 'csv'): void {
    if (!data || data.length === 0) {
      return;
    }

    const separator = ',';
    // Use only visible columns that are not action/checkbox types for the export
    const exportColumns = columns.filter(c => c.columnType !== 'ACTION' && c.columnType !== 'CHECKBOX');
    const headers = exportColumns.map(c => this.escapeCsvCell(c.name)).join(separator);

    const csvRows = data.map(row => {
      return exportColumns.map(col => {
        let cellData;

        // Handle composite cell templates by joining their text parts
        if (col.cellTemplate) {
          cellData = col.cellTemplate
            .filter(item => item.columnType !== 'IMAGE')
            .map(item => row[item.code as keyof Contact])
            .join(' ');
        } else {
          cellData = row[col.code as keyof Contact];
        }

        const cell = cellData === null || cellData === undefined ? '' : String(cellData);
        return this.escapeCsvCell(cell);
      }).join(separator);
    });

    const csvContent = [headers, ...csvRows].join('\n');
    
    // Adding BOM for Excel to recognize UTF-8 characters correctly
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      link.setAttribute('download', `${sanitizedFileName}_${dateStr}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private escapeCsvCell(cell: string): string {
    // Wrap in quotes if it contains a comma, newline, or a quote
    if (/[",\n]/.test(cell)) {
      // Escape quotes by doubling them
      const escapedCell = cell.replace(/"/g, '""');
      return `"${escapedCell}"`;
    }
    return cell;
  }
}
