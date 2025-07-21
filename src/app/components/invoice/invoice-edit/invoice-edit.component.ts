import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { InvoiceComponent } from '../invoice.component';

@Component({
  selector: 'app-invoice-edit',
  imports: [InvoiceComponent],
  templateUrl: './invoice-edit.component.html',
  styleUrl: './invoice-edit.component.scss'
})
export class InvoiceEditComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const invoice = storedInvoices.find((inv: any) => inv.id == invoiceId);

      if (invoice) {
        localStorage.setItem('editInvoice', JSON.stringify(invoice));
      }
    }
  }
}