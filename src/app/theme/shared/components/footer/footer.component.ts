import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { ContactModalComponent } from '../../components/contact-modal/contact-modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export class FooterComponent {
  constructor(private modalService: NgbModal) {}
  // Footer links
  footerLinks = [
    /*
    { name: 'Home', url: 'https://moneysab.fr/contact' },
    { name: 'Privacy Policy', url: 'https://moneysab.fr/politique-de-confidentialite' },
     */
    { name: 'contact_us', url: 'modal' }
    
  ];

  // Copyright text
  copyrightText = 'Copyright © Moneysab 2025';

  openContactModal() {
    this.modalService.open(ContactModalComponent, { size: 'md', centered: true });
  }
}