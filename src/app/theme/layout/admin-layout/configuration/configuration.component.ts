// angular import
import { Component, OnInit, Renderer2, output, inject } from '@angular/core';
import { DOCUMENT, Location, LocationStrategy } from '@angular/common';

// project import
import { MantisConfig } from 'src/app/app-config';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

// icons
import { IconService } from '@ant-design/icons-angular';
import { CloseCircleOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-configuration',
  imports: [SharedModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private themeService = inject(ThemeService);
  private renderer = inject(Renderer2);
  private iconService = inject(IconService);
  private document = inject<Document>(DOCUMENT);

  // public props
  readonly Customize = output();

  isCollapsed = false;
  layoutIsCollapsed = false;
  presetIsCollapsed = false;
  boxLayoutIsCollapsed = false;
  fontIsCollapsed = false;

  bodyColor!: string; // mantis Customizes
  rtlLayout!: boolean; // rtl type
  layoutType!: boolean; // layout type
  boxLayout!: boolean; // container
  setFontFamily!: string; // font-family type.
  resetLayoutType!: string;
  direction: string = 'ltr';

  // constructor
  constructor() {
    this.setThemeLayout();
    this.iconService.addIcon(...[CloseCircleOutline]);
  }

  // life cycle event
  ngOnInit() {
    this.layoutType = MantisConfig.isDarkMode;
    this.setDarkLayout(this.layoutType);
    this.bodyColor = MantisConfig.theme_color;
    this.SetBodyColor(this.bodyColor);
    this.rtlLayout = MantisConfig.isRtlLayout;
    this.setLayout(this.rtlLayout);
    this.boxLayout = MantisConfig.isBox_container;
    this.setBoxContainer(this.boxLayout);
    this.setFontFamily = MantisConfig.font_family;
    this.fontFamily(this.setFontFamily);
  }

  // public method

  // change main layout
  setColorLayout(layout: string) {
    if (layout === 'reset') {
      this.ngOnInit();
    }
  }

  setThemeLayout() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    switch (current_url) {
      case baseHref + '/layout/vertical':
        MantisConfig.layout = 'vertical';
        break;

      case baseHref + '/layout/compact':
        MantisConfig.layout = 'compact';
        break;

      case baseHref + '/layout/horizontal':
        MantisConfig.layout = 'horizontal';
        MantisConfig.isRtlLayout = false;
        break;
    }
  }

  setDarkLayout(isDark: boolean) {
    if (isDark) {
      document.querySelector('body')?.classList.add('mantis-dark');
      document.querySelector('html')?.classList.add('dark');
      this.layoutType = true;
    } else {
      document.querySelector('body')?.classList.remove('mantis-dark');
      document.querySelector('html')?.classList.remove('dark');
      this.layoutType = false;
    }
    this.themeService.isDarkMode.set(this.layoutType);
  }

  setBoxContainer(isContainer: boolean) {
    if (isContainer) {
      this.document.querySelector('.coded-content')?.classList.add('container');
      this.boxLayout = true;
    } else {
      this.document.querySelector('.coded-content')?.classList.remove('container');
      this.boxLayout = false;
    }
    this.themeService.isContainerMode.set(this.boxLayout);
  }

  setLayout(isRTL: boolean) {
    if (isRTL) {
      this.renderer.addClass(document.body, 'mantis-rtl');
      this.renderer.removeClass(document.body, 'mantis-ltr');
      this.rtlLayout = true;
    } else {
      this.renderer.removeClass(document.body, 'mantis-rtl');
      this.renderer.addClass(document.body, 'mantis-ltr');
      this.rtlLayout = false;
    }
    this.direction = isRTL === true ? 'rtl' : 'ltr';
    this.themeService.isRTLMode.set(this.rtlLayout);
  }

  SetBodyColor(background: string) {
    this.bodyColor = background;
    const body = this.document.querySelector('body');
    for (let i = 1; i <= 9; i++) {
      body?.part.remove(`preset-${i}`);
    }
    body?.part.add(background);
    this.themeService.customsTheme.set(background);
  }

  fontFamily(fontStyle: string) {
    this.setFontFamily = fontStyle;
    this.renderer.removeClass(document.body, 'public-sans');
    this.renderer.removeClass(document.body, 'Roboto');
    this.renderer.removeClass(document.body, 'Poppins');
    this.renderer.removeClass(document.body, 'Poppins');
    this.renderer.addClass(document.body, fontStyle);
  }
}
