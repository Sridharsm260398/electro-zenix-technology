import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = route.data['roles'] as string[] | undefined;
    if (!this.authService.isAuthenticatedStatus() && localStorage.getItem('token')) {
      this.authService.autoAuthUser();
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('AuthGuard: Not authenticated, redirecting to /login');
          return this.router.createUrlTree(['/login']);
        }

        const userRole = this.authService.getCurrentRole();
        if (allowedRoles && !this.checkUserRole(userRole, allowedRoles)) {
          console.log('AuthGuard: Role not allowed, redirecting to /');
          return this.router.createUrlTree(['/']);
        }

        console.log('AuthGuard: Authenticated and authorized');
        return true;
      })
    );
  }

  private checkUserRole(userRole: string | string[], allowedRoles: string[]): boolean {
    return Array.isArray(userRole)
      ? userRole.some(role => allowedRoles.includes(role))
      : allowedRoles.includes(userRole);
  }
}
