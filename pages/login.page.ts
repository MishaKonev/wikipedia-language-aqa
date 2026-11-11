import { Locator, Page, expect, test } from '@playwright/test';
import { User } from '../interfaces/interfaces';
import BasePage from './basePage.page';

export default class LoginPage extends BasePage {
  private readonly loginForm: {
    usernameInput: Locator;
    passwordInput: Locator;
    loginButton: Locator;
  };

  constructor(page: Page) {
    super(page);

    this.loginForm = {
      usernameInput: this.page.getByLabel('Username'),
      passwordInput: this.page.getByLabel('Password'),
      loginButton: this.page.getByRole('button', { name: 'Log in' }),
    };
  }

  /* Actions */

  async navigateToLoginPage() {
    await test.step('Navigate to login page', async () => {
      // auth.wikimedia.org now and then answers the redirect with "invalid returnUrlToken"
      // instead of the form; a new redirect gets a new token
      await expect(async () => {
        await this.page.goto('/wiki/Special:UserLogin?returnto=Main_Page');
        await expect(this.loginForm.usernameInput).toBeVisible({ timeout: 5_000 });
      }, 'The login form must be shown').toPass({ timeout: 45_000 });
    });
  }

  async login(user: User) {
    await test.step(`Login as ${user.username}`, async () => {
      await this.loginForm.usernameInput.fill(user.username);
      await this.loginForm.passwordInput.fill(user.password);
      await this.loginForm.loginButton.click();
      // The form lives on auth.wikimedia.org, and the page it returns to is not always "returnto",
      // so the step waits only until the login pages are left
      await this.page.waitForURL(
        (url) => !url.hostname.startsWith('auth.') && !/Special:(User|Central)Login/.test(url.href)
      );
    });
  }

  /* Verifications */

  async verifySuccessfulLogin(user: User) {
    await test.step('Verify successful login', async () => {
      await expect(
        this.header.userPageLink,
        `${user.username} must be logged in`
      ).toHaveText(user.username);
    });
  }
}
