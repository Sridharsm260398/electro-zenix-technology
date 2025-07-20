import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Angular Material
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';

// Ng-Zorro
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { en_US as ngZorroLang } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

// Ng-Zorro icons (add more if needed)
import {
  HomeOutline,
  MailOutline,
  PhoneOutline,
  CreditCardOutline,
  EditOutline,
  DeleteOutline,
  ControlOutline,
  SafetyOutline,
  FacebookFill,
  GoogleOutline,
  TwitterOutline,
  GithubOutline,
  FacebookOutline,
  LinkedinOutline,
  GooglePlusOutline,
  UserAddOutline,
  DownloadOutline,
  DashboardOutline,
  UserOutline,
  SettingOutline,
  LogoutOutline,
  ClockCircleOutline,
  TeamOutline,
  FileAddFill,
  FileFill,
  FileAddOutline,
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
  EditOutline,
  DeleteOutline,
  UserAddOutline,
  DownloadOutline,
  DashboardOutline,
  UserOutline,
  SettingOutline,
  LogoutOutline,
  ClockCircleOutline,
  TeamOutline,
  ControlOutline,
  SafetyOutline,
  FileAddFill,
  FileFill,
  FileAddOutline,
];
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LoadingInterceptor } from './shared/components/interceptors/loading.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    //provideHttpClient(),
    importProvidersFrom(
      BrowserModule,
      HttpClient,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      //NoopAnimationsModule
      NgxSpinnerModule.forRoot({ type: 'ball-spin-clockwise' })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),

    { provide: NZ_I18N, useValue: ngZorroLang },
    { provide: NZ_ICONS, useValue: icons },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
};
