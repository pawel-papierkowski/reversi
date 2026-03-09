import { TestBed } from '@angular/core/testing';
import { App } from './app';

import { provideTranslateService, TranslateLoader } from "@ngx-translate/core";
import { Observable, of } from 'rxjs';

import en from '../../public/i18n/en.json';
import pl from '../../public/i18n/pl.json';

// Needed so ngx-translate works in unit tests:
// we manually load language files instead of http serving them. Compare to app.config.ts.
class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const translations: Record<string, any> = { en, pl };
    return of(translations[lang] ?? {});
  }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [ // providers need to be specified explicitly, as unit tests do not use app.config.ts
        provideTranslateService({
          lang: 'en',
          fallbackLang: 'en',
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader }
        }),
      ]
    }).compileComponents();
  });

  //

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // sanity check
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reversi');
  });
});
