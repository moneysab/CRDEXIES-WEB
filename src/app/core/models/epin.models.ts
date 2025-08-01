export interface ProcessingStatistics {
  totalJobs?: number;
  activeJobs?: number;
  completedJobs?: number;
  failedJobs?: number;
  successRate?: number;
  averageProcessingTimeSeconds?: number;
  averageRecordsPerJob?: number;
  largestJobRecords?: number;
  smallestJobRecords?: number;
  jobStatusDistribution?:  {
    [status: string]: number; 
  };
  recentJobs?: FileProcessingJob[];
}

export interface FileProcessingJob {
  id?: string;
  originalFilename?: string;
  fileType?: string;
  status?: string;
  reportFormat?: string ;
  clientId?: string ;
  fileSizeBytes?: number ;
  totalRecords?: number ;
  processedRecords?: number ;
  failedRecords?: number ;
  processingStartedAt?: string ; 
  processingCompletedAt?: string ; 
  errorMessage?: string ;
  retryCount?: number ;
  maxRetries?: number ;
  successRate?: number;
}

export interface EpinQueryParams {
  page?: number;
  size?: number;
}
export interface JobsQueryParams extends EpinQueryParams {
  jobsName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
export interface VisaSettlementStatsRecord {
  interchangeValue?: VisaSection;
  reimbursementFees?: VisaSection;
  visaCharges?: VisaSection;
  total?: VisaSection;
}

export interface VisaSection {
  acquirer?: VisaStatLine;
  issuer?: VisaStatLine;
  other?: VisaStatLine;
  total?: VisaStatLine;
}

export interface VisaStatLine {
  creditCount?: number;
  creditAmount?: number; 
  debitAmount?: number;
  totalAmount?: number;
  totalAmountSign?: string; 
}
export interface VisaSettlementQueryParams {
  startDate?: string;
  endDate?: string;
  currencyCode?: string;
  binCode?: string;
}
export interface InterchangeDetails {
  businessModes?: BusinessMode[];
}
export interface BusinessMode {
  businessMode?: string;
  transactionTypes?: TransactionType[];
  totalCount?: number;
  totalClearingAmount?: number;
  totalInterchangeCredits?: number;
  totalInterchangeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface TransactionType {
  transactionType?: string;
  cycles?: TransactionCycle[];
  totalCount?: number;
  totalClearingAmount?: number;
  totalInterchangeCredits?: number;
  totalInterchangeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface TransactionCycle {
  transactionCycle?: string;
  rateTableId?: string;
  count?: number;
  clearingAmount?: number;
  interchangeCredits?: number;
  interchangeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ReimbursementDetails {
  businessModes?: ReimbursementBusinessMode[];
}

export interface ReimbursementBusinessMode {
  businessMode?: string;
  transactionTypes?: ReimbursementTransactionType[];
  totalCount?: number;
  totalClearingAmount?: number;
  totalReimbursementFeeCredits?: number;
  totalReimbursementFeeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ReimbursementTransactionType {
  transactionType?: string;
  cycles?: ReimbursementCycle[];
  totalCount?: number;
  totalClearingAmount?: number;
  totalReimbursementFeeCredits?: number;
  totalReimbursementFeeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ReimbursementCycle {
  transactionCycle?: string;
  jurisdiction?: string;
  routing?: string;
  feeLevelDescription?: string;

  count?: number;
  clearingAmount?: number;
  reimbursementFeeCredits?: number;
  reimbursementFeeDebits?: number;
  netAmount?: number;
  amountSign?: string;
}


export interface ChargesDetails {
  businessModes?: ChargesBusinessMode[];
}

export interface ChargesBusinessMode {
  businessMode?: string;
  chargeTypes?: ChargesChargeType[];
  totalCount?: number;
  totalInterchangeAmount?: number;
  totalVisaChargesCredits?: number;
  totalVisaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ChargesChargeType {
  chargeTypeCode?: string;
  transactionTypes?: ChargesTransactionType[];
  totalCount?: number;
  totalInterchangeAmount?: number;
  totalVisaChargesCredits?: number;
  totalVisaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ChargesTransactionType {
  transactionType?: string;
  cycles?: ChargesCycle[];
  totalCount?: number;
  totalInterchangeAmount?: number;
  totalVisaChargesCredits?: number;
  totalVisaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ChargesCycle {
  transactionCycle?: string;
  jurisdictions?: ChargesJurisdiction[];
  totalCount?: number;
  totalInterchangeAmount?: number;
  totalVisaChargesCredits?: number;
  totalVisaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ChargesJurisdiction {
  jurisdictionCode?: string;
  routings?: ChargesRouting[];
  totalCount?: number;
  totalInterchangeAmount?: number;
  totalVisaChargesCredits?: number;
  totalVisaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}

export interface ChargesRouting {
  routing?: string;
  count?: number;
  interchangeAmount?: number;
  visaChargesCredits?: number;
  visaChargesDebits?: number;
  netAmount?: number;
  amountSign?: string;
}


export interface VisaTransactionDetailsDto {
  settlementCurrencies: SettlementCurrencyGroup[];
}

export interface SettlementCurrencyGroup {
  settlementCurrency: string;
  totalTransactionCount: number;
  totalCreditTransactionCount: number;
  totalDebitTransactionCount: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
  averageCreditAmount: number;
  averageDebitAmount: number;
  binDetails: BinDetails[];
  businessModes: BusinessModeGroup[];
}

export interface BinDetails {
  bin: string;
  totalTransactionCount: number;
  totalCreditTransactionCount: number;
  totalDebitTransactionCount: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
  averageCreditAmount: number;
  averageDebitAmount: number;
}

export interface BusinessModeGroup {
  businessMode: string;
  totalTransactionCount: number;
  totalCreditTransactionCount: number;
  totalDebitTransactionCount: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
  averageCreditAmount: number;
  averageDebitAmount: number;
  bins: BinGroup[];
}

export interface BinGroup {
  bin: string;
  transactionTypes: TransactionTypeGroup[];
}

export interface TransactionTypeGroup {
  transactionType: string;
  totalTransactionCount: number;
  totalCreditTransactionCount: number;
  totalDebitTransactionCount: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
  averageCreditAmount: number;
  averageDebitAmount: number;
  clearingCurrencies: ClearingCurrencyAggregate[];
}

export interface ClearingCurrencyAggregate {
  clearingCurrency: string;
  transactionCount: number;
  clearingAmountTotal: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
}

export interface VisaTransactionsQueryParams {
  startDate?: string;
  endDate?: string;
  currencyCode?: string;
  binCode?: string;
  businessModeCode?: string;
  transactionType?: string;
  clearingCurrencyCode?: string;
}

export interface Vss120AvailableFilters {
  transactionTypes: CodeLabel[];
  businessModes: CodeLabel[];
  clearingCurrencyCodes: CodeLabel[];
  settlementCurrencyCodes: CodeLabel[];
  destinationIds: string[];
}

export interface CodeLabel {
  code: string;
  label: string;
}