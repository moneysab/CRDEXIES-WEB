export class MantisConfig {
  static layout = 'vertical'; // vertical, horizontal, compact
  static isCollapseMenu = false;
  static theme_color = 'preset-1'; // present-1, present-2, present-3, present-4, present-5, present-6, present-7, preset-8, preset-9
  static isRtlLayout = false; // false, true
  static isDarkMode = false; // false, true    Dark and light
  static isBox_container = false; // false, true
  static font_family = 'public-sans'; // public-sans, Roboto, Poppins, Inter
  static i18n = this.detectBrowserLanguage(); 

  private static detectBrowserLanguage(): string {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    const supportedLangs = ['en', 'fr'];
    
    const baseLang = browserLang.split('-')[0].toLowerCase();
    if (supportedLangs.includes(baseLang)) {
      return baseLang;
    }
    return 'en';
  }
}
