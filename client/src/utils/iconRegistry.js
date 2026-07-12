import * as solidIcons from "@fortawesome/free-solid-svg-icons";

const FALLBACK_ICON = solidIcons.faLayerGroup;

// Converts FontAwesome CSS-class form ("fa-solid fa-user" or "fa-user")
// into the react-fontawesome export name ("faUser").
function cssClassToExportName(rawName) {
  const lastToken = rawName.trim().split(/\s+/).pop();
  const slug = lastToken.replace(/^fa-/, "");
  const camel = slug
    .split("-")
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
  return `fa${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
}

export function resolveIcon(iconName) {
  if (!iconName) return FALLBACK_ICON;

  if (solidIcons[iconName]?.iconName) {
    return solidIcons[iconName];
  }

  const derivedName = cssClassToExportName(iconName);
  return solidIcons[derivedName]?.iconName ? solidIcons[derivedName] : FALLBACK_ICON;
}
