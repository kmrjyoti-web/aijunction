import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Contact } from '../../../data-access/online-data.service';
import { FooterConfig } from '../../../models/table-config.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  item = input.required<Contact | null>();
  config = input.required<FooterConfig>();
}