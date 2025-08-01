// angular import
import { Directive } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent {
  column: string;
  direction: SortDirection;
}

@Directive({
  selector: 'th[appSortable]',
  standalone: true
})
export class NgbdSortableHeaderDirective {}
