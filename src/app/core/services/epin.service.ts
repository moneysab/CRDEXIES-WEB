import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {ProcessingStatistics,FileProcessingJob,JobsQueryParams,VisaSettlementStatsRecord,
       VisaSettlementQueryParams,InterchangeDetails,ReimbursementDetails,ChargesDetails,
       VisaTransactionDetailsDto,VisaTransactionsQueryParams,Vss120AvailableFilters} from '../models/epin.models';
import { changePasswordRequestDto } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class EpinService {
  private http = inject(HttpClient);
   /**
 * @Authors = Samy AIT MOHAMMED
 * inject HttpService to handle HTTP requests
 */
  private httpService = inject(HttpService);
  private apiUrl = `${environment.epinApiUrl}/api/v1/epin`;

   /**
    * @Authors = Samy AIT MOHAMMED
     * Helper method to convert query params to HttpParams
     */
    private toHttpParams(params: any): HttpParams {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
      return httpParams;
    }

  // File Processing Endpoints
  uploadEpinFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post<any>(`${this.apiUrl}/upload`, formData);
  }

  uploadReportEpinFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post<any>(`${environment.epinApiUrl}/api/vss/upload`, formData);
  }

  uploadMultipleEpinFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    return this.httpService.post<any>(`${this.apiUrl}/upload`, formData);
  }

  getProcessingJobs(clientId: string): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/jobs/client`,  this.toHttpParams({ clientId }) );
  }

  getListJobs(params: JobsQueryParams = {}): Observable<FileProcessingJob[]> {
    return this.httpService.get<FileProcessingJob[]>(`${this.apiUrl}/jobs`,  this.toHttpParams(params ));
  }

  getJobStatus(jobId: string): Observable<FileProcessingJob> {
    return this.httpService.get<FileProcessingJob>(`${this.apiUrl}/jobs/${jobId}`);
  }

  retryJob(jobId: string): Observable<any> {
    return this.httpService.post<any>(`${this.apiUrl}/jobs/${jobId}/retry`, {});
  }

  cancelJob(jobId: string): Observable<any> {
    return this.httpService.post<any>( `${this.apiUrl}/jobs/${jobId}/cancel`,{});
  }

  getProcessingStats(): Observable<ProcessingStatistics> {
    return this.httpService.get<ProcessingStatistics>(`${this.apiUrl}/stats`);
  }

  // Reporting Endpoints
  getIssuerKpis(params?: any): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/reports/issuer-kpis`, this.toHttpParams(params));
  }
  
  getKpis(params?: VisaSettlementQueryParams): Observable<VisaSettlementStatsRecord> {
    return this.httpService.get<VisaSettlementStatsRecord>(`${this.apiUrl}/reports/kpis`, this.toHttpParams(params));
  }
  getCountryChannelRevenues(params?: any): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/reports/country-channel-revenues`, this.toHttpParams(params));
  }

  getBinRevenues(params?: any): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}/reports/bin-revenues`, this.toHttpParams(params));
  }

  exportReport(format: 'csv' | 'excel', params?: any): Observable<Blob> {
    const requestParams = { format, ...params };
    return this.httpService.get<Blob>(`${this.apiUrl}/reports/export`, 
      this.toHttpParams(requestParams),
      {responseType: 'blob'}
    );
  }
  
  getInterchangeDetails(params?: VisaSettlementQueryParams): Observable<InterchangeDetails> {
    return this.httpService.get<InterchangeDetails>(`${this.apiUrl}/reports/kpis/interchange`, this.toHttpParams(params));
  }

  getReimbursementDetails(params?: VisaSettlementQueryParams): Observable<ReimbursementDetails> {
    return this.httpService.get<ReimbursementDetails>(`${this.apiUrl}/reports/kpis/reimbursementFee`, this.toHttpParams(params));
  }

  getChargesDetails(params?: VisaSettlementQueryParams): Observable<ChargesDetails> {
    return this.httpService.get<ChargesDetails>(`${this.apiUrl}/reports/kpis/visaCharges`, this.toHttpParams(params));
  }


  getTransactionsDetails(params?: VisaTransactionsQueryParams): Observable<VisaTransactionDetailsDto> {
    return this.httpService.get<VisaTransactionDetailsDto>(`${this.apiUrl}/reports/kpis/transactions-details`, this.toHttpParams(params));
  }

  getVisaAvailableFilters(): Observable<Vss120AvailableFilters> {
    return this.httpService.get<Vss120AvailableFilters>(`${this.apiUrl}/reports/kpis/vss120Filters`);
  }

}
