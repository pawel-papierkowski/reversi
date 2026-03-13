import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FooterCmp } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<FooterCmp>;
  let component: FooterCmp;

  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          FooterCmp,
          TranslateModule.forRoot() // Dummy translation module so TranslatePipe works.
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(FooterCmp);
      component = fixture.componentInstance;
  });

  //

  // Note we cannot handle environment vars directly in unit tests for various reasons.
  // So we just check if projectProp.build is properly shown.
  // projectProp.build is initialized in const.ts: build: environment.production ? "PROD" : "DEV",
  // Ideally we should somehow set type of environment in unit tests (either development or production),
  // but so far I failed to set it up so it works in unit tests.
  // That terminal-run tests and IDE-run tests also execute in different way does not help at all.

  it('should display PROD build status in the template', async () => {
    // Override the component property directly.
    component.projectProp = {
      title: "Reversi",
      author: "Paweł Papierkowski",
      dateRange: "2026",
      version: "1.0.0",
      build: "PROD" // force PROD
    };

    // Trigger change detection so the HTML renders the overridden data.
    fixture.detectChanges();

    // Assert the DOM output (which proves the component works).
    const compiled = fixture.nativeElement as HTMLElement;
    const textContent = compiled.querySelector('p:nth-of-type(2)')?.textContent;
    expect(textContent).toContain('PROD');
  });

  it('should display DEV build status in the template', async () => {
    // Override the component property directly.
    component.projectProp = {
      title: "Reversi",
      author: "Paweł Papierkowski",
      dateRange: "2026",
      version: "1.0.0",
      build: "DEV" // force DEV
    };

    // Trigger change detection so the HTML renders the overridden data.
    fixture.detectChanges();

    // Assert the DOM output (which proves the component works).
    const compiled = fixture.nativeElement as HTMLElement;
    const textContent = compiled.querySelector('p:nth-of-type(2)')?.textContent;
    expect(textContent).toContain('DEV');
  });
});
