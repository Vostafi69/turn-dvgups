const LocalStorage = require("../utils/localstorage");

function themeSwitcher() {
  const Theme = { LIGHT: "light", DARK: "dark" };
  const THEME_STORAGE_KEY = "theme";
  const THEME_OWNER = document.documentElement;

  const themeLocalStore = new LocalStorage(THEME_STORAGE_KEY);

  const cachedTheme = themeLocalStore.getItem();
  if (cachedTheme) {
    THEME_OWNER.dataset[THEME_STORAGE_KEY] = cachedTheme;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector(".theme-switcher");
    if (!themeToggle) return;

    const setIsTogglePressed = (isPressed) => themeToggle.setAttribute("aria-pressed", isPressed);

    const toggleTheme = () => {
      const oldTheme = THEME_OWNER.dataset[THEME_STORAGE_KEY];
      const newTheme = oldTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      THEME_OWNER.dataset[THEME_STORAGE_KEY] = newTheme;
      setIsTogglePressed(newTheme === Theme.DARK);
      themeLocalStore.setItem(newTheme);
    };
    themeToggle.addEventListener("click", toggleTheme);
  });
}

module.exports = themeSwitcher;
