import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { toWords } from 'number-to-words';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { GenerateInvoiceService } from './generate-pdf.service';
import { InvoiceService } from './invoice.service';
import { ToastService } from '../../shared/toast.service';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-invoice',
  standalone: true,
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
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {

  constructor(private generatePdf :GenerateInvoiceService, private invoiceService:InvoiceService,
    private toast :ToastService
  ){

  }
  logoBase64: string = '';

  invoiceData: any = {
    invoiceNo: '',
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    terms: 'Net 30',
    poNo: '',
    placeOfSupply: 'Karnataka (29)',
    billTo: 'Sridhar S M\nSridhars Pvt Ltd\nBangalore, India',
    items: [
      {
        description: 'Sample Item',
        hsn: '9983',
        qty: 1,
        rate: 10000,
        cgst: 9,
        sgst: 9,
      },
    ],
    paymentMade: 0,
    notes: 'Thank you for your business!',
    company: {
      name: 'Electro Zenix Technology',
      address: `Nanjegowdru complex, opposite to bisleri complex\nKannamangala gate, Devanahalli\nBengaluru Karnataka 562110`,
      gst: '29KQGPS3200E1ZS',
      contact: '9740405874',
      email: 'electrozenixtech@gmail.com',
    },
  };

  subTotal = 0;
  cgstTotal = 0;
  sgstTotal = 0;
  total = 0;
  balanceDue = 0;
  totalInWords = '';

  ngOnInit(): void {
    this.generateInvoiceNumber();
    this.calculateTotals();
    this.loadLogo();
  }

  generateInvoiceNumber() {
    const storedCount = localStorage.getItem('invoiceCounter');
    let count = storedCount ? parseInt(storedCount) + 1 : 1;
    localStorage.setItem('invoiceCounter', count.toString());
    this.invoiceData.invoiceNo = `INV-${count.toString().padStart(6, '0')}`;
  }

  async loadLogo() {
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
        ctx.beginPath();
        ctx.arc(img.width / 2, img.height / 2, img.width / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
    });
  }
  calculateTotals() {
    this.subTotal = this.invoiceData.items.reduce(
      (sum: number, i: any) => sum + i.qty * i.rate,
      0
    );
    this.cgstTotal = this.invoiceData.items.reduce(
      (sum: number, i: any) => sum + (i.qty * i.rate * i.cgst) / 100,
      0
    );
    this.sgstTotal = this.invoiceData.items.reduce(
      (sum: number, i: any) => sum + (i.qty * i.rate * i.sgst) / 100,
      0
    );
    this.total = this.subTotal + this.cgstTotal + this.sgstTotal;
    this.balanceDue = this.total - this.invoiceData.paymentMade;
    this.totalInWords = `Indian Rupee ${toWords(this.total)} only`;
  }

  addItem() {
    this.invoiceData.items.push({
      description: '',
      hsn: '',
      qty: 1,
      rate: 0,
      cgst: 0,
      sgst: 0,
    });
    this.calculateTotals();
  }

  removeItem(index: number) {
    this.invoiceData.items.splice(index, 1);
    this.calculateTotals();
  }

saveAndDownloadInvoice() {
  this.invoiceService.createInvoice(this.invoiceData).subscribe({
    next: (res) => {
    this.toast.success('Invoice saved successfully!');

    //  this.invoiceData.id = res.id; 

      this.generatePDF();
    },
    error: (err) => {
      console.error('Error saving invoice', err);
       this.toast.success(`Error saving invoice  ${err.error.msg}` || 'Please try again');

    },
  });
}

generatePDF() {
  this.generatePdf.generateInvoicePDF(
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
