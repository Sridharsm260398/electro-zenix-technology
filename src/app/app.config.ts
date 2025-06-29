import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Angular Material
import { provideAnimations } from '@angular/platform-browser/animations';

// Ng-Zorro
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { en_US as ngZorroLang } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

// Ng-Zorro icons (add more if needed)
import {
  FacebookFill,
  GoogleOutline,
  TwitterOutline,
  GithubOutline,
  FacebookOutline,
  LinkedinOutline,
  GooglePlusOutline,
} from '@ant-design/icons-angular/icons';

import { IconDefinition } from '@ant-design/icons-angular';

const icons: IconDefinition[] = [
  FacebookFill,
  GoogleOutline,
  TwitterOutline,
  GithubOutline,
  FacebookOutline,
  LinkedinOutline,
  GooglePlusOutline,
  HomeOutline,
  MailOutline,
  PhoneOutline,
  CreditCardOutline,
];
import {
  HomeOutline,
  MailOutline,
  PhoneOutline,
  CreditCardOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    { provide: NZ_I18N, useValue: ngZorroLang },
    { provide: NZ_ICONS, useValue: icons },
  ],
};
