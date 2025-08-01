// Angular import
import { AfterViewInit, Component, ElementRef, OnInit, effect, viewChild, output, inject } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem, NavigationItems } from '../navigation';
import { MantisConfig } from 'src/app/app-config';
import { environment } from 'src/environments/environment';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { AuthenticationService } from 'src/app/theme/shared/service';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { AuthService } from 'src/app/core/authentication/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserProfileDto } from 'src/app/core/models/auth.models';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  IdcardOutline,
  DatabaseOutline,
  LineChartOutline,
  MessageOutline,
  CalendarOutline,
  CustomerServiceOutline,
  UserOutline,
  ShoppingCartOutline,
  LayoutOutline,
  CreditCardOutline,
  GoldOutline,
  ShareAltOutline,
  CloudUploadOutline,
  FormOutline,
  EditOutline,
  FileProtectOutline,
  FileImageOutline,
  FileTextOutline,
  UploadOutline,
  InsertRowAboveOutline,
  TableOutline,
  PieChartOutline,
  LoginOutline,
  RocketOutline,
  PhoneOutline,
  DollarOutline,
  AuditOutline,
  QuestionOutline,
  ChromeOutline,
  RightOutline,
  ReadOutline,
  LockOutline
} from '@ant-design/icons-angular/icons';
import { Role } from 'src/app/theme/shared/components/_helpers/role';

type Direction = 'ltr' | 'rtl' | 'auto';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, CommonModule, RouterModule, NavCollapseComponent, NavGroupComponent, NavItemComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements AfterViewInit, OnInit {
  authenticationService = inject(AuthenticationService);
  private themeService = inject(ThemeService);
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private iconService = inject(IconService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private tokenService = inject(TokenService);

  // After Media 1025 menu Open In Use
  readonly NavCollapsedMob = output();

  // for Compact Menu
  readonly SubmenuCollapse = output();

  // Theme version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  mantisConfig = MantisConfig;
  direction: Direction = 'ltr';
  layout!: string;
  navigations!: NavigationItem[];
  prevDisabled: string;
  nextDisabled: string;
  contentWidth: number;
  wrapperWidth!: number;
  scrollWidth: number;
  windowWidth: number;
  collapseItem!: NavigationItem;
  userProfile: UserProfileDto | null = null;
  isLoading = true;
  error: string | null = null;

  readonly navbarContent = viewChild.required<ElementRef>('navbarContent');
  readonly navbarWrapper = viewChild.required<ElementRef>('navbarWrapper');

  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        DashboardOutline,
        IdcardOutline,
        DatabaseOutline,
        LineChartOutline,
        MessageOutline,
        CalendarOutline,
        CustomerServiceOutline,
        UserOutline,
        ShoppingCartOutline,
        LayoutOutline,
        CreditCardOutline,
        GoldOutline,
        ShareAltOutline,
        CloudUploadOutline,
        FormOutline,
        EditOutline,
        FileProtectOutline,
        FileImageOutline,
        FileTextOutline,
        UploadOutline,
        InsertRowAboveOutline,
        TableOutline,
        PieChartOutline,
        LoginOutline,
        RocketOutline,
        PhoneOutline,
        DollarOutline,
        AuditOutline,
        QuestionOutline,
        ChromeOutline,
        RightOutline,
        ReadOutline,
        LockOutline
      ]
    );
    this.prevDisabled = 'disabled';
    this.nextDisabled = '';
    this.scrollWidth = 0;
    this.contentWidth = 0;
    effect(() => {
      this.isRtlTheme(this.themeService.isRTLMode());
    });
  }

  ngOnInit() {
    this.layout = MantisConfig.layout;
    this.loadUserProfile();
    const currentUser = this.authenticationService.currentUserValue;
    const userRoles =  this.tokenService.getRoles();
    this.navigations = this.filterMenu(NavigationItems, userRoles);
  }

  filterMenu(NavigationItems: NavigationItem[], userRoles: string[], parentRoles: string[] = [Role.Manager]): NavigationItem[] {
    return NavigationItems.map((item) => {
      // If item doesn't have a specific role, inherit roles from parent
      const itemRoles = item.role ? item.role : parentRoles;

      // If item has children, recursively filter them, passing current item's roles as parentRoles
      if (item.children) {
        item.children = this.filterMenu(item.children, userRoles, itemRoles);
      }

      return item; // Return the item whether it is visible or disabled
    });
  }

  // private method
  private isRtlTheme(isRtl: boolean) {
    this.direction = isRtl === true ? 'rtl' : 'ltr';
  }

  // public method
  ngAfterViewInit() {
    if (MantisConfig.layout === 'horizontal') {
      this.contentWidth = this.navbarContent().nativeElement.clientWidth;
      this.wrapperWidth = this.navbarWrapper().nativeElement.clientWidth;
    }
  }

  // Horizontal Menu
  scrollPlus() {
    this.scrollWidth = this.scrollWidth + (this.wrapperWidth - 200);
    if (this.scrollWidth > this.contentWidth - this.wrapperWidth) {
      this.scrollWidth = this.contentWidth - this.wrapperWidth + 200;
      this.nextDisabled = 'disabled';
    }
    this.prevDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  scrollMinus() {
    this.scrollWidth = this.scrollWidth - this.wrapperWidth;
    if (this.scrollWidth < 0) {
      this.scrollWidth = 0;
      this.prevDisabled = 'disabled';
    }
    this.nextDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  fireLeave() {
    const sections = document.querySelectorAll('.coded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.remove('active');
      sections[i].classList.remove('coded-trigger');
    }

    let current_url = this.location.path();
    // eslint-disable-next-line
    // @ts-ignore
    if (this.location['_baseHref']) {
      // eslint-disable-next-line
      // @ts-ignore
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('active');
      }
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        if (MantisConfig.layout === 'vertical') {
          parent.classList.add('coded-trigger');
        }
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        if (MantisConfig.layout === 'vertical') {
          up_parent.classList.add('coded-trigger');
        }
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        if (MantisConfig.layout === 'vertical') {
          last_parent.classList.add('coded-trigger');
        }
        last_parent.classList.add('active');
      }
    }
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

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.pc-sidebar')?.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }

  subMenuCollapse(item: NavigationItem) {
    this.SubmenuCollapse.emit();
    this.collapseItem = item;
  }
}
