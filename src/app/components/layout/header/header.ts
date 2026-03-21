import { Component } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

import {TranslateService, TranslatePipe} from '@ngx-translate/core';

import { languages, storageKeys } from "@/code/data/const";

@Component({
  selector: 'app-header',
  imports: [ TranslatePipe, MatTooltip ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderCmp {
  languages = languages;

  constructor(private translateService: TranslateService) {
  }

  /**
   * Change language.
   * @param language Selected language.
   */
  selectLang(language: string) {
    localStorage.setItem(storageKeys.language, language);
    this.translateService.use(language);
  }
}
