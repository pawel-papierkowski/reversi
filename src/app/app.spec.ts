import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';

import { TranslateService, provideTranslateService, TranslateLoader } from "@ngx-translate/core";
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
  let translateService: TranslateService;

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

    // Reset local storage before every test to avoid pollution
    localStorage.clear();

    fixture = TestBed.createComponent(App);
    translateService = TestBed.inject(TranslateService);
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

  //

  it('should use the language stored in localStorage if it exists', async () => {
    // Arrange: Pre-populate local storage with known language that is not fallback.
    localStorage.setItem('app.language', 'pl');

    // Create a spy to watch what TranslateService does.
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit by calling detectChanges for the first time.
    fixture.detectChanges();

    // Assert: Verify translateService was told to use 'pl'.
    expect(translateUseSpy).toHaveBeenCalledWith('pl');

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repozytorium');
  });

  it('should fallback to en if the language stored in localStorage is unknown', async () => {
    // Arrange: Pre-populate local storage with unknown language.
    localStorage.setItem('app.language', 'ru');

    // Create a spy to watch what TranslateService does.
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit by calling detectChanges for the first time.
    fixture.detectChanges();

    // Assert: Verify translateService was told to use 'en'.
    expect(translateUseSpy).toHaveBeenCalledWith('en');

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repository');
  });

  it('should fallback and set storage if no language is stored', async () => {
    // Arrange: Ensure storage is empty and mock the browser's default language.
    localStorage.removeItem('app.language');
    vi.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit.
    fixture.detectChanges();

    // Assert: Verify 'en' was saved and applied.
    expect(localStorageSpy).toHaveBeenCalledWith('app.language', 'en');
    expect(translateUseSpy).toHaveBeenCalledWith('en');

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repository');
  });
});
