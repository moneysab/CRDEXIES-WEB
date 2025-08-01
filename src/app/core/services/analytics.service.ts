import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RbacService } from './rbac.service';
import { HttpService } from './http.service';

export interface TrendsRequestDto {
  startDate: string;
  endDate: string;
  cardTypes: string[];
  groupBy: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  includeBreakdown: boolean;
  comparisonPeriod: 'SAME_PERIOD_LAST_YEAR' | 'PREVIOUS_PERIOD' | 'NONE';
}

export interface CardTypeAmount {
  [key: string]: number;
}

export interface PeriodData {
  period: string;
  totalAmount: number;
  cardTypeAmounts: CardTypeAmount;
  transactionCount: number;
}
export interface CategoryPercentageChanges {
  ISSUER: number;
  ACQUIRER: number;
  BOTH: number;
}

export interface ComparisonData {
  comparisonType: string;
  currentPeriodTotal: number;
  comparisonPeriodTotal: number;
  percentageChange: number;
  categoryPercentageChanges: CategoryPercentageChanges;
}
export interface ServiceCategoryTrend {
  serviceCategory: string;
  totalAmount: number;
  percentageOfTotal: number;
  growthRate: number;
}

export interface TrendsResponseDto {
  startDate: string;
  endDate: string;
  groupBy: string;
  cardTypes: string[];
  periodData: PeriodData[];
  serviceCategoryTrends: ServiceCategoryTrend[];
  overallGrowthRate: number;
  categoryGrowthRates?: { [category: string]: number };
  insights: string[];
  comparisonData: ComparisonData;
}

export interface AnomalyDto {
  anomalyId: string;
  cardType: string;
  invoiceId: string;            
  detectionDate: string;          
  description: string;
  category: string;               
  expectedValue: number;
  actualValue: number;
  deviationPercentage: number;
  serviceCode: string;
  entityName: string;             
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confirmed: boolean;             
}

export interface IgnoreAnomalyRequest {
  anomaly: AnomalyDto;
  comment: string;
}

export interface SendAnomalyRequest {
  anomaly: AnomalyDto;
  comment: string;
  assignedTo: string;
}


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(
    private httpService: HttpService,
    private rbacService: RbacService
  ) {}

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
   * Get trends analysis data
   */
  getTrendsAnalysis(request: TrendsRequestDto): Observable<TrendsResponseDto> {
    return this.httpService.post<TrendsResponseDto>('api/analytics/trends', request);
  }

  /**
   * Get anomalies for a specific card type
   */
  getAnomalies(
    cardType: string, 
    startDate: string, 
    endDate: string, 
    threshold: number = 2, 
    minGlobalPercentage: number = 0.5
  ): Observable<AnomalyDto[]> {
    const params = this.toHttpParams({
      threshold: threshold,
      minGlobalPercentage: minGlobalPercentage.toString(), 
      startDate: startDate, 
      endDate: endDate     
    });

    console.log('parms',params);
    
    return this.httpService.post<AnomalyDto[]>(
      `api/analytics/${cardType.toLowerCase()}/anomalies`, 
      {}, 
      { params }
    );
  }

  /**
   * Check if user has access to analytics
   */
  hasAnalyticsAccess(): Observable<boolean> {
    return this.rbacService.hasPermission('analytics', 'view');
  }

  ignoreAnomaly(request: IgnoreAnomalyRequest): Observable<string> {
    return this.httpService.post<string>(
      'api/analytics/anomalies/ignore',
      request,
      {
        responseType: 'text' as 'json'
      }
    );
  }

  sendAnomaly(request: SendAnomalyRequest): Observable<string> {
    return this.httpService.post<string>('api/analytics/anomalies/send', request, {
      responseType: 'text' as 'json'
    });
  }
  
}