// This supports the Naive UI theming by extracting CSS variables defined in the global styles.
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const themeOverrides = {
  common: {
    primaryColor: cssVar("--color-primary"),
    primaryColorHover: cssVar("--color-primary-hover"),
    primaryColorPressed: cssVar("--color-primary-pressed"),
  },
};
