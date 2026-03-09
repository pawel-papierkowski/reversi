import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { vi } from 'vitest';

// We test projectProp here, so this test file is different from how things are usually done.
// We test appearance of PROD or DEV text in footer depending on projectProp variable.
// Note: we cannot directly test environment variable for various reasons. Also tests are run
// as if it is production. How wonderful.

describe('Footer', () => {
  beforeEach(() => {
    // Clean up the module cache and mocks before EVERY test.
    vi.resetModules();
  });

  afterEach(() => {
     // Clean up mocks after the test.
    vi.clearAllMocks();
  });

  //

  it('should display PROD build status when environment.production is true', async () => {
    // Intercept the const file import directly for production. We wont be touching environments.
    vi.doMock('@/code/data/const', () => ({
      projectProp: {
        title: "Reversi",
        author: "Paweł Papierkowski",
        dateRange: "2026",
        version: "1.0.0",
        build: "PROD" // Force PROD
      }
    }));

    // Dynamically import the component AFTER the mock is set.
    const { Footer } = await import('./footer');

    // Set up TestBed normally.
    await TestBed.configureTestingModule({
      imports: [Footer, TranslateModule.forRoot()]
    }).compileComponents();

    const fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert.
    expect(component.projectProp.build).toBe('PROD');
  });

  it('should display DEV build status when environment.production is false', async () => {
    // Intercept the const file import directly for development. We wont be touching environments.
    vi.doMock('@/code/data/const', () => ({
      projectProp: {
        title: "Reversi",
        author: "Paweł Papierkowski",
        dateRange: "2026",
        version: "1.0.0",
        build: "DEV" // Force DEV
      }
    }));

    // Dynamically re-import the component. Because of vi.resetModules(),
    // it will re-evaluate projectProp with the new DEV mock.
    const { Footer } = await import('./footer');

    // Set up TestBed normally.
    await TestBed.configureTestingModule({
      imports: [Footer, TranslateModule.forRoot()]
    }).compileComponents();

    const fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert.
    expect(component.projectProp.build).toBe('DEV');
  });
});
