// auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { authEndpoints } from './endpoint';

interface UserData {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string; // Optional, as it might not be present initially
  photo?: string;
  googleId?: string;
  role?: string;
  isProfileComplete?: boolean; // Crucial flag
}

// Interface for backend response structure
interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: UserData;
  };
  message?: string; // For messages like "Please complete your profile"
  expiresIn?: number; // Ensure this is always present if your backend sends it, or handle default
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private tokenTimer: any;
  private loginSuccess = new Subject<any>();
  private loginError = new Subject<any>();
  loginSuccess$ = this.loginSuccess.asObservable();
  loginError$ = this.loginError.asObservable();
  private apiUrl = environment.baseUrl;

  // Changed to BehaviorSubject for reactive updates
  private _userId = new BehaviorSubject<string | null>(null);
  userId$ = this._userId.asObservable(); // Public observable for UserID

  // Changed to BehaviorSubject for reactive updates
  private _role = new BehaviorSubject<string | string[]>('user');
  role$ = this._role.asObservable(); // Public observable for role

  // Use a BehaviorSubject to hold the current authentication status.
  // Initialize based on existing 'auth' localStorage item.
  private _isAuthenticated = new BehaviorSubject<boolean>(localStorage.getItem('auth') === 'true');
  // Public observable for components to subscribe to for auth status
  isAuthenticated$ = this._isAuthenticated.asObservable();

  // A Subject to specifically emit when a cross-tab logout occurs.
  private _crossTabLogout = new Subject<void>();
  crossTabLogout$ = this._crossTabLogout.asObservable();

  // Define a key for localStorage to signal logout across tabs
  private readonly LOGOUT_EVENT_KEY = 'app_logout_event';

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    // Listen for storage events from other tabs
    window.addEventListener('storage', this.storageEventListener.bind(this));
    // Initialize userId and role from localStorage on service creation
    this.initializeUserDataFromStorage();
  }

  // Helper to initialize userId and role from localStorage
  private initializeUserDataFromStorage(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this._userId.next(storedUserId);
    }
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      this._role.next(storedRole.includes(',') ? storedRole.split(',') : storedRole);
    }
  }

  getIsAuth(): boolean {
    return this._isAuthenticated.getValue();
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // --- NEW METHOD FOR SYNCHRONOUS ROLE ACCESS ---
  public getCurrentRole(): string | string[] {
    return this._role.getValue();
  }
  // ---------------------------------------------

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      // No auth data found, ensure we are logged out.
      if (this._isAuthenticated.getValue()) {
        this.logout(false); // Log out this tab without broadcasting
      }
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn <= 0) {
      // Token expired, log out.
      console.log('AuthService: Token expired, logging out.');
      this.logout(); // Full logout, broadcasts to other tabs
      return;
    }

    // Token is valid.
    const remember = localStorage.getItem('rememberMe');

    this.token = authInformation.token;
    this._isAuthenticated.next(true);
    this.setAuthTimer(expiresIn / 1000); // Set timer for current session

    // Update BehaviorSubjects for userId and role
    this._userId.next(authInformation.userID || null);
    const storedRole = localStorage.getItem('role');
    this._role.next(storedRole ? (storedRole.includes(',') ? storedRole.split(',') : storedRole) : 'user');

    const redirectUrl = this._role.getValue() === 'admin' ? '/dashboard' : '/home';
    this.router.navigate([redirectUrl]);

    if (remember !== 'true') {
      console.log('AuthService: Remember Me not enabled. Session will not persist across browser closes.');
    } else {
        console.log('AuthService: Auto-authenticating with Remember Me enabled.');
    }
  }

  /**
   * Performs the logout operation.
   * Clears the token, updates auth status, and broadcasts logout to other tabs.
   * @param broadcastToOtherTabs Whether to trigger the localStorage event for other tabs. Default is true.
   */
  logout(broadcastToOtherTabs: boolean = true) {
    this.token = null;
    this._isAuthenticated.next(false); // Update internal isAuthenticated flag and BehaviorSubject
    this._userId.next(null); // Clear userId
    this._role.next('user'); // Reset role
    clearTimeout(this.tokenTimer);
    this.clearAuthData(); // Clears all relevant localStorage items

    // Broadcast a logout event to other tabs using localStorage.
    if (broadcastToOtherTabs) {
      localStorage.setItem(this.LOGOUT_EVENT_KEY, Date.now().toString());
    }

    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  public handleLoginResponse(response: AuthResponse, rememberMe?: boolean): void {
    this.loginSuccess.next(response);

    const token = response.token;
    this.token = token;

    const userID = response?.data?.user?._id;
    const userRole = response?.data?.user?.role || 'user'; // Ensure role is set

    if (token) {
      // Use expiresIn from response if available, otherwise default (e.g., 7 days)
      const expiresInDuration = response.expiresIn || (3600 * 24 * 7);
      this.setAuthTimer(expiresInDuration);

      this._isAuthenticated.next(true); // Update internal isAuthenticated flag and BehaviorSubject
      this._userId.next(userID || null); // Update userId BehaviorSubject
      this._role.next(userRole); // Update role BehaviorSubject

      const now = new Date();
      const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
      this.saveAuthData(token, expirationDate, userID, userRole, rememberMe);

      const redirectUrl = userRole === 'admin' ? '/dashboard' : '/home';
      this.router.navigate([redirectUrl]);
    }
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userID: any,
    role: string[] | string,
    rememberMe?: boolean
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('auth', 'true'); // Explicitly set 'auth' to true
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userID);
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false'); // Ensure rememberMe is saved correctly
    localStorage.setItem('theme', 'dark'); // Assuming dark theme is default
    const roleStr = Array.isArray(role) ? role.join(',') : role;
    localStorage.setItem('role', roleStr);
  }

  private clearAuthData(): void {
    const keys = [
      'token',
      'expiration',
      'userId',
      'auth', // Clear 'auth' flag
      'role',
      'theme',
      'rememberMe', // Ensure rememberMe is also cleared on logout
    ];
    keys.forEach((key) => localStorage.removeItem(key));
  }

  private getAuthData() {
    try {
      const token = localStorage.getItem('token');
      const expirationDateString = localStorage.getItem('expiration');
      const userID = localStorage.getItem('userId');

      if (!token || !expirationDateString) return null;

      const expirationDate = new Date(expirationDateString);

      return {
        token,
        expirationDate,
        userID,
      };
    } catch (error) {
      console.error('Error accessing localStorage', error);
      return null;
    }
  }

  public isAuthenticatedStatus(): boolean {
    return this._isAuthenticated.getValue();
  }

  private storageEventListener(event: StorageEvent): void {
    // We only care about changes to our specific logout event key OR the auth token/flag keys.
    if (event.key === this.LOGOUT_EVENT_KEY || event.key === 'token' || event.key === 'auth') {
      const currentAuthStatus = this._isAuthenticated.getValue();
      const isTokenPresent = !!localStorage.getItem('token');
      const isAuthFlagTrue = localStorage.getItem('auth') === 'true';

      // Run inside NgZone to ensure Angular change detection is triggered.
      this.ngZone.run(() => {
        // Scenario 1: Logout detected from another tab
        // If token is missing OR auth flag is false, AND current tab thought it was authenticated
        if ((!isTokenPresent || !isAuthFlagTrue) && currentAuthStatus) {
          console.log('AuthService: Logout detected from another tab. Syncing logout.');
          // Perform full logout actions for this tab without broadcasting again
          this.token = null;
          clearTimeout(this.tokenTimer);
          this.clearAuthData(); // Ensure all relevant items are removed
          this._isAuthenticated.next(false); // Update authentication status for this tab
          this._userId.next(null); // Clear userId
          this._role.next('user'); // Reset role
          this._crossTabLogout.next(); // Emit cross-tab logout event
          this.router.navigate(['/login']); // Redirect to login page
        }
        // Scenario 2: Login detected from another tab
        // If token is present AND auth flag is true, AND current tab thought it was NOT authenticated
        else if (isTokenPresent && isAuthFlagTrue && !currentAuthStatus) {
          console.log('AuthService: Login detected from another tab. Syncing login.');
          // Trigger autoAuthUser to re-evaluate and set up the session for this tab
          this.autoAuthUser();
        }
      });
    }
  }

  // Existing API calls
  public register(data: UserData): Observable<any> {
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
  public resetPasswordWithToken(token: string, contact: any, newPassword: string, confirmPassword: string): Observable<any> {
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

  // --- Google Authentication Methods ---

  /**
   * Handles Google Sign-In (for existing users).
   * Sends the Google ID token to the backend's login endpoint.
   * @param idToken The Google ID token received from the frontend.
   * @returns Observable of the authentication response.
   */
  googleSignIn(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}${authEndpoints.googleLogin}`, { token: idToken }).pipe(
      tap((response) => this.handleLoginResponse(response, true)) // Pass true for rememberMe here
    );
  }

  /**
   * Handles Google Sign-Up (for new users).
   * Sends the Google ID token to the backend's registration endpoint.
   * @param idToken The Google ID token received from the frontend.
   * @returns Observable of the authentication response.
   */
  googleSignUp(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}${authEndpoints.googleRegister}`, { token: idToken }).pipe(
      tap((response) => this.handleLoginResponse(response, true)) // Pass true for rememberMe here
    );
  }

  /**
   * Sends the phone number to the backend to complete user profile.
   * Requires an authenticated user (JWT in headers).
   * @param phone The phone number to add to the user's profile.
   * @returns Observable of the updated user authentication response.
   */
  completeProfile(phone: string): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<AuthResponse>(`${this.apiUrl}${authEndpoints.completeProfile}`, { phone }, { headers }).pipe(
      tap((response) => this.handleLoginResponse(response)) // Re-handle login to update token/user state
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageEventListener.bind(this));
  }
}
