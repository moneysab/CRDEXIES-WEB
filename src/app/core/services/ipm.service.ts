import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IpmSumamryParams,IpmSummary,IpmTransaction,IpmTransactionParams } from '../models/ipm.models';
@Injectable({
  providedIn: 'root'
})
export class IpmService {
private http = inject(HttpClient);
   /**
 * @Authors = Samy AIT MOHAMMED
 * inject HttpService to handle HTTP requests
 */
  private httpService = inject(HttpService);
  private apiUrl = `${environment.epinApiUrl}/api/v1/mastercard`;

   /**
    * @Authors = Samy AIT MOHAMMED
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

  // File Processing Endpoints
  uploadIpmFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post<any>(`${this.apiUrl}/upload`, formData);
  }

  uploadMultipleIpmFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    return this.httpService.post<any>(`${this.apiUrl}/batch/upload`, formData);
  }

  getIpmSummary(params: IpmSumamryParams): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/summaries`, this.toHttpParams(params));
  }

  getIpmTransactions(params: IpmTransactionParams): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/transactions`, this.toHttpParams(params));
  }

  getIpmTransactionById(id: string): Observable<IpmTransaction> {
    return this.httpService.get<IpmTransaction>(`${this.apiUrl}/transactions/${id}`);
  }
  getIpmSummaryById(id: string): Observable<IpmSummary> {
    return this.httpService.get<IpmSummary>(`${this.apiUrl}/summaries/${id}`);
  }

  getMembers(): Observable<string[]> {
    return this.httpService.get<string[]>(`${this.apiUrl}/members`);
  }

  getCurrencies(): Observable<string[]> {
    return this.httpService.get<string[]>(`${this.apiUrl}/currencies`);
  }

  getAcceptanceBrands(): Observable<string[]> {
    return this.httpService.get<string[]>(`${this.apiUrl}/acceptance-brands`);
  }

}
