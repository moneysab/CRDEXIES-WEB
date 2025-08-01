export interface IpmSummary {
    id?: string;
    memberId?: string;
    fileId?: string;
    clearingCycle?: string;
    acceptanceBrand?: string;
    businessServiceLevel?: string;
    businessServiceId?: string;
    summaryType?: string;
    reconAmount?: number;
    reconCrDrIndicator?: string;
    feeAmount?: number;
    feeCrDrIndicator?: string;
    currencyCode?: string;
    processingDate?: string; 
    runDate?: string;        
    isValid?: boolean;
  }

  export interface IpmSumamryParams {
    memberId?: string;
    acceptanceBrand?: string;
    businessServiceId?: string;
    summaryType?: string;
    currencyCode?: string;
    startDate?: string; 
    endDate?: string;   
    page?: number;      
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }

  export interface IpmTransaction {
    id?: string;
    memberId?: string;
    fileId?: string;
    clearingCycle?: string;
    acceptanceBrand?: string;
    businessServiceLevel?: string;
    businessServiceId?: string;
    transactionType?: string;
    transactionFunction?: string;
    processCode?: string;
    irdCode?: string;
    transactionCount?: number;
    reconAmount?: number;
    reconCrDrIndicator?: string;
    reconCurrencyCode?: string;
    feeAmount?: number;
    feeCrDrIndicator?: string;
    feeCurrencyCode?: string;
    processingDate?: string; 
    runDate?: string;        
    rawRunDate?: string;
    isValid?: boolean;
    validationErrors?: string;
    lineNumber?: number;
    pageNumber?: number;
    signedReconAmount?: number;
    signedFeeAmount?: number;
    isReconCredit?: boolean;
    isFeeCredit?: boolean;
  }

  export interface IpmTransactionParams {
    memberId?: string;
    acceptanceBrand?: string;      
    businessServiceId?: string;
    clearingCycle?: string;
    transactionType?: string;
    currencyCode?: string;
    startDate?: string;            
    endDate?: string;              
    page?: number;                
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }

  export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
  }
  