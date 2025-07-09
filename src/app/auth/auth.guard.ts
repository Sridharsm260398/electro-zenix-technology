import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    //Use persistent auth check
    const isAuth = this.authService.isAuthenticatedStatus();

    // Get role from either storage
    const role =
      localStorage.getItem('role') || '';

    const allowedRoles = route.data['roles'] as string[] | undefined;

    //Not logged in
    if (!isAuth) {
      this.router.navigate(['/login']);
      return false;
    }

    // Role not allowed
    if (allowedRoles && !allowedRoles.includes(role)) {
      this.router.navigate(['/']);
      return false;
    }

    // Authenticated and authorized
    return true;
  }
}
