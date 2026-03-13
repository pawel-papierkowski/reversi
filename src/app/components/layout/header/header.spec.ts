import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { HeaderCmp } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<HeaderCmp>;
  let component: HeaderCmp;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderCmp,
        TranslateModule.forRoot() // Dummy translation module so TranslatePipe works.
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderCmp);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    fixture.detectChanges(); // Initial DOM render.
  });

  //

  it('should change language and update local storage when a flag is clicked', () => {
    // Spy on local storage and translation service. We will know if they were called and with what arguments.
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const translateUseSpy = vi.spyOn(translateService, 'use');

    // Find all flags in the DOM.
    const compiled = fixture.nativeElement as HTMLElement;
    const flags = compiled.querySelectorAll('.flag');

    // Sanity check: flags are present.
    expect(flags.length).toBe(component.languages.length);
    // There are two languages: 'en' and 'pl', in that order.
    expect(flags.length).toBeGreaterThanOrEqual(2);

    // Get and click the SECOND flag.
    // Why? First one is english, by default webpage picks 'en' so clicking english would do nothing.
    const desiredFlag = flags[1] as HTMLElement;
    desiredFlag.click(); // emulate clicking this element by user in browser

    // Assert side effects
    const expectedLanguage = component.languages[1];
    expect(expectedLanguage).toBe('pl');
    expect(localStorageSpy).toHaveBeenCalledWith('app.language', expectedLanguage);
    expect(translateUseSpy).toHaveBeenCalledWith(expectedLanguage);
  });
});
