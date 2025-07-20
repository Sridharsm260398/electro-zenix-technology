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

  generatePDF() {
    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString('en-GB');

    const docDefinition: any = {
      pageMargins: [20, 20, 20, 20],
      content: [
        //  Logo + Company Details + TAX INVOICE
        {
          columns: [
            { image: this.logoBase64, width: 80 },
            {
              stack: [
                {
                  text: this.invoiceData.company.name,
                  bold: true,
                  fontSize: 12,
                  margin: [20, 0, 0, 0],
                },
                {
                  text: this.invoiceData.company.address,
                  fontSize: 9,
                 margin: [20, 0, 0, 0],
                },
                {
                  text: `GSTIN: ${this.invoiceData.company.gst}`,
                  fontSize: 9,
                margin: [20, 0, 0, 0],
                },
                {
                  text: this.invoiceData.company.contact,
                  fontSize: 9,
                 margin: [20, 0, 0, 0],
                },
                {
                  text: this.invoiceData.company.email,
                  fontSize: 9,
                 margin: [20, 0, 0, 0],
                },
              ],
              width: '*',
            },
            {
              text: 'TAX INVOICE',
              style: 'header',
              alignment: 'right',
              width: 'auto',
            },
          ],
          margin: [0, 0, 0, 10],
        },

        //  Invoice Details Table
     {
  table: {
    widths: ['30%', '30%', '20%', '20%'], // 4 columns for compact layout
    body: [
      [
        { text: 'Invoice #', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${this.invoiceData.invoiceNo}` },
        { text: 'Invoice Date', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${formatDate(this.invoiceData.invoiceDate)}` }
      ],
      [
        { text: 'Terms', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${this.invoiceData.terms}` },
        { text: 'Due Date', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${formatDate(this.invoiceData.dueDate)}` }
      ],
      [
        { text: 'P.O.#', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${this.invoiceData.poNo}` ,colSpan: 3  },
        {}, // empty to balance row
        {}
      ],
      [
        { text: 'Place Of Supply', bold: true, fillColor: '#f0f0f0' },
        { text: `: ${this.invoiceData.placeOfSupply}`, colSpan: 3 },
        {},
        {}
      ]
    ]
  },
  layout: {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5
  },
  margin: [0, 0, 0, 10]
},


        //  Bill To Section with Background
        {
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Bill To', bold: true, fillColor: '#f0f0f0' }],
              [{ text: this.invoiceData.billTo, margin: [0, 5, 0, 5] }],
            ],
          },
          layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
          margin: [0, 0, 0, 10],
        },

        //  Items Table with Proper CGST/SGST Style
        {
          table: {
            headerRows: 1,
            widths: ['5%', '25%', '10%', '6%', '10%', '15%', '15%', '14%'],
            body: [
              [
                { text: '#', bold: true, fillColor: '#f0f0f0' },
                {
                  text: 'Item & Description',
                  bold: true,
                  fillColor: '#f0f0f0',
                },
                { text: 'HSN/SAC', bold: true, fillColor: '#f0f0f0' },
                { text: 'Qty', bold: true, fillColor: '#f0f0f0' },
                { text: 'Rate', bold: true, fillColor: '#f0f0f0' },
                { text: 'CGST(% + AMT)', bold: true, fillColor: '#f0f0f0' },
                { text: 'SGST(% + AMT)', bold: true, fillColor: '#f0f0f0' },
                { text: 'Amount', bold: true, fillColor: '#f0f0f0' },
              ],
              ...this.invoiceData.items.map((i: any, index: number) => [
                index + 1,
                i.description,
                i.hsn,
                i.qty,
                i.rate.toFixed(2),
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        { text: `${i.cgst}%`, alignment: 'center' },
                        {
                          text: ((i.qty * i.rate * i.cgst) / 100).toFixed(2),
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
                },
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        { text: `${i.sgst}%`, alignment: 'center' },
                        {
                          text: ((i.qty * i.rate * i.sgst) / 100).toFixed(2),
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
                },
                (
                  i.qty * i.rate +
                  (i.qty * i.rate * (i.cgst + i.sgst)) / 100
                ).toFixed(2),
              ]),
            ],
          },
          layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
        },

        //  Totals
        {
          columns: [
            {
              width: '60%',
              stack: [
                { text: `\nTotal In Words`, bold: true, margin: [0, 5, 0, 0] },
                {
                  text: this.totalInWords,
                  italics: true,
                  margin: [0, 0, 0, 10],
                },
                { text: `Notes`, bold: true },
                { text: this.invoiceData.notes, fontSize: 9 },
              ],
            },
            {
              width: '40%',
              table: {
                widths: ['*', 'auto'],
                body: [
                  ['Sub Total', `₹${this.subTotal.toFixed(2)}`],
                  ['CGST', `₹${this.cgstTotal.toFixed(2)}`],
                  ['SGST', `₹${this.sgstTotal.toFixed(2)}`],
                  [
                    { text: 'Total', bold: true },
                    { text: `₹${this.total.toFixed(2)}`, bold: true },
                  ],
                  [
                    'Payment Made (-)',
                    `₹${this.invoiceData.paymentMade.toFixed(2)}`,
                  ],
                  [
                    { text: 'Balance Due', bold: true },
                    { text: `₹${this.balanceDue.toFixed(2)}`, bold: true },
                  ],
                ],
              },
              layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
              margin: [0, 10, 0, 0],
            },
          ],
        },

        {
          text: '\nAuthorized Signature',
          alignment: 'right',
          italics: true,
          margin: [0, 30, 0, 0],
        },
      ],

      //  Full Page Border
      background: function () {
        return [
          {
            canvas: [
              {
                type: 'rect',
                x: 5,
                y: 5,
                w: 585,
                h: 830,
                r: 0,
                lineWidth: 1,
                lineColor: '#000',
              },
            ],
          },
        ];
      },

      styles: { header: { fontSize: 16, bold: true } },
      defaultStyle: { fontSize: 9 },
    };

    pdfMake.createPdf(docDefinition).open();
  }
}
