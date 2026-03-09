import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {TranslateService} from "@ngx-translate/core";

import { languages, fallbackLang } from "@/code/data/const";

import { Header } from '@/components/app/header/header';
import { Footer } from '@/components/app/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('reversi-angular');

  constructor(private translateService: TranslateService) {
  }

  async ngOnInit() {
    this.setupLang();
  }

  //

  /** Setup language-related stuff. */
  private setupLang() {
    this.translateService.setFallbackLang(fallbackLang);
    const storedLang = localStorage.getItem('app.language'); // get current language from storage
    if (storedLang) { // stored language exists: just use it
      const currLang = this.verifyLang(storedLang) ? storedLang : fallbackLang;
      this.translateService.use(currLang);
    } else { // stored language does not exist: resolve current language, save to storage and use it
      const browserLang = this.translateService.getBrowserLang() || fallbackLang;
       // if unknown language, fall back to english
      const currLang = this.verifyLang(browserLang) ? browserLang : fallbackLang;
      console.info(currLang);
      localStorage.setItem('app.language', currLang);
      this.translateService.use(currLang);
    }
  }

  /**
   * Check if we know language with given code.
   * @param currLang Current language to check.
   * @returns True if given language is known, otherwise false.
   */
  private verifyLang(currLang: string): boolean {
    const index = languages.findIndex(lang => lang === currLang);
    return index !== -1;
  }
}
