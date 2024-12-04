import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light'|'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme$ = new BehaviorSubject<Theme>('light');

  constructor() {}

  init() {
    this.setTheme(this.loadFromStorage() ?? 'light');
  }

  get currentTheme() {
    return this.currentTheme$.value;
  }

  setTheme(theme: Theme) {
    this.currentTheme$.next(theme);
    this.saveIntoStorage();
  }

  loadFromStorage() {
    return localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  }

  saveIntoStorage() {
    localStorage.setItem(THEME_STORAGE_KEY, this.currentTheme);
  }
}
