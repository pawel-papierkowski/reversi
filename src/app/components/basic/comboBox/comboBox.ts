import { Component, input, signal, model, computed, effect } from '@angular/core';

import {TranslatePipe} from '@ngx-translate/core';

/**
 * ComboBox component.
 * Serves as replacement for select and option elements since these cannot be styled properly.
 * Variable options expects array of strings or numbers. selectedOption should be value to get/set.
 * Features:
 * - Can choose multiple options.
 * - Can be disabled.
 * - Integration with translate pipeline.
 */
@Component({
  selector: 'combo-box',
  imports: [TranslatePipe],
  templateUrl: './comboBox.html',
  styleUrl: './comboBox.css'
})
export class ComboBoxCmp {
  options = input.required<string[]|number[]>();
  placeholder = input('comboBox.placeholder'); // if nothing is selected, this will be shown
  langPrefix = input('');
  disabled = input(false);

  isOpen = signal(false); // indicates visibility of drawdown list of options
  arrowClass = computed(() => ({ open: this.isOpen() }));
  selectedOption = model<string|number|null>(null); // null means nothing is selected yet

  constructor() {
    effect(() => { // react on change in disabled
      if (this.disabled()) this.isOpen.set(false); // autoclose opened list
    });
  }

  /**
   * Opens drawdown list with options.
   */
  openList() {
    if (this.disabled()) return; // do not open list with options
    this.isOpen.set(!this.isOpen());
  }

  /**
   * React to click on option.
   * @param option Chosen option.
   */
  selectOption(option: string|number) {
    if (this.disabled()) return; // do nothing
    this.selectedOption.update(() => option);
    this.isOpen.update(() => false);
  }

  /**
   * Resolves CSS class of entire combobox.
   * @returns Array of CSS class names.
   */
  resolveMainClass() : string[] {
    let classes : string[] = [];
    classes.push('combobox');
    if (this.disabled()) classes.push('disabled');
    return classes;
  }
}
