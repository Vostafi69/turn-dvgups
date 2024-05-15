import LocalStorage from "../utils/Localstorage";

const THEME = { LIGHT: "light", DARK: "dark" };
const THEME_STORAGE_KEY = "theme";
const THEME_OWNER = document.documentElement;

function themeSwitcher() {
  const themeLocalStore = new LocalStorage(THEME_STORAGE_KEY);

  const cachedTheme = themeLocalStore.getItem();

  if (cachedTheme) {
    THEME_OWNER.dataset[THEME_STORAGE_KEY] = cachedTheme;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggles = document.querySelectorAll(".theme-switcher");

    if (!themeToggles) return;

    themeToggles.forEach((themeToggle) => {
      if (THEME_OWNER.dataset[THEME_STORAGE_KEY] === THEME.DARK) {
        themeToggle.classList.add("theme-switcher--night");
      } else {
        themeToggle.classList.remove("theme-switcher--night");
      }
    });

    const setIsTogglePressed = (isPressed, themeToggle) => {
      themeToggle.setAttribute("aria-pressed", isPressed);
      isPressed
        ? themeToggle.classList.add("theme-switcher--night")
        : themeToggle.classList.remove("theme-switcher--night");
    };

    const toggleTheme = (themeToggle) => {
      const oldTheme = THEME_OWNER.dataset[THEME_STORAGE_KEY] || THEME["LIGHT"];
      const newTheme = oldTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;

      THEME_OWNER.dataset[THEME_STORAGE_KEY] = newTheme;

      setIsTogglePressed(newTheme === THEME.DARK, themeToggle);

      themeLocalStore.setItem(newTheme);
    };

    themeToggles.forEach((themeToggle) => {
      themeToggle.addEventListener("click", () => toggleTheme(themeToggle));
    });
  });
}

export default themeSwitcher;
