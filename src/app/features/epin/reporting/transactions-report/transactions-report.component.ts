import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,ActivatedRoute ,Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule ,FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import {VisaTransactionDetailsDto,VisaTransactionsQueryParams,Vss120AvailableFilters,BusinessModeGroup,BinDetails} from '../../../../core/models/epin.models';
import {
  ApexAxisChartSeries,
  ApexOptions, 
  ApexXAxis,
  ApexTitleSubtitle,
  NgApexchartsModule
} from 'ng-apexcharts';



@Component({
  selector: 'app-transactions-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, NgApexchartsModule],
  templateUrl: './transactions-report.component.html',
  styleUrl: './transactions-report.component.scss'
})
export class TransactionsReportComponent implements OnInit{

  transactionsData: VisaTransactionDetailsDto|null = null;
  availableFilters: Vss120AvailableFilters | null = null;
  isLoading = false;
  error: string | null = null;
  transactionsForm: FormGroup;

  isGraphView = false;


 // Charts Data
 currencyChartSeries: ApexAxisChartSeries = [];
 currencyChartOptions: ApexOptions = {}; // ApexOptions ici
 currencyXAxis: ApexXAxis = { categories: [] };


 binPieSeries: number[] = [];
 binPieLabels: string[] = [];
 pieChartOptions: ApexOptions = {};

 averageStackedSeries: ApexAxisChartSeries = [];
 averageStackedXAxis: ApexXAxis = { categories: [] };
 averageStackedOptions: ApexOptions = {};

 businessModeSeries: ApexAxisChartSeries = [];
 businessModeXAxis: ApexXAxis = { categories: [] };
 businessModeOptions: ApexOptions = {};

 binBarSeries: ApexAxisChartSeries = [];
 binBarXAxis: ApexXAxis = { categories: [] };
 binBarOptions: ApexOptions = {};

 binAvgSeries: ApexAxisChartSeries = [];
 binAvgXAxis: ApexXAxis = { categories: [] };
 binAvgOptions: ApexOptions = {};

