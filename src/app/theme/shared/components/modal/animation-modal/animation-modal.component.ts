// Angular import
import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-animation-modal',
  imports: [CommonModule],
  templateUrl: './animation-modal.component.html',
  styleUrls: ['./animation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnimationModalComponent {
  // public props
  @Input() modalClass!: string;
  @Input() contentClass!: string;
  @Input() modalID!: string;
  @Input() backDrop: boolean = false;

  // public method
  close(event: string) {
    (document.querySelector('#' + event) as HTMLElement).classList.remove('md-show');
  }
}
