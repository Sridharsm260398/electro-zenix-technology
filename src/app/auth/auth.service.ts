// ======= auth.service.ts =======
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { authEndpoints } from './endpoint';

export interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  role: string[] | string;
  photo?: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token: string | null = null;
  private tokenTimer: any;
  private loginSuccess = new Subject<any>();
  private loginError = new Subject<any>();
  loginSuccess$ = this.loginSuccess.asObservable();
  loginError$ = this.loginError.asObservable();
  private authStatusListener = new Subject<boolean>();
  private apiUrl = environment.baseUrl;
  UserID: string | null = null;
  public role: string[] | string = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  autoAuthUser() {
    const remember = localStorage.getItem('rememberMe');

    if (remember !== 'true') {
      console.log('Remember Me not enabled — skipping auto login');
      return;
    }

    const authInformation = this.getAuthData();
    if (!authInformation) return;

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);

      const redirectUrl = this.role === 'admin' ? '/dashboard' : '/home';
      this.router.navigate([redirectUrl]);
    } else {
      this.logout();
    }
  }

  logout() {
    this.token = null;
    this.role = '';
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  public handleLoginResponse(response: any, rememberMe?: boolean): void {
    this.loginSuccess.next(response);

    const token = response.token;
    this.token = token;

    const userID = response?.data?.user?._id;
    this.UserID = userID;
    this.role = response?.data?.user?.role;

    if (token) {
      const expiresInDuration = response.expiresIn;
      this.setAuthTimer(expiresInDuration);
      this.isAuthenticated = true;
      this.authStatusListener.next(true);

      const now = new Date();
      const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
      this.saveAuthData(token, expirationDate, userID, this.role, rememberMe);

      const redirectUrl = this.role === 'admin' ? '/dashboard' : '/home';
      this.router.navigate([redirectUrl]);
    }
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userID: string,
    role: string[] | string,
    rememberMe?: boolean
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('auth', 'true');
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userID);
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    localStorage.setItem('theme', 'dark');
    const roleStr = Array.isArray(role) ? role.join(',') : role;
    localStorage.setItem('role', roleStr);
  }

  private clearAuthData(): void {
    const keys = [
      'token',
      'expiration',
      'userId',
      'auth',
      'role',
      'theme',
      'rememberMe',
    ];
    keys.forEach((key) => localStorage.removeItem(key));
  }

  private getAuthData() {
    try {
      const token = localStorage.getItem('token');
      const expirationDate = localStorage.getItem('expiration');
      const userID = localStorage.getItem('userId');

      if (!token || !expirationDate) return null;

      return {
        token,
        expirationDate: new Date(expirationDate),
        userID,
      };
    } catch (error) {
      console.error('Error accessing localStorage', error);
      return null;
    }
  }

  public isAuthenticatedStatus(): boolean {
    return this.isAuthenticated || localStorage.getItem('auth') === 'true';
  }

  public register(data: SignupData): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.signup}`, data);
  }

  public loginUser(
    email: string,
    password: string,
    rememberMe?: boolean
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}${authEndpoints.login}`, { email, password })
      .pipe(
        tap((response: any) => this.handleLoginResponse(response, rememberMe))
      );
  }

  public sendOtp(contact: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.sendOtp}`, {
      contact,
    });
  }

  public verifyOtp(contact: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.verifyOtp}`, {
      contact,
      otp,
    })
  }

  public resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.resetPassword}`, {
      email,
    });
  }
public resetPasswordWithToken(token: string,contact:any, newPassword: string, confirmPassword: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}${authEndpoints.resetPassword}/${token}`, {
    contact,
    newPassword,
    confirmPassword
  });
}

  public forgotPassword(email: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.forgotPassword}`, {
      email,
    });
  }

  public updatePassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${authEndpoints.changePassword}`, {
      email,
      newPassword,
    });
  }
}
