import { TestBed, ComponentFixture } from '@angular/core/testing';
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
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        // providers need to be specified explicitly, as unit tests do not use app.config.ts
        provideTranslateService({ // use real translations
          lang: 'en',
          fallbackLang: 'en',
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader }
        }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
  });

  //

  it('should create the app', () => {
    // Sanity check: app actually exists.
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    await fixture.whenStable();
    // Check title only when everything is rendered properly.
    // Note we verify actual translated text.
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reversi');
    // Dummy translator would have 'app.title' intstead of 'Reversi'.
  });
});
