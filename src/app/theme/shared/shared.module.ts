import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BidiModule } from '@angular/cdk/bidi';

// project import
import { CardComponent } from './components/card/card.component';
import { CustomTranslateLoader } from './custom-translate-loader';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IconModule } from '@ant-design/icons-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

// bootstrap import
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
  NgbModule,
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDatepickerModule
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbModule,
    NgbAccordionModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BidiModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader
      }
    }),
    IconModule
  ],
  exports: [
    CommonModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbModule,
    NgbAccordionModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    TranslateModule,
    IconModule,
    BidiModule
  ]
})
export class SharedModule {}
