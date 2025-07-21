import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { GenerateInvoiceService } from '../generate-pdf.service';

@Component({
  selector: 'app-invoice-view',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
    NzDividerModule,
    NzDatePickerModule,
  ],
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.scss',
})
export class InvoiceViewComponent implements OnInit {
  invoiceData: any;
  subTotal = 0;
  cgstTotal = 0;
  sgstTotal = 0;
  total = 0;
  balanceDue = 0;
  totalInWords = '';
  logoBase64: string = '';

  constructor(
    private route: ActivatedRoute,
    private invoiceService: GenerateInvoiceService
  ) {}

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoice(invoiceId);
    }
  }

  async loadInvoice(id: string) {
    // Replace with API call later if needed
    const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    this.invoiceData = storedInvoices.find((inv: any) => inv.id == id);

    this.subTotal = this.invoiceData.subTotal;
    this.cgstTotal = this.invoiceData.cgstTotal;
    this.sgstTotal = this.invoiceData.sgstTotal;
    this.total = this.invoiceData.total;
    this.balanceDue = this.invoiceData.balanceDue;
    this.totalInWords = this.invoiceData.totalInWords;

    this.logoBase64 = await this.getBase64ImageFromURL(
      'assets/img/company_logo.png'
    );
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
    });
  }

  downloadPDF() {
    this.invoiceService.generateInvoicePDF(
      this.invoiceData,
      {
        subTotal: this.subTotal,
        cgstTotal: this.cgstTotal,
        sgstTotal: this.sgstTotal,
        total: this.total,
        balanceDue: this.balanceDue,
        totalInWords: this.totalInWords,
      },
      this.logoBase64
    );
  }
}
