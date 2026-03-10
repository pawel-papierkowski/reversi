import { Component } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

import {TranslateService, TranslatePipe} from '@ngx-translate/core';

import { languages } from "@/code/data/const";

@Component({
  selector: 'app-header',
  imports: [ TranslatePipe, MatTooltip ],
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
