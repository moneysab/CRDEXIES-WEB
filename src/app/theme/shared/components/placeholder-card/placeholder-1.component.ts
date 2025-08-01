// angular import
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-card-1',
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="customClass" aria-hidden="true">
      <p class="card-text placeholder-glow">
        <span class="placeholder w-100 rounded" style="height: {{ height }}px;"></span>
      </p>
    </div>
  `
})
export class PlaceholderCard1Component {
  // public  props
  @Input() height!: number;
  @Input() customClass!: string;
}
