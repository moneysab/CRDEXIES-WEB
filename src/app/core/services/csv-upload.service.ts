import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import { CsvFileParams } from '../models/invoice.models';

@Injectable({
  providedIn: 'root'
})
export class CsvUploadService {

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
   * Get CSV files with optional filtering
   */
  getCsvFiles(params: CsvFileParams = {}): Observable<any> {
    return this.httpService.get<any>('api/csv-file/load', this.toHttpParams(params));
  }

  /**
   * Get Visa CSV file details by name
   * @param csvName CSV file name
   * @param params Query parameters for pagination
   */
  getVisaCsvFileDetails(csvName: string, params: { page?: number; size?: number } = {}): Observable<any> {
    const queryParams = this.toHttpParams({
      csvName,
      ...params
    });
    
    return this.httpService.get<any>('api/csv-file/load/visa/' + csvName, queryParams);
  }

  /**
   * Get Mastercard CSV file details by name
   * @param csvName CSV file name
   * @param params Query parameters for pagination
   */
  getMastercardCsvFileDetails(csvName: string, params: { page?: number; size?: number } = {}): Observable<any> {
    const queryParams = this.toHttpParams({
      csvName,
      ...params
    });
    
    return this.httpService.get<any>('api/csv-file/load/master-card/' + csvName, queryParams);
  }

  /**
   * Upload a single Visa CSV file
   * @param file File to upload
   */
  uploadVisaFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/visa`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });
  }

  /**
   * Upload multiple Visa CSV files
   * @param files Files to upload
   */
  uploadMultipleVisaFiles(files: File[]): Observable<string> {
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
   * Upload a single Mastercard CSV file
   * @param file File to upload
   */
  uploadMastercardFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${environment.apiUrl}/api/invoices/upload/mastercard`, formData, {
      headers: {
        'X-Prevent-Redirect': 'true'
      }
    });
  }

  /**
   * Upload multiple Mastercard CSV files
   * @param files Files to upload
   */
  uploadMultipleMastercardFiles(files: File[]): Observable<string> {
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

}
