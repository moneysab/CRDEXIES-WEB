// angular import
import { Component, Input, OnInit, effect, output, inject } from '@angular/core';
import { RouterModule ,Router} from '@angular/router';

// project import
import { AuthenticationService } from 'src/app/theme/shared/service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MantisConfig } from 'src/app/app-config';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { AuthService } from 'src/app/core/authentication/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserProfileDto, ConnexionFollowUpDto } from 'src/app/core/models/auth.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactModalComponent } from 'src/app/theme/shared/components/contact-modal/contact-modal.component';

// third party
import { TranslateService } from '@ngx-translate/core';
import screenfull from 'screenfull';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  WindowsOutline,
  TranslationOutline,
  BellOutline,
  MailOutline,
  FullscreenOutline,
  SettingOutline,
  FullscreenExitOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  CloseOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  authenticationService = inject(AuthenticationService);
  private translate = inject(TranslateService);
  private iconService = inject(IconService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  public router = inject(Router);
  private modalService = inject(NgbModal);

  // public props
  @Input() styleSelectorToggle!: boolean;
  readonly Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  direction: string = 'ltr';
 
  mantisConfig = MantisConfig;
  
  // User profile data
  userProfile: UserProfileDto | null = null;
  connectionHistory: ConnexionFollowUpDto[] = [];
  isLoading = true;
  error: string | null = null;
  
  Math = Math;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        WindowsOutline,
        TranslationOutline,
        BellOutline,
        MailOutline,
        FullscreenOutline,
        SettingOutline,
        FullscreenExitOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        CheckCircleOutline,
        CloseOutline,
        LogoutOutline,
        EditOutline,
        UserOutline,
        ProfileOutline,
        WalletOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline
      ]
    );
    effect(() => {
      this.isRtlTheme(this.themeService.isRTLMode());
    });
  }

  // life cycle
  ngOnInit() {
    setTimeout(() => {
      this.translate.use(MantisConfig.i18n);
    }, 0);
    this.loadUserProfile();
    this.loadConnectionHistory();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error = 'Failed to load user profile.';
        this.isLoading = false;
      }
    });
  }

  loadConnectionHistory(): void {
    this.userService.getConnectionFollowUp().subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
        'content' in data && 'totalElements' in data && 'totalPages' in data) {
        const paginatedData = data as { content: ConnexionFollowUpDto[], totalElements: number, totalPages: number };
        this.totalElements = paginatedData.totalElements;
        this.connectionHistory = paginatedData.content;
        this.totalPages = paginatedData.totalPages;
         } else{
        this.connectionHistory = data;
      }},
      error: (err) => {
        console.error('Error loading connection history:', err);
      }
    });
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/profile']);
  }

  get userFullName(): string {
    if (this.userProfile) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    return 'User';
  }

  get userRole(): string {
    return this.userProfile?.role || 'User';
  }
  // private method
  private isRtlTheme(isRtl: boolean) {
    this.direction = isRtl === true ? 'rtl' : 'ltr';
  }

  // public method
  // user according language change of sidebar menu item
  useLanguage(language: string) {
    this.translate.use(language).subscribe(() => {
    this.mantisConfig.i18n = language;
    this.reloadCurrentComponent();
  });
  }
  
  private reloadCurrentComponent() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl],{queryParamsHandling: 'merge'});
    });
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      action: () => this.router.navigate(['/profile'])
    },
    {
      icon: 'user',
      title: 'View Profile',
      action: () => this.router.navigate(['/profile'])
    },
    {
      icon: 'user',
      title: 'Change Password',
      action: () => this.router.navigate(['/change-password'])
    },
    /*
    {
      icon: 'wallet',
      title: 'Billing',
      action: () => this.router.navigate(['/dashboard/main'])
    }  */
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];

  messageList = [
    {
      userImage: 'assets/images/user/avatar-2.jpg',
      timestamp: '3:00 AM',
      boldText: 'Cristina danny birthday today',
      normalText: "It's",
      dateInfo: '2 min ago'
    },
    {
      userImage: 'assets/images/user/avatar-1.jpg',
      timestamp: '6:00 PM',
      boldText: 'Aida Burg',
      normalText: 'commented your post.',
      dateInfo: '5 August'
    },
    {
      userImage: 'assets/images/user/avatar-3.jpg',
      timestamp: '2:45 PM',
      normalText: 'There was a failure to your setup.',
      dateInfo: '7 hours ago'
    },
    {
      userImage: 'assets/images/user/avatar-4.jpg',
      timestamp: '9:10 PM',
      boldText: 'Cristina Danny invited to join Meeting.',
      dateInfo: 'Daily scrum meeting time'
    }
  ];

  customize() {
    this.styleSelectorToggle = !this.styleSelectorToggle;
    this.Customize.emit();
  }

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        console.log('Successfully signed out');
      },
      error: (err) => {
        console.error('Error signing out:', err);
        this.authService.logout();
      }
    });
  }

  // full screen toggle
  toggleFullscreen() {
    this.screenFull = screenfull.isFullscreen;
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  openContactModal() {
    const modalRef = this.modalService.open(ContactModalComponent, {
      backdrop: true,                
      centered: true,               
      windowClass: 'custom-contact-modal'
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed with:', result);
      },
      (reason) => {
        console.log('Modal dismissed with:', reason);
      }
    );
  }

  getEventType(eventType: string): string {
    const key = `FOLLOWUP.${eventType}`;
    return this.translate.instant(key);
  }
}
