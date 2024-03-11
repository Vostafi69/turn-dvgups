import LocalStorage from "../utils/localstorage";

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
    const themeToggle = document.querySelector(".theme-switcher");
    if (!themeToggle) return;

    const setIsTogglePressed = (isPressed) => themeToggle.setAttribute("aria-pressed", isPressed);

    const toggleTheme = () => {
      const oldTheme = THEME_OWNER.dataset[THEME_STORAGE_KEY] || THEME["LIGHT"];
      const newTheme = oldTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;
      THEME_OWNER.dataset[THEME_STORAGE_KEY] = newTheme;
      setIsTogglePressed(newTheme === THEME.DARK);
      themeLocalStore.setItem(newTheme);
    };

    themeToggle.addEventListener("click", toggleTheme);
  });
}

export default themeSwitcher;
