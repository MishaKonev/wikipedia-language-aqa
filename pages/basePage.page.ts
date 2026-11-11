import { Locator, Page, expect, test } from '@playwright/test';
import { InterfaceLanguage } from '../interfaces/interfaces';

export default class BasePage {
  protected readonly page: Page;

  /* Header — MediaWiki portlet ids stay the same in every language, link names do not */
  protected readonly header: {
    userPageLink: Locator;
    readTab: Locator;
    preferencesLink: Locator;
    logOutLink: Locator;
  };

  constructor(page: Page) {
    this.page = page;

    this.header = {
      userPageLink: this.page.locator('#pt-userpage-2'),
      readTab: this.page.locator('#ca-view'),
      preferencesLink: this.page.locator('#pt-preferences'),
      logOutLink: this.page.locator('#pt-logout'),
    };
  }

  /* Actions */

  async navigateToMainPage() {
    await test.step('Navigate to Main Page', async () => {
      await this.page.goto('/wiki/Main_Page');
    });
  }

  /* Verifications */

  async verifyInterfaceLanguage(language: InterfaceLanguage) {
    await test.step(`Verify the interface is shown in "${language.optionLabel}"`, async () => {
      await expect(
        this.page.locator('html'),
        `The page must be rendered in "${language.code}"`
      ).toHaveAttribute('lang', language.code);

      await expect
        .soft(this.header.readTab, 'The "Read" tab must be translated')
        .toHaveText(language.ui.readTab);
      await expect
        .soft(this.header.preferencesLink, 'The "Preferences" link must be translated')
        .toHaveText(language.ui.preferencesHeading);
      await expect
        .soft(this.header.logOutLink, 'The "Log out" link must be translated')
        .toHaveText(language.ui.logOut);
      expect(
        test.info().errors,
        `Page navigation must be shown in "${language.optionLabel}"`
      ).toHaveLength(0);
    });
  }
}
