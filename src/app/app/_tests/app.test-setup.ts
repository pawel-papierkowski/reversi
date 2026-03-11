import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslateModule, provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { routes } from './../app.routes';
import { App } from './../app';

import en from '../../../../public/i18n/en.json';
import pl from '../../../../public/i18n/pl.json';

/**
 * Create test bed for App with mock translation.
 * @param mockProviders Mock providers.
 * @returns Fixture from test bed.
 */
export async function setupTestBed(mockProviders: Provider[] = []) {
  await TestBed.configureTestingModule({
    imports: [
      App,
      TranslateModule.forRoot(), // Dummy translation module so TranslatePipe works.
    ],
    providers: [
      provideRouter(routes),
      ...mockProviders, // Allow specific tests to inject their own mocks.
    ]
  }).compileComponents();

  return TestBed.createComponent(App);
}

//

// Needed so ngx-translate works in unit tests:
// we manually load language files instead of http serving them. Compare to app.config.ts.
class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const translations: Record<string, any> = { en, pl };
    return of(translations[lang] ?? {});
  }
}

/**
 * Create test bed for App with real translation. Use only when real translations are needed.
 * @param mockProviders Mock providers.
 * @returns Fixture from test bed.
 */
export async function setupTestBedTranslate(mockProviders: Provider[] = []) {
  await TestBed.configureTestingModule({
    imports: [
      App,
    ],
    providers: [
      provideRouter(routes),
      provideTranslateService({ // use real translations
        lang: 'en',
        fallbackLang: 'en',
        loader: { provide: TranslateLoader, useClass: StaticTranslateLoader }
      }),
      ...mockProviders, // Allow specific tests to inject their own mocks.
    ]
  }).compileComponents();

  return TestBed.createComponent(App);
}
