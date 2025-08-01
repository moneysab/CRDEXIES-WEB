import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import { VisaSettlementStatsRecord, VisaSettlementQueryParams, VisaSection, VisaStatLine } from '../../../../core/models/epin.models';
import { NgApexchartsModule } from 'ng-apexcharts';
import { start } from 'repl';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
};
export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  dataLabels: {
    enabled: boolean;
    style: {
      fontSize: string // Ensure this is an array of strings
    };
    formatter: () => string; // Function to format the data labels
  }
  plotOptions: {
    bar: {
      dataLabels: {
        enabled: boolean;
        position: string; // 'top' or 'center'
      };
    };
  }
  colors: string[];
};


@Component({
  selector: 'app-issuer-kpis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, NgApexchartsModule],
  templateUrl: './issuer-kpis.component.html',
  styleUrls: ['./issuer-kpis.component.scss']
})
export class IssuerKpisComponent implements OnInit {
  kpiData: any[] = [];
  kpis: VisaSettlementStatsRecord | null = null;
  kpiForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  // Filter parameters
  startDate: string = '';
  endDate: string = '';

  displayMode: 'table' | 'chart' = 'table';
  // Make Math available to the template
  Math = Math;

  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private epinService: EpinService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.kpiForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      currencyCode: ['978', [Validators.required]],
      binCode: [''],
    });
  }
  public interchangePieChart: Partial<ChartOptions> = {};
  public reimbursementChart: Partial<ChartOptions> = {};
  public chargesChart: Partial<ChartOptions> = {};
  public barChart: Partial<BarChartOptions> = {};

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);

    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(thirtyDaysAgo);

    this.loadKpiData();
  }

  loadKpiData(): void {
    this.isLoading = true;
    this.error = null;

    const params: VisaSettlementQueryParams = {
      startDate: this.kpiForm.value.startDate!,
      endDate: this.kpiForm.value.endDate!,
      currencyCode: this.kpiForm.value.currencyCode!,
      binCode: this.kpiForm.value.binCode!,
    };

    this.epinService.getKpis(params).subscribe({
      next: (response) => {
        console.log('Issuer KPIs response saaaaamy:', response);
        this.kpis = response;
        this.isLoading = false;
        this.initCharts();
      },
      error: (error) => {
        console.error('Error loading  KPIs:', error);
        this.error = this.translate.instant('ERRORS.LOAD_SUMMARY_FAILED');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {

    this.loadKpiData();
  }

  resetFilters(): void {
    this.kpiForm.reset({
      currencyCode: '978'
    });

    this.loadKpiData();
  }

  onPageChange(page: number): void {
    this.loadKpiData();
  }

  setDisplayMode(mode: 'table' | 'chart') {
    this.displayMode = mode;
  }

  exportData(format: 'csv' | 'excel'): void {
    const params = {
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.epinService.exportReport(format, params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `issuer-kpis-${this.startDate}-to-${this.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error(`Error exporting ${format}:`, error);
        this.error = `Failed to export ${format}. Please try again.`;
      }
    });
  }



  // Helper methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getStartOfYear(): string {
    const date = new Date();
    date.setMonth(0); // Janvier
    date.setDate(1);  // 1er jour
    return date.toISOString().split('T')[0];
  }
  getCurrencyLabel(code: string): string {
    switch (code) {
      case '978': return 'EUR';
      case '840': return 'USD';
      default: return code;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }
  goToInterchangeReport() {
    const filters = {
      startDate: this.kpiForm.value.startDate,
      endDate: this.kpiForm.value.endDate,
      currencyCode: this.kpiForm.value.currencyCode,
      binCode: this.kpiForm.value.binCode
    };

    this.router.navigate(['/epin/reports/interchange'], { queryParams: filters });
  }

  goToReimbursementReport() {
    const filters = {
      startDate: this.kpiForm.value.startDate,
      endDate: this.kpiForm.value.endDate,
      currencyCode: this.kpiForm.value.currencyCode,
      binCode: this.kpiForm.value.binCode
    };

    this.router.navigate(['/epin/reports/reimbursement'], { queryParams: filters });
  }

  goToChargesReport() {
    const filters = {
      startDate: this.kpiForm.value.startDate,
      endDate: this.kpiForm.value.endDate,
      currencyCode: this.kpiForm.value.currencyCode,
      binCode: this.kpiForm.value.binCode
    };

    this.router.navigate(['/epin/reports/charges'], { queryParams: filters });
  }
  navigateToUpload() {

    this.router.navigate(['/epin/upload']);
  }

  exportKpisToCsv(): void {
    const rows: string[] = [];
    const data = this.kpis || null;


    rows.push([
      'Section',
      'Role',
      'CreditCount',
      'CreditAmount',
      'DebitAmount',
      'TotalAmount',
      'Sign'
    ].join(','));

    const pushLine = (section: string, role: string, stat?: VisaStatLine) => {
      rows.push([
        section,
        role,
        stat?.creditCount ?? '',
        stat?.creditAmount ?? '',
        stat?.debitAmount ?? '',
        stat?.totalAmount ?? '',
        stat?.totalAmountSign ? `"${stat.totalAmountSign}"` : ''
      ].join(','));
    };

    const sections: { label: string; section?: VisaSection }[] = [
      { label: 'Interchange', section: data.interchangeValue },
      { label: 'Reimbursement Fees', section: data.reimbursementFees },
      { label: 'Visa Charges', section: data.visaCharges },
      { label: 'Total', section: data.total }
    ];

    sections.forEach(({ label, section }) => {
      if (section) {
        pushLine(label, 'Acquirer', section.acquirer);
        pushLine(label, 'Issuer', section.issuer);
        pushLine(label, 'Other', section.other);
        pushLine(label, 'Total', section.total);
        rows.push('');
      }
    });


    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'visa-kpis-report.csv';
    link.click();
  }


  initCharts() {
    this.interchangePieChart = {
      series: [
        this.kpis.interchangeValue.acquirer?.totalAmount ?? 0,
        this.kpis.interchangeValue.issuer?.totalAmount ?? 0,
        this.kpis.interchangeValue.other?.totalAmount ?? 0,
      ],
      chart: {
        type: 'pie',
        height: 300,
        width: '100%'
      },
      labels: ['Acquirer', 'Issuer', 'Other'],
      legend: {
        position: 'bottom',
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} ` + this.getCurrencyLabel(this.kpiForm.value.currencyCode),
        },
      },
    };

    this.reimbursementChart = {
      series: [
        this.kpis.reimbursementFees.acquirer?.totalAmount ?? 0,
        this.kpis.reimbursementFees.issuer?.totalAmount ?? 0,
        this.kpis.reimbursementFees.other?.totalAmount ?? 0,
      ],
      chart: {
        type: 'pie',
        height: 300,
        width: '100%'
      },
      labels: ['Acquirer', 'Issuer', 'Other'],
      legend: {
        position: 'bottom',
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} ` + this.getCurrencyLabel(this.kpiForm.value.currencyCode),
        },
      },
    };

    this.chargesChart = {
      series: [
        this.kpis.visaCharges.acquirer?.totalAmount ?? 0,
        this.kpis.visaCharges.issuer?.totalAmount ?? 0,
        this.kpis.visaCharges.other?.totalAmount ?? 0,
      ],
      chart: {
        type: 'pie',
        height: 300,
        width: '100%'
      },
      labels: ['Acquirer', 'Issuer', 'Other'],
      legend: {
        position: 'bottom',
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} ` + this.getCurrencyLabel(this.kpiForm.value.currencyCode),
        },
      },
    };
   
    this.barChart = {
      series: [
        {
          name: 'Credit',
          data: [
            Math.abs(this.kpis.interchangeValue.total?.creditAmount ?? 0),
            Math.abs(this.kpis.reimbursementFees.total?.creditAmount ?? 0),
            Math.abs(this.kpis.visaCharges.total?.creditAmount ?? 0),
            Math.abs(this.kpis.total.total?.creditAmount ?? 0),
          ],
        },
        {
          name: 'Debit',
          data: [
            -Math.abs(this.kpis.interchangeValue.total?.debitAmount ?? 0),
            -Math.abs(this.kpis.reimbursementFees.total?.debitAmount ?? 0),
            -Math.abs(this.kpis.visaCharges.total?.debitAmount ?? 0),
            -Math.abs(this.kpis.total.total?.debitAmount ?? 0),
          ],
        },
        {
          name: 'Total',
          data: [
            this.getSignedTotal(this.kpis.interchangeValue.total),
            this.getSignedTotal(this.kpis.reimbursementFees.total),
            this.getSignedTotal(this.kpis.visaCharges.total),
            this.getSignedTotal(this.kpis.total.total),
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 400,
        stacked: false
      },
      xaxis: {
        categories: ['Interchange', 'Reimbursement', 'Charges', 'Total'],
      },
      yaxis: {
       
        labels: {
          formatter: (val: number) => {
            if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + 'B';
            if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + 'M';
            if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
            return val.toFixed(2);
          },
        },
        title: {
          text: this.getCurrencyLabel(this.kpiForm.value.currencyCode),
        },
      },
      tooltip: {
        y: {
          // formatter: (val: number) => `${val.toFixed(2)} ${this.getCurrencyLabel(this.kpiForm.value.currencyCode)}`,
          formatter: (val: number) => {
            const sign = val >= 0 ? 'CR' : 'DB';
            return `${Math.abs(val).toFixed(2)} ${sign}`;
          }
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '0px'
        },
        formatter: () => ''

      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false,
            position: 'center',
          },
        },
      },
      colors: ['#1a73e8', '#fbbc04', '#34a853'],
    };

  }


  getSignedTotal(totalObj: VisaStatLine): number {
    const totalValue = Math.abs(totalObj?.totalAmount ?? 0);
    const sign = (totalObj?.totalAmountSign ?? '').toUpperCase();
    return sign === 'CR' ? totalValue : -totalValue;
  }


}