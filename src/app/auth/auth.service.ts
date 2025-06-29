import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedIn = false;

  login() {
    this.isLoggedIn = true;
    localStorage.setItem('auth', 'true');
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem('auth');
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn || localStorage.getItem('auth') === 'true';
  }
}
