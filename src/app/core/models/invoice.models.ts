export interface VisaInvoiceDetailDto {
  id?: string;
  billingPeriod?: string;
  invoiceDate?: string;
  invoiceAccount?: string;
  name?: string;
  invoiceId?: string;
  subInvoice?: string;
  currentOrPrevious?: string;
  entityType?: string;
  entityId?: string;
  numidMap?: string;
  entityName?: string;
  settlementId?: string;
  description?: string;
  futureUse?: string;
  ntwk?: string;
  billingLine?: string;
  type?: string;
  rateType?: string;
  units?: number;
  rateCur?: string;
  rate?: number;
  foreignExchangeRate?: number;
  billingCurrency?: string;
  total?: number;
  taxType?: string;
  tax?: number;
  taxRate?: number;
  taxCurrency?: string;
  taxableAmountTaxCurrency?: number;
  taxTaxCurrency?: number;
}

export interface MastercardInvoiceDetailDto {
  id?: string;
  documentType?: string;
  invoiceNumber?: string;
  currency?: string;
  billingCycleDate?: string;
  invoiceIca?: string;
  activityIca?: string;
  billableIca?: string;
  collectionMethod?: string;
  serviceCode?: string;
  serviceCodeDescription?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  originalInvoiceNumber?: string;
  eventId?: string;
  eventDescription?: string;
  affiliate?: string;
  uom?: string;
  quantityAmount?: number;
  rate?: number;
  charge?: number;
  taxCharge?: number;
  totalCharge?: number;
  vatCharge?: number;
  vatCurrency?: string;
  vatCode?: string;
  vatRate?: number;
  sbfExplanatoryText?: string;
  feeType?: string;
  category?: string;
  subcategory?: string;
  csvFile?: string;
}

export interface SummaryVisaResponseDto {
  billing_date?: string;
  total_charges_USD?: number;
  currency_distribution?: Record<string, number>;
}

export interface SummaryResponseDto {
  billing_date?: string;
  total_charges_USD?: number;
  currency_distribution?: Record<string, number>;
}

export interface ServiceBreakdownResponseDto {
  serviceCode?: string;
  description?: string;
  currency?: string;
  feeType?: string;
  invoiceId?: string;
  bankId?: string;
  totalAmount?: number;
}

export interface CsvFileParams {
  csvName?: string;
  network?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface InvoiceQueryParams {
  page?: number;
  size?: number;
}

export interface VisaInvoiceQueryParams extends InvoiceQueryParams {
  startDate?: string;
  endDate?: string;
  billingPeriod?: string;
  invoiceId?: string;
  csvName?: string;
  billingLine?: string;
  entityName?: string;
  description?: string;
  totalMin?: number;          
  totalMax?: number;
  type?: string;
  billingCurrency?: string;
}

export interface VisaSumamryQueryParams extends InvoiceQueryParams {
  billingPeriod?: string;
  invoiceNumber?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  billingLine?: string;
  entityId?: string;
  billingCurrency?: string;
}

export interface MastercardInvoiceQueryParams extends InvoiceQueryParams {
  startDate?: string;
  endDate?: string;
  invoiceNumber?: string;
  csvName?: string;
  currency?: string;
  totalMin?: number;
  totalMax?: number;
  feeType?: string;
  activityIca?: string;
  billableIca?: string;
  eventId?: string;
  eventDescription?: string;
  serviceCode?: string;
  serviceCodeDescription?: string;
  category?: string;
  subcategory?: string;
}

export interface MastercardSummaryQueryParams extends InvoiceQueryParams {
  startDate?: string;
  endDate?: string;
  invoiceNumber?: string;
  feeType?: string;
  activityIca?: string;
  serviceCode?: string;
  currency?: string;
}

export interface ConnexionFollowUpQueryParams extends InvoiceQueryParams {
  userName?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
}

export interface UsersListQueryParams extends InvoiceQueryParams {
  userName?: string;
}

export interface BankInfoQueryParams extends InvoiceQueryParams {
  bankName?: string;
  billableIca?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface BankInfoDetailDto{
  id?: string;
  billableIca?: string;
  bankName?: string;
  currency?:string;
  country?: string;
  dateCreation?:string;
  updatedDate?:string;
  createdBy?: string;
}
export interface BankInfoRequestDto{
  billableIca?: string;
  bankName?: string;
  currency?:string;
  country?: string;
}

export interface SummaryStatsDto {
  total?: number;
  acquisition?: number;
  issuer?: number;
  both?: number;
}