 businessModeAvgSeries: ApexAxisChartSeries = [];
 businessModeAvgXAxis: ApexXAxis = { categories: [] };
 businessModeAvgOptions: ApexOptions = {};

  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private epinService: EpinService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.transactionsForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      currencyCode: [''],
      binCode: [''],
      businessModeCode: [''],
      transactionType: [''],
      clearingCurrencyCode: ['']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadAvailableFilters();
    const filters = history.state.filters;
    if (filters) {
      this.transactionsForm.patchValue(filters);
    } 
    this.loadTransactionsData();
  }


  loadTransactionsData(): void {
      this.isLoading = true;
      this.error = null;
      
      const params: VisaTransactionsQueryParams = {
        startDate: this.transactionsForm.value.startDate!,
        endDate: this.transactionsForm.value.endDate!,
        currencyCode: this.transactionsForm.value.currencyCode!,
        binCode: this.transactionsForm.value.binCode!,
        businessModeCode: this.transactionsForm.value.businessModeCode!,
        transactionType: this.transactionsForm.value.transactionType!,
        clearingCurrencyCode: this.transactionsForm.value.clearingCurrencyCode!
      };
      
      this.epinService.getTransactionsDetails(params).subscribe({
        next: (response) => {
          console.log('transactions Data ', response);
          this.transactionsData = response;
          this.isLoading = false;
          this.prepareCharts(); 
        },
        error: (error) => {
          console.error('Error loading  transactions Data:', error);
         // this.error = this.translate.instant('ERRORS.LOAD_INTERCHANGE_FAILED');
         this.error = this.translate.instant('VISA_TRANSACTIONS.ERROR_LOADING_TRANSACTIONS') ;
         this.isLoading = false;
        }
      });
    }

  loadAvailableFilters(): void {
    this.isLoading = true;
    this.error = null;
    this.epinService.getVisaAvailableFilters().subscribe({
      next: (response) => {
        console.log('Available filters ', response);
        this.availableFilters = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading available filters:', error);
        this.error = this.translate.instant('VISA_TRANSACTIONS.ERROR_LOADING_FILTERS') ;
        this.isLoading = false;
      }
    });
  }


  applyFilters(): void {
    this.loadTransactionsData();

  }

  resetFilters(): void {
    this.transactionsForm.reset();
    
   this.loadTransactionsData();
  }

  formatCurrency(value: number, currencyCode: string): string {
    let locale = 'en-US';
    let currency = 'USD';
  
    if (currencyCode === 'EUR') {
      locale = 'fr-FR';
      currency = 'EUR';
    } else if (currencyCode === 'USD') {
      locale = 'en-US';
      currency = 'USD';
    }
  
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }
  
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  exportTocsv(){

  }

  viewBusinessModeDetails(currency: string, mode: BusinessModeGroup) {
    this.router.navigate(['/epin/reports/transactions/detail'], {
      state: {
        currency,
        businessMode: mode.businessMode,
        businessModeData: mode,
        filters: this.transactionsForm.value
      }
    });
  }

  getBinPercentage(bin: any, currency: any): number {
    const netAmountTotal = currency.totalCreditAmount - currency.totalDebitAmount;
    const binNetAmount = bin.totalCreditAmount - bin.totalDebitAmount;
  
    if (netAmountTotal === 0) return 0; 
  
    return (binNetAmount / netAmountTotal) * 100;
  }

  toggleView(): void {
    this.isGraphView = !this.isGraphView;
    if (this.isGraphView) this.prepareCharts();
  }
  
  prepareCharts(): void {
    if (!this.transactionsData?.settlementCurrencies?.length) return;
  
    const currencies = this.transactionsData.settlementCurrencies;
    const currencyCodes = currencies.map(c => c.settlementCurrency);
  
    //  Currency Chart
    this.currencyChartSeries = [
      { name: 'Credit Transactions', data: currencies.map(c => c.totalCreditTransactionCount || 0) },
      { name: 'Debit Transactions', data: currencies.map(c => c.totalDebitTransactionCount || 0) },
      { name: 'Total Transactions', data: currencies.map(c => c.totalTransactionCount || 0) }
    ];
    
    this.currencyChartOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      colors: ['#28a745', '#ffc107', '#007bff'],
      xaxis: { categories: currencyCodes },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.TRANSACTIONS_BY_CURRENCY') },
      dataLabels: {
        enabled: false,
      },
    };
  
    this.averageStackedSeries = [
      { 
        name: 'Avg Credit', 
        data: currencies.map(c => c.averageCreditAmount || 0) 
      },
      { 
        name: 'Avg Debit', 
        data: currencies.map(c => c.averageDebitAmount || 0) 
      }
    ];
    this.averageStackedOptions = {
      chart: { type: 'bar', height: 350},
      plotOptions: { bar: { horizontal: true } },
      colors: ['#007bff', '#ffc107'],
      xaxis: { categories: currencies.map(c => c.settlementCurrency) },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.AVERAGE_BY_CURRENCY') },
      tooltip: {
        shared: false,
        y: {
          formatter: (value) => this.formatCurrency(value,currencyCodes[0])
        },
        
      },
      legend: { position: 'top' }
    };

    // BIN Charts
    const allBins = currencies.flatMap(c => c.binDetails || []);
    const binLabels = [...new Set(allBins.map(b => b.bin))];

    this.binBarSeries = [
      {
        name: 'Credit Transactions',
        data: binLabels.map(bin =>
          allBins.filter(b => b.bin === bin).reduce((sum, b) => sum + b.totalCreditTransactionCount, 0)
        )
      },
      {
        name: 'Debit Transactions',
        data: binLabels.map(bin =>
          allBins.filter(b => b.bin === bin).reduce((sum, b) => sum + b.totalDebitTransactionCount, 0)
        )
      },
      {
        name: 'Total Transactions',
        data: binLabels.map(bin =>
          allBins.filter(b => b.bin === bin).reduce((sum, b) => sum + b.totalTransactionCount, 0)
        )
      }
    ];
    this.binBarOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      colors: ['#28a745', '#ffc107', '#007bff'],
      xaxis: { categories: binLabels },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.TRANSACTIONS_BY_BIN') },
      dataLabels: {
        enabled: false,
      },
    };

    this.binAvgSeries = [
      {
        name: 'Avg Credit',
        data: binLabels.map(bin => {
          const entries = allBins.filter(b => b.bin === bin);
          return entries.reduce((sum, b) => sum + b.averageCreditAmount, 0) / entries.length;
        })
      },
      {
        name: 'Avg Debit',
        data: binLabels.map(bin => {
          const entries = allBins.filter(b => b.bin === bin);
          return entries.reduce((sum, b) => sum + b.averageDebitAmount, 0) / entries.length;
        })
      }
    ];
    this.binAvgOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      colors: ['#28a745', '#ffc107'],
      xaxis: { categories: binLabels },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.AVERAGE_BY_BIN') },
      tooltip: {
        shared: false,
        y: {
          formatter: (value) => this.formatCurrency(value, currencyCodes[0])
        },
        
      },
    };

    //  Business Modes Chart
    const allModes = currencies.flatMap(c => c.businessModes);
    const modeLabels = [...new Set(allModes.map(m => m.businessMode))];
    const businessModeTotals = modeLabels.map(label => {
      const modes = allModes.filter(m => m.businessMode === label);
      return {
        credit: modes.reduce((sum, m) => sum + (m.totalCreditTransactionCount || 0), 0),
        debit: modes.reduce((sum, m) => sum + (m.totalDebitTransactionCount || 0), 0),
        total: modes.reduce((sum, m) => sum + (m.totalTransactionCount || 0), 0)
      };
    });
  
    this.businessModeSeries = [
      { name: 'Credit Transactions', data: businessModeTotals.map(m => m.credit) },
      { name: 'Debit Transactions', data: businessModeTotals.map(m => m.debit) },
      { name: 'Total Transactions', data: businessModeTotals.map(m => m.total) }
    ];
    
    this.businessModeOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      colors: ['#28a745', '#ffc107', '#007bff'],
      xaxis: { categories: modeLabels },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.TRANSACTIONS_BY_BUSINESS_MODE') },
      tooltip: {
        shared: false,
        y: {
          formatter: (value) => this.formatNumber(value)
        },
        
      },
      dataLabels: {
        enabled: false,
      },
    };
  

    this.businessModeAvgSeries = [
      {
        name: 'Avg Credit',
        data: modeLabels.map(label => {
          const entries = allModes.filter(m => m.businessMode === label);
          return entries.reduce((sum, m) => sum + m.averageCreditAmount, 0) / entries.length;
        })
      },
      {
        name: 'Avg Debit',
        data: modeLabels.map(label => {
          const entries = allModes.filter(m => m.businessMode === label);
          return entries.reduce((sum, m) => sum + m.averageDebitAmount, 0) / entries.length;
        })
      }
    ];
    this.businessModeAvgOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      colors: ['#28a745', '#ffc107'],
      xaxis: { categories: modeLabels },
      title: { text: this.translate.instant('VISA_TRANSACTIONS.AVERAGE_BY_BUSINESS_MODE') },
      tooltip: {
        shared: false,
        y: {
          formatter: (value) => this.formatCurrency(value, currencyCodes[0])
        },
        
      },
    };
  }
  

}


