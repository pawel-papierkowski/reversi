import { ComponentFixture } from '@angular/core/testing';

import { setupTestBed } from './app.test-setup';

import { App } from '../app';

describe('App (general)', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBed([]);
  });

  // //////////////////////////////////////////////////////////////////////////
  // General.

  it('should create the app', () => {
    // Sanity check: app actually exists.
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    await fixture.whenStable();
    // Check title only when everything is rendered properly.
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('app.title');
    // Note no translation was provided, so we have 'app.title' intstead of 'Reversi'.
    // This is correct result.
  });
});
