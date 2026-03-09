import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { MainMenuOptions } from './mainMenuOptions';
import { GameStateService } from '@/code/services/gameState.service';

// Create a mock service to safely observe the settings state
class MockGameStateService {
  // We recreate the signal structure your component expects
  gameState = signal({
    settings: {
      mode: 1,       // EnMode.HumanVsAi
      whoFirst: 0,   // EnPlayerType.Human
      difficulty: 0, // EnDifficulty.Easy
      boardSize: 8   // 8x8 board
    }
  });
}

describe('MainMenuOptions', () => {
  let fixture: ComponentFixture<MainMenuOptions>;
  let gameStateService: MockGameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainMenuOptions,
        TranslateModule.forRoot() // Dummy translation module so TranslatePipe works.
      ],
      providers: [
        // Inject our mock instead of the real service
        { provide: GameStateService, useClass: MockGameStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainMenuOptions);

    // Grab a reference to the mocked service so we can assert against it later.
    gameStateService = TestBed.inject(GameStateService) as unknown as MockGameStateService;

    fixture.detectChanges(); // Initial DOM render.
  });

  /**
   * Helper function to simulate a user changing a combobox selection.
   * @param comboboxId The HTML id of the combo-box (e.g., 'mode', 'difficulty')
   * @param optionIndex The 0-based index of the option to click
   */
  function selectComboboxOption(comboboxId: string, optionIndex: number) {
    const compiled = fixture.nativeElement as HTMLElement;
    const combobox = compiled.querySelector(`combo-box#${comboboxId}`) as HTMLElement;

    // Step 1: Click the selected area to open the dropdown.
    const selectedDiv = combobox.querySelector('.selected') as HTMLElement;
    selectedDiv.click();

    // We MUST trigger change detection here so the @if (isOpen()) evaluates to true
    // and renders the .option elements in the DOM.
    fixture.detectChanges();

    // Step 2: Find the newly rendered options and click the desired one.
    const options = combobox.querySelectorAll('.option');
    const targetOption = options[optionIndex] as HTMLElement;
    targetOption.click();

    // Trigger change detection again to update the [(selectedOption)] binding.
    fixture.detectChanges();
  }

  //

  it('should update gameState settings when comboboxes are changed', () => {
    // Act: Simulate a user changing the settings.
    // Index 0 for mode is HumanVsHuman (enum value 0)
    selectComboboxOption('mode', 0);
    // Index 1 for whoFirst is AI (enum value 1)
    selectComboboxOption('whoFirst', 1);
    // Index 2 for difficulty is Hard (enum value 2).
    selectComboboxOption('difficulty', 2);
    // The fourth board size in gameConfig.boardSizes is 10.
    selectComboboxOption('boardSize', 3);

    // Assert: Verify the two-way binding correctly mutated our service state
    const currentSettings = gameStateService.gameState().settings;

    expect(currentSettings.mode).toBe(0);
    expect(currentSettings.whoFirst).toBe(1);
    expect(currentSettings.difficulty).toBe(2);
    expect(currentSettings.boardSize).toBe(10);
  });
});
