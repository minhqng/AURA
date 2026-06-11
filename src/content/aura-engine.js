(function () {
  const STYLE_ID = "aura-accessibility-style";
  const GUIDE_ID = "aura-reading-guide";
  let currentSettings = null;

  const ENGINE_CSS = `
html[data-aura-contrast="inverted"] {
  filter: invert(100%) hue-rotate(180deg) !important;
}
html[data-aura-contrast="inverted"] img,
html[data-aura-contrast="inverted"] video,
html[data-aura-contrast="inverted"] canvas,
html[data-aura-contrast="inverted"] svg {
  filter: invert(100%) hue-rotate(180deg) !important;
}
html[data-aura-contrast="grayscale"] {
  filter: grayscale(100%) !important;
}
html[data-aura-contrast="high"],
html[data-aura-contrast="high"] body {
  background: #000 !important;
  color: #fff !important;
}
html[data-aura-contrast="high"] :not(img):not(video):not(canvas):not(svg) {
  background-color: #000 !important;
  color: #fff !important;
  border-color: #ffd400 !important;
}
html[data-aura-readable-font="true"] body,
html[data-aura-readable-font="true"] p,
html[data-aura-readable-font="true"] li,
html[data-aura-readable-font="true"] button,
html[data-aura-readable-font="true"] input,
html[data-aura-readable-font="true"] textarea {
  font-family: Arial, Verdana, system-ui, sans-serif !important;
}
html[data-aura-typography="true"] body {
  font-size: calc(100% * var(--aura-font-scale, 1)) !important;
}
html[data-aura-typography="true"] p,
html[data-aura-typography="true"] li,
html[data-aura-typography="true"] article,
html[data-aura-typography="true"] main,
html[data-aura-typography="true"] section {
  line-height: var(--aura-line-height, 1.4) !important;
  letter-spacing: var(--aura-letter-spacing, 0px) !important;
}
html[data-aura-focus-aid="true"] :focus,
html[data-aura-focus-aid="true"] :focus-visible {
  outline: 3px solid #ffbf00 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.35) !important;
}
html[data-aura-reduced-motion="true"] *,
html[data-aura-reduced-motion="true"] *::before,
html[data-aura-reduced-motion="true"] *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  scroll-behavior: auto !important;
  transition-duration: 0.001ms !important;
}
#${GUIDE_ID} {
  background: rgba(255, 214, 0, 0.24);
  border-bottom: 2px solid rgba(20, 20, 20, 0.65);
  border-top: 2px solid rgba(20, 20, 20, 0.65);
  height: 32px;
  left: 0;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 45vh;
  z-index: 2147483647;
}`;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ENGINE_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function setFlag(name, enabled) {
    if (enabled) document.documentElement.setAttribute(name, "true");
    else document.documentElement.removeAttribute(name);
  }

  function syncReadingGuide(enabled) {
    let guide = document.getElementById(GUIDE_ID);
    if (!enabled && guide) {
      guide.remove();
      return;
    }
    if (!enabled) return;
    if (!guide) {
      guide = document.createElement("div");
      guide.id = GUIDE_ID;
      document.documentElement.appendChild(guide);
    }
  }

  function moveGuide(event) {
    const guide = document.getElementById(GUIDE_ID);
    if (guide) guide.style.top = `${Math.max(0, event.clientY - 16)}px`;
  }

  function apply(settings) {
    currentSettings = window.AuraDefaults.normalizeSettings(settings);
    ensureStyle();

    const root = document.documentElement;
    root.setAttribute("data-aura-contrast", currentSettings.contrastMode);
    root.setAttribute("data-aura-typography", "true");
    root.style.setProperty("--aura-font-scale", currentSettings.fontScale);
    root.style.setProperty("--aura-line-height", currentSettings.lineHeight);
    root.style.setProperty(
      "--aura-letter-spacing",
      `${currentSettings.letterSpacing}px`
    );

    setFlag("data-aura-readable-font", currentSettings.readableFont);
    setFlag("data-aura-focus-aid", currentSettings.focusAid);
    setFlag("data-aura-reduced-motion", currentSettings.reducedMotion);
    syncReadingGuide(currentSettings.readingGuide);
  }

  document.addEventListener("mousemove", moveGuide, { passive: true });

  window.AuraEngine = {
    apply,
    getCurrentSettings: () => currentSettings,
  };
})();
