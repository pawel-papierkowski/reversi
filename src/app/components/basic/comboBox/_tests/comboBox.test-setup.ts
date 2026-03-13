import { ComponentFixture } from '@angular/core/testing';

/**
 * Simulate a user changing a combobox selection. Works with disabled combobox.
 * @param fixture Fixture that contains combobox.
 * @param comboboxId The data-testid of the combo-box.
 * @param optionIndex The 0-based index of the option to click.
 */
export function selectComboboxOption(fixture: ComponentFixture<any>, comboboxId: string, optionIndex: number) {
  const compiled = fixture.nativeElement as HTMLElement;
  const combobox = compiled.querySelector(`[data-testid="${comboboxId}"]`) as HTMLElement;

  // Click the selected area to open the dropdown.
  const selectedDiv = combobox.querySelector('.selected') as HTMLElement;
  selectedDiv.click();

  // We MUST trigger change detection here so the @if (isOpen()) evaluates to true
  // and renders the .option elements in the DOM.
  fixture.detectChanges();

  // Find the newly rendered options and click the desired one.
  const options = combobox.querySelectorAll('.option');
  const targetOption = options[optionIndex] as HTMLElement;
  targetOption?.click(); // if combobox is disabled, targetOption will be undefined, just move on

  // Trigger change detection again to update the [(selectedOption)] binding.
  fixture.detectChanges();
}
