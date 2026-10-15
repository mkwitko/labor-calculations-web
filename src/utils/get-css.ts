export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export const primaryColor = getCssVar("--primary");
export const primaryHoverColor = getCssVar("--primary-hover");
export const secondaryColor = getCssVar("--secondary");
export const secondaryHoverColor = getCssVar("--secondary-hover");
