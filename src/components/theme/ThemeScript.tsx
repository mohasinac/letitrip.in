/**
 * ThemeScript Component
 *
 * Inline script that runs before React hydration to prevent theme flash.
 * Sets dark mode immediately on page load based on stored preference.
 *
 * This should be placed in the <head> of the document.
 */

export function ThemeScript() {
  // Inline script to prevent flash of unstyled content (FOUC)
  const themeScript = `
    (function() {
      const storageKey = 'letitrip-theme';
      const defaultTheme = 'dark';
      
      try {
        const storedTheme = localStorage.getItem(storageKey);
        const theme = storedTheme || defaultTheme;
        
        // Apply theme immediately
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Set color scheme
        document.documentElement.style.colorScheme = theme;
      } catch (e) {
        // If localStorage fails, apply default theme
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
