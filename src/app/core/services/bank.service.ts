import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap} from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import { BankInfoRequestDto, BankInfoDetailDto, BankInfoQueryParams } from '../models/invoice.models';
@Injectable({
  providedIn: 'root'
})
export class BankService {

  constructor(private httpService: HttpService, private http: HttpClient) { }

  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }

  getBankList(params: BankInfoQueryParams = {}): Observable<BankInfoDetailDto[]> {
    return this.httpService.get<BankInfoDetailDto[]>(
      'api/bank/list', this.toHttpParams(params));
  }

  createBankInfo(bankData: BankInfoRequestDto): Observable<BankInfoDetailDto> {
    return this.http.post<BankInfoDetailDto>(`${environment.apiUrl}/api/bank/create`, bankData, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    })
      .pipe(
        tap(response => console.log('Bank created successfully:', response)),
        catchError(error => {
          console.error('Error creating Bank:', error);
          throw error;
        })
      );

  }

  getBankById(id: string): Observable<BankInfoDetailDto> {
    return this.httpService.get<BankInfoDetailDto>(`api/bank/${id}`);
  }

  updateBank(bankData: BankInfoRequestDto): Observable<BankInfoDetailDto> {
    return this.http.post<BankInfoDetailDto>(`${environment.apiUrl}/api/bank/update`, bankData, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    })
      .pipe(
        tap(response => console.log('Bank updated successfully:', response)),
        catchError(error => {
          console.error('Error updating bank:', error);
          throw error;
        })
      );

  }
}
