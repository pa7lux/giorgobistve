export class ThemeService {
  private static THEME_KEY = 'theme-preference';

  static isDarkMode(): boolean {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // If no saved preference, use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  static toggleTheme(): boolean {
    const isDark = document.documentElement.classList.contains('dark');
    this.applyTheme(!isDark);
    return !isDark;
  }

  static applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  static initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.applyTheme(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (localStorage.getItem(this.THEME_KEY) === null) {
        // Only auto-switch if user hasn't set a preference
        this.applyTheme(e.matches);
      }
    });
  }
}
