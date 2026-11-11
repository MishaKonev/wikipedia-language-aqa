import { test as base } from '@playwright/test';
import BasePage from './basePage.page';
import LoginPage from './login.page';
import PreferencesPage from './preferences.page';

type MyPages = {
  basePage: BasePage;
  loginPage: LoginPage;
  preferencesPage: PreferencesPage;
};

export const test = base.extend<MyPages>({
  basePage: async ({ page }, use) => await use(new BasePage(page)),
  loginPage: async ({ page }, use) => await use(new LoginPage(page)),
  preferencesPage: async ({ page }, use) => await use(new PreferencesPage(page)),
});

export { expect } from '@playwright/test';
