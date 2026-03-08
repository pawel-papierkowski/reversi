import { Component, signal, effect } from '@angular/core';

import {TranslateService} from "@ngx-translate/core";
import {TranslatePipe} from '@ngx-translate/core';

import { languages, fallbackLang } from "@/code/data/const";

@Component({
  selector: 'app-header',
  imports: [ TranslatePipe ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  languages = languages;

  constructor(private translateService: TranslateService) {
  }

  /**
   * Change language.
   * @param language Selected language.
   */
  selectLang(language: string) {
    localStorage.setItem('app.language', language);
    this.translateService.use(language);
  }
}
