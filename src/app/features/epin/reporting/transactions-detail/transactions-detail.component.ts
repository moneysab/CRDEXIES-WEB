import { Component, OnInit, inject } from '@angular/core';
import { CommonModule,Location  } from '@angular/common';
import { RouterModule,ActivatedRoute ,Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import {BusinessModeGroup} from '../../../../core/models/epin.models';
import { MantisConfig } from 'src/app/app-config';
@Component({
  selector: 'app-transactions-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './transactions-detail.component.html',
  styleUrl: './transactions-detail.component.scss'
})
export class TransactionsDetailComponent implements OnInit {
  private translateService = inject(TranslateService);
    mantisConfig = MantisConfig;
  
  businessModeData!: BusinessModeGroup;
  currency!: string;
  filters!:any;

  constructor(private router: Router,
    private location: Location

  ) {
 
  }

  ngOnInit(): void {
    this.translateService.use(this.mantisConfig.i18n);
    const businessModeData = history.state.businessModeData;
    const currency = history.state.currency;
    this.filters = history.state.filters ;
    if (businessModeData && currency) {
      this.businessModeData = businessModeData;
      this.currency = currency;
    } else {
    this.goBack();
    }
  }

  goBack() {   
     this.router.navigate(['/epin/reports/transactions'], {
    state: {
      filters: this.filters
    }
  });
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
}
