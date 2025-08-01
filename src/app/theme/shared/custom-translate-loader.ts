// project import
import en from '../../../assets/i18n/en.json';
import fr from '../../../assets/i18n/fr.json';

// third party
import { TranslateLoader } from '@ngx-translate/core';

// angular import
import { of } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  // public method
  getTranslation(lang: string) {
    if (lang === 'fr') {
      return of(fr);
    }
    return of(en);
  }
}
