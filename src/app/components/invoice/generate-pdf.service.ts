import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Injectable({
  providedIn: 'root',
})
export class GenerateInvoiceService {
  constructor() {}

  async generateInvoicePDF(invoiceData: any, totals: any, logoBase64: string) {
     const formatDate = (date: Date) =>
       new Date(date).toLocaleDateString('en-GB');
 
     const docDefinition: any = {
       pageMargins: [20, 20, 20, 20],
       content: [
         //  Logo + Company Details + TAX INVOICE
         {
           columns: [
             { image: logoBase64, width: 80 },
             {
               stack: [
                 {
                   text: invoiceData.company.name,
                   bold: true,
                   fontSize: 12,
                   margin: [20, 0, 0, 0],
                 },
                 {
                   text: invoiceData.company.address,
                   fontSize: 9,
                  margin: [20, 0, 0, 0],
                 },
                 {
                   text: `GSTIN: ${invoiceData.company.gst}`,
                   fontSize: 9,
                 margin: [20, 0, 0, 0],
                 },
                 {
                   text: invoiceData.company.contact,
                   fontSize: 9,
                  margin: [20, 0, 0, 0],
                 },
                 {
                   text: invoiceData.company.email,
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
         { text: `: ${invoiceData.invoiceNo}` },
         { text: 'Invoice Date', bold: true, fillColor: '#f0f0f0' },
         { text: `: ${formatDate(invoiceData.invoiceDate)}` }
       ],
       [
         { text: 'Terms', bold: true, fillColor: '#f0f0f0' },
         { text: `: ${invoiceData.terms}` },
         { text: 'Due Date', bold: true, fillColor: '#f0f0f0' },
         { text: `: ${formatDate(invoiceData.dueDate)}` }
       ],
       [
         { text: 'P.O.#', bold: true, fillColor: '#f0f0f0' },
         { text: `: ${invoiceData.poNo}` ,colSpan: 3  },
         {}, // empty to balance row
         {}
       ],
       [
         { text: 'Place Of Supply', bold: true, fillColor: '#f0f0f0' },
         { text: `: ${invoiceData.placeOfSupply}`, colSpan: 3 },
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
               [{ text: invoiceData.billTo, margin: [0, 5, 0, 5] }],
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
               ...invoiceData.items.map((i: any, index: number) => [
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
                   text: totals.totalInWords,
                   italics: true,
                   margin: [0, 0, 0, 10],
                 },
                 { text: `Notes`, bold: true },
                 { text: invoiceData.notes, fontSize: 9 },
               ],
             },
             {
               width: '40%',
               table: {
                 widths: ['*', 'auto'],
                 body: [
                   ['Sub Total', `₹${totals.subTotal.toFixed(2)}`],
                   ['CGST', `₹${totals.cgstTotal.toFixed(2)}`],
                   ['SGST', `₹${totals.sgstTotal.toFixed(2)}`],
                   [
                     { text: 'Total', bold: true },
                     { text: `₹${totals.total.toFixed(2)}`, bold: true },
                   ],
                   [
                     'Payment Made (-)',
                     `₹${invoiceData.paymentMade.toFixed(2)}`,
                   ],
                   [
                     { text: 'Balance Due', bold: true },
                     { text: `₹${totals.balanceDue.toFixed(2)}`, bold: true },
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
