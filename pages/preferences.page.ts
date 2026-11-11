import { Locator, Page, expect, test } from '@playwright/test';
import { InterfaceLanguage } from '../interfaces/interfaces';
import BasePage from './basePage.page';

export default class PreferencesPage extends BasePage {
  private readonly preferencesForm: {
    heading: Locator;
    userProfileTab: Locator;
    internationalisationSection: Locator;
    internationalisationTitle: Locator;
    languageInput: Locator;
    languageSelect: Locator;
    saveButton: Locator;
    tab: (tabName: string) => Locator;
    languageOption: (optionLabel: string) => Locator;
    savedMessage: (message: string) => Locator;
  };

  constructor(page: Page) {
    super(page);

    this.preferencesForm = {
      heading: this.page.getByRole('heading', { level: 1 }),
      userProfileTab: this.page.getByRole('tab', { name: 'User profile' }),
      internationalisationSection: this.page.locator('#mw-prefsection-personal-i18n'),
      internationalisationTitle: this.page.locator('#mw-prefsection-personal-i18n > legend'),
      // The Codex lookup replaces the native select, which stays hidden and is what gets submitted
      languageInput: this.page.locator('#mw-prefsection-personal-i18n').getByRole('combobox'),
      languageSelect: this.page.locator('select#mw-input-wplanguage'),
      // The button label is translated, so restoring the language cannot find it by name
      saveButton: this.page.locator('#prefcontrol button[type="submit"]'),
      tab: (tabName: string) => this.page.getByRole('tab', { name: tabName }),
      languageOption: (optionLabel: string) =>
        this.page.getByRole('option', { name: optionLabel, exact: true }),
      savedMessage: (message: string) => this.page.getByText(message),
    };
  }

  /* Actions */

  async navigateToPreferences() {
    await test.step('Navigate to Preferences', async () => {
      await this.page.goto('/wiki/Special:Preferences');
      await expect(
        this.preferencesForm.languageInput,
        'The preferences form must be loaded'
      ).toBeAttached();
    });
  }

  async openUserProfileTab() {
    await test.step('Open "User profile" tab', async () => {
      await this.preferencesForm.userProfileTab.click();
      await expect(
        this.preferencesForm.internationalisationSection,
        'The "User profile" tab must open'
      ).toBeVisible();
    });
  }

  async selectInterfaceLanguage(language: InterfaceLanguage) {
    await test.step(`Select interface language "${language.optionLabel}"`, async () => {
      const option = this.preferencesForm.languageOption(language.optionLabel);

      // The lookup clears its text right after it gets focus and can drop the first input,
      // so the search is repeated until the option is listed
      await expect(async () => {
        await this.preferencesForm.languageInput.click();
        await this.preferencesForm.languageInput.fill(language.searchText);
        await expect(option).toBeVisible({ timeout: 2_000 });
      }).toPass();

      await option.click();
      await expect(
        this.preferencesForm.languageSelect,
        `"${language.optionLabel}" must be selected`
      ).toHaveValue(language.code);
    });
  }

  async savePreferences() {
    await test.step('Save preferences', async () => {
      const saved = this.page.waitForResponse(
        (response) =>
          response.url().includes('Special:Preferences') && response.request().method() === 'POST'
      );
      await this.preferencesForm.saveButton.click();
      await saved;
    });
  }

  async restoreInterfaceLanguage(language: InterfaceLanguage) {
    await test.step(`Restore interface language "${language.optionLabel}"`, async () => {
      await this.page.goto('/wiki/Special:Preferences#mw-prefsection-personal');
      // Selecting the current language changes nothing and leaves Save disabled,
      // e.g. after a test that failed before saving
      if ((await this.preferencesForm.languageSelect.inputValue()) === language.code) return;

      await this.selectInterfaceLanguage(language);
      await this.savePreferences();
      await expect(
        this.page.locator('html'),
        `The account must be back to "${language.optionLabel}"`
      ).toHaveAttribute('lang', language.code);
    });
  }

  /* Verifications */

  async verifyPreferencesSaved(language: InterfaceLanguage) {
    await test.step('Verify preferences are saved', async () => {
      await expect(
        this.preferencesForm.savedMessage(language.ui.preferencesSaved),
        'Saving must be confirmed in the new interface language'
      ).toBeVisible();
    });
  }

  async verifyPreferencesLanguage(language: InterfaceLanguage) {
    await test.step(`Verify Preferences are shown in "${language.optionLabel}"`, async () => {
      await expect(
        this.page.locator('html'),
        `The page must be rendered in "${language.code}"`
      ).toHaveAttribute('lang', language.code);

      await expect
        .soft(this.preferencesForm.heading, 'The page heading must be translated')
        .toHaveText(language.ui.preferencesHeading);
      await expect
        .soft(
          this.preferencesForm.tab(language.ui.userProfileTab),
          'The "User profile" tab must be translated'
        )
        .toHaveAttribute('aria-selected', 'true');
      await expect
        .soft(
          this.preferencesForm.internationalisationTitle,
          'The "Internationalisation" section must be translated'
        )
        .toHaveText(language.ui.internationalisationSection);
      expect(
        test.info().errors,
        `Preferences must be shown in "${language.optionLabel}"`
      ).toHaveLength(0);
    });
  }
}
