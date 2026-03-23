import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateService } from "@ngx-translate/core";

import { storageKeys } from "@/code/data/gameConst";

import { setupTestBedTranslate } from './app.test-setup';

import { App } from '../app';

describe('App (language)', () => {
  let fixture: ComponentFixture<App>;
  let translateService: TranslateService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBedTranslate([]);
    translateService = TestBed.inject(TranslateService);
  });

  // //////////////////////////////////////////////////////////////////////////
  // Language handling.

  it('should use the language stored in localStorage if it exists', async () => {
    // Arrange: Pre-populate local storage with known language that is not fallback.
    localStorage.setItem(storageKeys.language, 'pl');

    // Create a spy to watch what TranslateService does.
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit by calling detectChanges for the first time.
    fixture.detectChanges();

    // Assert: Verify translateService was told to use 'pl'.
    expect(translateUseSpy).toHaveBeenCalledWith('pl');

    // Assert: Language used on page is actually correct.
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repozytorium');
  });

  it('should fallback to en if the language stored in localStorage is unknown', async () => {
    // Arrange: Pre-populate local storage with unknown language.
    localStorage.setItem(storageKeys.language, 'ru');

    // Create a spy to watch what TranslateService does.
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit by calling detectChanges for the first time.
    fixture.detectChanges();

    // Assert: Verify translateService was told to use 'en'.
    expect(translateUseSpy).toHaveBeenCalledWith('en');

    // Assert: Language used on page is actually correct.
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repository');
  });

  it('should fallback and set storage if no language is stored', async () => {
    // Arrange: Ensure storage is empty and mock the browser's default language.
    localStorage.removeItem(storageKeys.language);
    vi.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Act: Trigger ngOnInit.
    fixture.detectChanges();

    // Assert: Verify 'en' was saved and applied.
    expect(localStorageSpy).toHaveBeenCalledWith(storageKeys.language, 'en');
    expect(translateUseSpy).toHaveBeenCalledWith('en');

    // Assert: Language used on page is actually correct.
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent).toContain('Repository');
  });
});
