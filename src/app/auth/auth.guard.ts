import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree // Import UrlTree for returning a redirect URL
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Import map and take operators

import { AuthService } from './auth.service'; // Ensure this path is correct

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const allowedRoles = route.data['roles'] as string[] | undefined;

    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('AuthGuard: Not authenticated, redirecting to /login');
          return this.router.createUrlTree(['/login']);
        }

        const userRole = this.authService.getCurrentRole();
        if (allowedRoles && !this.checkUserRole(userRole, allowedRoles)) {
          console.log('AuthGuard: Authenticated but role not allowed, redirecting to /');
          return this.router.createUrlTree(['/']); 
        }

        console.log('AuthGuard: Authenticated and authorized, allowing access');
        return true;
      })
    );
  }

  /**
   * Helper function to check if the user's role matches any of the allowed roles.
   * Handles both single string roles and array of roles for the user.
   * @param userRole The role(s) of the current user (string or string[]).
   * @param allowedRoles The roles allowed for the route (string[]).
   * @returns true if the user's role is allowed, false otherwise.
   */
  private checkUserRole(userRole: string | string[], allowedRoles: string[]): boolean {
    if (Array.isArray(userRole)) {
      // If user has multiple roles, check if any of them are in allowedRoles
      return userRole.some(role => allowedRoles.includes(role));
    } else {
      // If user has a single role, check if it's in allowedRoles
      return allowedRoles.includes(userRole);
    }
  }
}
