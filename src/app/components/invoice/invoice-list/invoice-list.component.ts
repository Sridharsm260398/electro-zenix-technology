import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ToastService } from '../../../shared/toast.service';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, AgGridAngular, NzButtonModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  columnDefs: any[] = [];
  overlayLoading =
    '<span class="ag-overlay-loading-center">Loading invoices...</span>';
  overlayNoRows =
    '<span class="ag-overlay-loading-center">No invoices found</span>';

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private toastr: ToastService
  ) {}

  ngOnInit() {
    this.columnDefs = [
      {
        headerName: 'Invoice #',
        field: 'invoiceNo',
        sortable: true,
        filter: true,
      },
      { headerName: 'Customer', field: 'billTo', sortable: true, filter: true },
      {
        headerName: 'Total',
        field: 'total',
        valueFormatter: (params: any) => `₹${params.value.toFixed(2)}`,
      },
      {
        headerName: 'Action',
        cellRenderer: (params: any) => {
          return `
            <button class="btn-view">View</button>
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
            <button class="btn-download">PDF</button>
          `;
        },
      },
    ];

    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getAllInvoices().subscribe({
      next: (res: any) => {
        this.invoices = (res?.data?.invoices || []).map((inv: any) => {
          const subTotal = inv.items.reduce(
            (sum: number, i: any) => sum + i.qty * i.rate,
            0
          );
          const cgstTotal = inv.items.reduce(
            (sum: number, i: any) => sum + (i.qty * i.rate * i.cgst) / 100,
            0
          );
          const sgstTotal = inv.items.reduce(
            (sum: number, i: any) => sum + (i.qty * i.rate * i.sgst) / 100,
            0
          );
          return {
            ...inv,
            total: subTotal + cgstTotal + sgstTotal,
          };
        });
        this.toastr.success('Invoices loaded successfully');
      },
      error: () => {
        this.toastr.error('Failed to load invoices');
      },
    });
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
    params.api.addEventListener('cellClicked', (event: any) => {
      if (event.colDef.field === 'action') {
        const invoice = event.data;
        if (event.event.target.classList.contains('btn-view')) {
          this.viewInvoice(invoice._id);
        } else if (event.event.target.classList.contains('btn-edit')) {
          this.editInvoice(invoice._id);
        } else if (event.event.target.classList.contains('btn-delete')) {
          this.deleteInvoice(invoice._id);
        }
      }
    });
  }

  viewInvoice(id: string) {
    this.router.navigate(['/invoices/view', id]);
  }

  editInvoice(id: string) {
    this.router.navigate(['/invoices/edit', id]);
  }

  deleteInvoice(id: string) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.toastr.success('Invoice deleted successfully');
          this.loadInvoices();
        },
        error: () => {
          this.toastr.error('Failed to delete invoice');
        },
      });
    }
  }

  navigateToNew() {
    this.router.navigate(['/invoice']);
  }
}
