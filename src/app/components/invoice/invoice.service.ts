import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { invoiceEndpoints } from './endpoint';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
 private baseUrl = environment.baseUrl;
 

  constructor(private http: HttpClient) {}

  getAllInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${invoiceEndpoints.getAll}`);
  }

  createInvoice(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${invoiceEndpoints.create}`, data);
  }

  getInvoiceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${invoiceEndpoints.getById(id)}`);
  }

  updateInvoice(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}${invoiceEndpoints.update(id)}`, data);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${invoiceEndpoints.delete(id)}`);
  }
}
