export interface User {
  username: string;
  password: string;
}

export interface InterfaceLanguage {
  code: string;
  searchText: string;
  optionLabel: string;
  ui: {
    preferencesHeading: string;
    userProfileTab: string;
    internationalisationSection: string;
    preferencesSaved: string;
    readTab: string;
    logOut: string;
  };
}
