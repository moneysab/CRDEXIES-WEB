// Angular import
import { Component, ContentChild, TemplateRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

export interface RowContext {
  $implicit: any;
}

export interface CellContext {
  $implicit: any;
  column: {
    key: string;
    label: string;
    format?: (value: any, row: any) => string;
    class?: string;
  };
}

export interface ErrorContext {
  $implicit: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  /**
   * Title of the data table card
   */
  cardTitle = input<string>();

  /**
   * Class to be applied at card level
   */
  cardClass = input<string>();

  /**
   * Class to be applied at table level
   */
  tableClass = input<string>('table table-hover');

  /**
   * Whether to show the card header
   */
  showHeader = input(true);

  /**
   * Class to be applied on card header
   */
  headerClass = input<string>('border-bottom');

  /**
   * Whether to make the table responsive
   */
  responsive = input(true);

  /**
   * Data to be displayed in the table
   */
  data = input<any[]>([]);

  /**
   * Columns configuration for the table
   */
  columns = input<{
    key: string;
    label: string;
    format?: (value: any, row: any) => string;
    class?: string;
  }[]>([]);

  /**
   * Whether the table is in loading state
   */
  loading = input(false);

  /**
   * Error message to display if there's an error
   */
  errorMessage = input<string | null>(null);

  /**
   * Message to display when there's no data
   */
  noDataMessage = input('No data available');

  /**
   * Template reference for custom row actions
   */
  @ContentChild('rowActionsTemplate') rowActionsTemplate!: TemplateRef<RowContext>;

  /**
   * Template reference for custom header actions
   */
  @ContentChild('headerActionsTemplate') headerActionsTemplate!: TemplateRef<any>;

  /**
   * Template reference for custom cell rendering
   */
  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<CellContext>;

  /**
   * Template reference for custom loading state
   */
  @ContentChild('loadingTemplate') loadingTemplate!: TemplateRef<any>;

  /**
   * Template reference for custom empty state
   */
  @ContentChild('emptyTemplate') emptyTemplate!: TemplateRef<any>;

  /**
   * Template reference for custom error state
   */
  @ContentChild('errorTemplate') errorTemplate!: TemplateRef<ErrorContext>;
}