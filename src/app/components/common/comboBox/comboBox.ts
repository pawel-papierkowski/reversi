import { Component, input, signal, model, computed } from '@angular/core';

import {TranslatePipe} from '@ngx-translate/core';

/**
 * ComboBox component.
 * Serves as replacement for select and option elements since these cannot be styled properly.
 */
@Component({
  selector: 'combo-box',
  imports: [TranslatePipe],
  templateUrl: './comboBox.html',
  styleUrl: './comboBox.css'
})
export class ComboBox {
  options = input<string[]|number[]>();
  placeholder = input('comboBox.placeholder'); // if nothing is selected, this will be shown
  langPrefix = input('');

  isOpen = signal(false);
  arrowClass = computed(() => ({ open: this.isOpen() }));
  selectedOption = model<string|number|null>(null); // null means nothing is selected yet

  selectOption = (option: string|number) => {
    this.selectedOption.update(() => option);
    this.isOpen.update(() => false);
  };
}
