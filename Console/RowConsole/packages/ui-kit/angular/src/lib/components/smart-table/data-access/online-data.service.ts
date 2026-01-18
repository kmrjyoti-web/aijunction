import { Injectable, inject } from '@angular/core';
import { of, delay, Observable } from 'rxjs';
import { ApiRequest, ApiResponse, SearchFilter } from '@ai-junction/core';
import { ConfigService } from './config.service';

export interface Contact {
  organization_id: number;
  organization_name: string;
  contact_person: string;
  communication_detail: string;
  email_id: string;
  avatar_url?: string;
  annual_revenue?: number;
  created_time?: string; // For calendar view
  last_activity_date?: string; // New field for calendar view
  lead_source?: 'Web' | 'Organic' | 'Referral';
  [key: string]: any;
}

// Helper to generate random dates for mock data
function getRandomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Helper to generate more recent random dates
function getRandomDateRecent(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

@Injectable({ providedIn: 'root' })
export class OnlineDataService {
  private configService = inject(ConfigService);
  private mockData: Contact[] = [
    // Original 23 records with created_time and lead_source
    { organization_id: 1, organization_name: 'Innovate Inc.', contact_person: 'Alice Johnson', communication_detail: '5550101123', email_id: 'alice.j@innovate.com', avatar_url: 'https://picsum.photos/seed/1/40/40', annual_revenue: 5000000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 2, organization_name: 'Solutions Corp.', contact_person: 'Bob Smith', communication_detail: '5550102456', email_id: 'bob.s@solutions.com', avatar_url: 'https://picsum.photos/seed/2/40/40', annual_revenue: 7200000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 3, organization_name: 'Quantum Systems', contact_person: 'Charlie Brown', communication_detail: '5550103789', email_id: 'charlie.b@quantum.com', avatar_url: 'https://picsum.photos/seed/3/40/40', annual_revenue: 12000000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 4, organization_name: 'Apex Enterprises', contact_person: 'Diana Prince', communication_detail: '5550104101', email_id: 'diana.p@apex.com', avatar_url: 'https://picsum.photos/seed/4/40/40', annual_revenue: 3500000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 5, organization_name: 'Stellar Tech', contact_person: 'Ethan Hunt', communication_detail: '5550105112', email_id: 'ethan.h@stellar.com', avatar_url: 'https://picsum.photos/seed/5/40/40', annual_revenue: 9800000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 6, organization_name: 'Fusion Dynamics', contact_person: 'Fiona Glenanne', communication_detail: '5550106131', email_id: 'fiona.g@fusion.com', avatar_url: 'https://picsum.photos/seed/6/40/40', annual_revenue: 2100000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 7, organization_name: 'Synergy Group', contact_person: 'George Costanza', communication_detail: '5550107141', email_id: 'george.c@synergy.com', avatar_url: 'https://picsum.photos/seed/7/40/40', annual_revenue: 8300000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 8, organization_name: 'Pioneer Labs', contact_person: 'Hannah Abbott', communication_detail: '5550108151', email_id: 'hannah.a@pioneer.com', avatar_url: 'https://picsum.photos/seed/8/40/40', annual_revenue: 4500000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 9, organization_name: 'Vertex Innovations', contact_person: 'Ian Malcolm', communication_detail: '5550109161', email_id: 'ian.m@vertex.com', avatar_url: 'https://picsum.photos/seed/9/40/40', annual_revenue: 6100000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 10, organization_name: 'Horizon Solutions', contact_person: 'Jane Doe', communication_detail: '5550110171', email_id: 'jane.d@horizon.com', avatar_url: 'https://picsum.photos/seed/10/40/40', annual_revenue: 15000000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 11, organization_name: 'Global Connect', contact_person: 'Kara Danvers', communication_detail: '5550111181', email_id: 'kara.d@global.com', avatar_url: 'https://picsum.photos/seed/11/40/40', annual_revenue: 11200000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 12, organization_name: 'Nexus Platforms', contact_person: 'Leo Fitz', communication_detail: '5550112191', email_id: 'leo.f@nexus.com', avatar_url: 'https://picsum.photos/seed/12/40/40', annual_revenue: 7800000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 13, organization_name: 'Momentum Works', contact_person: 'Monica Geller', communication_detail: '5550113202', email_id: 'monica.g@momentum.com', avatar_url: 'https://picsum.photos/seed/13/40/40', annual_revenue: 4900000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 14, organization_name: 'Omega Industries', contact_person: 'Ned Stark', communication_detail: '5550114212', email_id: 'ned.s@omega.com', avatar_url: 'https://picsum.photos/seed/14/40/40', annual_revenue: 25000000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 15, organization_name: 'Zenith Tech', contact_person: 'Oscar Martinez', communication_detail: '5550115222', email_id: 'oscar.m@zenith.com', avatar_url: 'https://picsum.photos/seed/15/40/40', annual_revenue: 3300000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 16, organization_name: 'Apex Solutions', contact_person: 'Pam Beesly', communication_detail: '5550116232', email_id: 'pam.b@apex.com', avatar_url: 'https://picsum.photos/seed/16/40/40', annual_revenue: 5600000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 17, organization_name: 'Quantum Dynamics', contact_person: 'Quinn Fabray', communication_detail: '5550117242', email_id: 'quinn.f@quantum.com', avatar_url: 'https://picsum.photos/seed/17/40/40', annual_revenue: 13500000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 18, organization_name: 'Stellar Innovations', contact_person: 'Rachel Green', communication_detail: '5550118252', email_id: 'rachel.g@stellar.com', avatar_url: 'https://picsum.photos/seed/18/40/40', annual_revenue: 8800000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 19, organization_name: 'Fusion Solutions', contact_person: 'Sam Winchester', communication_detail: '5550119262', email_id: 'sam.w@fusion.com', avatar_url: 'https://picsum.photos/seed/19/40/40', annual_revenue: 1800000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 20, organization_name: 'Synergy Systems', contact_person: 'Ted Mosby', communication_detail: '5550120272', email_id: 'ted.m@synergy.com', avatar_url: 'https://picsum.photos/seed/20/40/40', annual_revenue: 6700000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    { organization_id: 21, organization_name: 'Pioneer Enterprises', contact_person: 'Uma Thurman', communication_detail: '5550121282', email_id: 'uma.t@pioneer.com', avatar_url: 'https://picsum.photos/seed/21/40/40', annual_revenue: 4100000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Organic' },
    { organization_id: 22, organization_name: 'Vertex Corp.', contact_person: 'Victor Vance', communication_detail: '5550122292', email_id: 'victor.v@vertex.com', avatar_url: 'https://picsum.photos/seed/22/40/40', annual_revenue: 7300000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Referral' },
    { organization_id: 23, organization_name: 'Horizon Labs', contact_person: 'Walter White', communication_detail: '5550123303', email_id: 'walter.w@horizon.com', avatar_url: 'https://picsum.photos/seed/23/40/40', annual_revenue: 17000000, created_time: getRandomDate(new Date(2023, 10, 1), new Date()), last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()), lead_source: 'Web' },
    ...Array.from({ length: 5000 }, (_, i) => {
      const leadSources: Array<'Web' | 'Organic' | 'Referral'> = ['Web', 'Organic', 'Referral'];
      return {
        organization_id: 24 + i,
        organization_name: `Test Corp ${i + 1}`,
        contact_person: `Person ${i + 1}`,
        communication_detail: `55502${(i + 1).toString().padStart(5, '0')}`,
        email_id: `person.${i + 1}@test.com`,
        avatar_url: `https://picsum.photos/seed/${24 + i}/40/40`,
        annual_revenue: Math.floor(Math.random() * 10000000) + 100000,
        created_time: getRandomDate(new Date(2023, 10, 1), new Date()),
        last_activity_date: getRandomDateRecent(new Date(2024, 0, 1), new Date()),
        lead_source: leadSources[i % 3],
      };
    })
  ];

  getData(request: ApiRequest): Observable<ApiResponse> {
    let filteredData = [...this.mockData];
    const globalFilterFields = this.configService.config().config.globalFilterFields;

    // Filtering
    if (request.search_filters.length > 0) {
      filteredData = filteredData.filter(contact => {
        return request.search_filters.every(filter => {
          if (!filter.parameter_code || !filter.parameter_value) return true;

          const filterValue = filter.parameter_value.toLowerCase();

          // Handle Global Search
          if (filter.parameter_code === 'GS') {
            const dateColumns = this.configService.config().columns
              .filter(c => c.columnType === 'DATE')
              .map(c => c.code);

            const range = filterValue.split(' to ');
            let isDateRange = false;
            let fromDate: Date | null = null;
            let toDate: Date | null = null;

            if (range.length === 2) {
              const from = new Date(range[0].trim());
              const to = new Date(range[1].trim());
              if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                isDateRange = true;
                fromDate = from;
                toDate = to;
                toDate.setHours(23, 59, 59, 999);
              }
            }

            if (globalFilterFields && globalFilterFields.length > 0) {
              return globalFilterFields.some(field => {
                const fieldValue = contact[field];
                if (!fieldValue) return false;

                // Date field logic
                if (dateColumns.includes(field)) {
                  const contactDate = new Date(fieldValue as string);
                  if (isNaN(contactDate.getTime())) return false;

                  if (isDateRange) {
                    return contactDate >= fromDate! && contactDate <= toDate!;
                  } else {
                    // Simple string search for single dates, e.g., "2024-01-15"
                    return String(fieldValue).toLowerCase().includes(filterValue);
                  }
                }

                // Non-date field logic
                return String(fieldValue).toLowerCase().includes(filterValue);
              });
            }
            // Fallback to old behavior if config is not set
            return (
              String(contact.organization_name || '').toLowerCase().includes(filterValue) ||
              String(contact.contact_person || '').toLowerCase().includes(filterValue) ||
              String(contact.communication_detail || '').toLowerCase().includes(filterValue) ||
              String(contact.email_id || '').toLowerCase().includes(filterValue) ||
              String(contact.created_time || '').toLowerCase().includes(filterValue)
            );
          }

          const columnDef = this.configService.config().columns.find(c => c.code === filter.parameter_code);
          if (columnDef?.columnType === 'DATE') {
            const contactDateVal = contact[filter.parameter_code];
            if (!contactDateVal) return false;
            const contactDate = new Date(contactDateVal as string);
            if (isNaN(contactDate.getTime())) return false;
            contactDate.setUTCHours(0, 0, 0, 0);

            if (filter.wildcard_operator === 'BETWEEN') {
              if (!filter.parameter_value.includes(',')) return false;
              const [startStr, endStr] = filter.parameter_value.split(',');
              const startDate = new Date(startStr + 'T00:00:00Z');
              const endDate = new Date(endStr + 'T00:00:00Z');
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
              endDate.setUTCHours(23, 59, 59, 999);
              return contactDate >= startDate && contactDate <= endDate;
            } else if (filter.wildcard_operator === 'EXACT') {
              const filterDate = new Date(filter.parameter_value + 'T00:00:00Z');
              if (isNaN(filterDate.getTime())) return false;
              return contactDate.getTime() === filterDate.getTime();
            }
            return false; // Fail safe for unsupported date operators
          }

          const contactValue = String(contact[filter.parameter_code] || '').toLowerCase();
          // Handle multi-select from Excel-like filter (comma-separated values)
          if (filterValue.includes(',')) {
            const filterValues = filterValue.split(',');
            return filterValues.includes(contactValue);
          }
          // Handle Column/Advanced Filters
          return contactValue.includes(filterValue);
        });
      });
    }

    // Sorting
    if (request.sort_column.length > 0) {
      const sort = request.sort_column[0];
      filteredData.sort((a, b) => {
        const valA = a[sort.column_name];
        const valB = b[sort.column_name];

        if (valA < valB) return sort.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sort.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalRecords = filteredData.length;
    const pageNum = Number(request.page_number);
    const pageSize = Number(request.page_size);
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return of({
      data: paginatedData,
      total_records: totalRecords
    }).pipe(delay(500)); // Simulate network latency
  }
}
