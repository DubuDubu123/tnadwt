import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if userId is present in sessionStorage
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      // User is logged in, so return true
      return true;
    }

    // User is not logged in, so redirect to the login page without the returnUrl parameter
    this.router.navigate(['/auth/login']);
    return false;
  }
}
