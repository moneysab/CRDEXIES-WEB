import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import {
  VisaInvoiceDetailDto,
  MastercardInvoiceDetailDto,
  SummaryVisaResponseDto,
  SummaryResponseDto,
  ServiceBreakdownResponseDto,
  VisaInvoiceQueryParams,
  MastercardInvoiceQueryParams,
  SummaryStatsDto,
  MastercardSummaryQueryParams,
  VisaSumamryQueryParams
} from '../models/invoice.models';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private httpService: HttpService, private http: HttpClient) { }

  /**
   * Helper method to convert query params to HttpParams
   */
  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }

  /**
   * Get Visa invoices with optional filtering
   */
  getVisaInvoices(params: VisaInvoiceQueryParams = {}): Observable<VisaInvoiceDetailDto[]> {
    return this.httpService.get<VisaInvoiceDetailDto[]>('api/invoices/visa', this.toHttpParams(params));
  }

  /**
   * Get a specific Visa invoice by ID
   */
  getVisaInvoiceById(id: string): Observable<VisaInvoiceDetailDto> {
    return this.httpService.get<VisaInvoiceDetailDto>(`api/invoices/visa/${id}`);
  }

  /**
   * Get Visa charges summary data
   */
  getVisaChargesSummary(params: VisaSumamryQueryParams = {}): Observable<SummaryVisaResponseDto[]> {
    return this.httpService.get<SummaryVisaResponseDto[]>('api/invoices/summary/visa', this.toHttpParams(params));
  }

  /**
   * Get Visa service breakdown data
   */
  /**
   * Get Visa service breakdown data
   * Note: The endpoint uses 'services-beakdown' (with a typo) as specified in the API
   */
  getVisaServiceBreakdown(params: VisaSumamryQueryParams = {}): Observable<ServiceBreakdownResponseDto[]> {
    return this.httpService.get<ServiceBreakdownResponseDto[]>('api/invoices/services-beakdown/visa', this.toHttpParams(params));
  }

  /**
   * Get Mastercard invoices with optional filtering
   */
  getMastercardInvoices(params: MastercardInvoiceQueryParams = {}): Observable<MastercardInvoiceDetailDto[]> {
    return this.httpService.get<MastercardInvoiceDetailDto[]>('api/invoices/mastercard', this.toHttpParams(params));
  }

  /**
   * Get a specific Mastercard invoice by ID
   */
  getMastercardInvoiceById(id: string): Observable<MastercardInvoiceDetailDto> {
    return this.httpService.get<MastercardInvoiceDetailDto>(`api/invoices/mastercard/${id}`);
  }

  /**
   * Get Mastercard charges summary data
   * Note: The API endpoint uses 'masterCard' (with capital 'C')
   */
  getMasterCardChargesSummary(params: MastercardSummaryQueryParams = {}): Observable<SummaryResponseDto[]> {
    return this.httpService.get<SummaryResponseDto[]>('api/invoices/summary/masterCard', this.toHttpParams(params));
  }

  /**
   * Get Mastercard service breakdown data
   * Note: The API endpoint uses 'masterCard' (with capital 'C')
   */
  getMasterCardServiceBreakdown(params: MastercardSummaryQueryParams = {}): Observable<ServiceBreakdownResponseDto[]> {
    return this.httpService.get<ServiceBreakdownResponseDto[]>('api/invoices/service-breakdown/masterCard', this.toHttpParams(params));
  }

  /**
   * @deprecated Use getMasterCardChargesSummary instead for consistent naming with API endpoints
   */
  getMastercardChargesSummary(params: MastercardSummaryQueryParams = {}): Observable<SummaryResponseDto[]> {
    return this.getMasterCardChargesSummary(params);
  }

  /**
   * @deprecated Use getMasterCardServiceBreakdown instead for consistent naming with API endpoints
   */
  getMastercardServiceBreakdown(params: MastercardSummaryQueryParams = {}): Observable<ServiceBreakdownResponseDto[]> {
    return this.getMasterCardServiceBreakdown(params);
  }

  /**
   * Upload a single Visa invoice file
   */
  uploadVisaInvoice(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/visa`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });

  }

  /**
   * Upload multiple Visa invoice files
   */
  uploadMultipleVisaInvoices(files: File[]): Observable<string> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/visa/list-csv-files`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });

  }

  /**
   * Upload a single Mastercard invoice file
   */
  uploadMastercardInvoice(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/mastercard`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });

  }

  /**
   * Upload multiple Mastercard invoice files
   */
  uploadMultipleMastercardInvoices(files: File[]): Observable<string> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/mastercard/list-csv-files`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });

  }

  getMasterCardStats(): Observable<SummaryStatsDto> {
    return this.httpService.get<SummaryStatsDto>('api/invoices/mastercard/stats');
  }
  
  getVisaStats(): Observable<SummaryStatsDto> {
    return this.httpService.get<SummaryStatsDto>('api/invoices/visa/stats');
  }
}
