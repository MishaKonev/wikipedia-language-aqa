import creds from '../fixtures/creds';
import { english, ukrainian } from '../fixtures/languages';
import { test } from '../pages/testExtender';

const validUser = creds.getCredentials('user');

test.describe('Preferences: interface language', () => {
  test.beforeEach(async ({ loginPage, preferencesPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.login(validUser);
    await loginPage.verifySuccessfulLogin(validUser);
    await preferencesPage.restoreInterfaceLanguage(english);
  });

  test.afterEach(async ({ preferencesPage }) => {
    await preferencesPage.restoreInterfaceLanguage(english);
  });

  test(
    '[I18N-TC-001] Interface switches to the selected language',
    async ({ preferencesPage, basePage }) => {
      await preferencesPage.navigateToPreferences();
      await preferencesPage.openUserProfileTab();
      await preferencesPage.verifyPreferencesLanguage(english);

      await preferencesPage.selectInterfaceLanguage(ukrainian);
      await preferencesPage.savePreferences();
      await preferencesPage.verifyPreferencesSaved(ukrainian);
      await preferencesPage.verifyPreferencesLanguage(ukrainian);

      await basePage.navigateToMainPage();
      await basePage.verifyInterfaceLanguage(ukrainian);
    }
  );
});
