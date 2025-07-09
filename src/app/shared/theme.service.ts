import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = false;

  constructor() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }

  enableDark(): void {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
    this.darkMode = true;
  }

  enableLight(): void {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    this.darkMode = false;
  }

  toggleTheme(): void {
    if (this.darkMode) {
      this.enableLight();
    } else {
      this.enableDark();
    }
  }

  isDark(): boolean {
    return this.darkMode;
  }
}
