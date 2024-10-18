import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(email: string, password: string): Observable<UserType> {
    this.isLoadingSubject.next(true);

    return this.authHttpService.login(email, password).pipe(
      map((response: any) => {
        //console.log('Backend response:', response);

        if (response.message && response.message.toLowerCase().trim() === 'login successful') {
          const user_data = response.user_data;

          // Convert user_data to JSON string before storing in sessionStorage
          sessionStorage.setItem('user_data', JSON.stringify(user_data));

          // Optionally set currentUserValue if you want to use it later in the app
          this.currentUserValue = {
            id: user_data.id,
            email: user_data.email,
            roles:user_data.role,
            pic:user_data.profile_image_path,
            fullname:user_data.name,
          } as UserModel;

          return this.currentUserValue;

        } else {
          return undefined;
        }
      }),
      catchError((err) => {
        console.error('Login error:', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }



 logout() {
  // Remove user session data
  sessionStorage.removeItem('userId');

  // Navigate to the login page without any query parameters
  this.router.navigate(['/auth/login'], { replaceUrl: true });
}


  getUserByToken(): Observable<UserType> {
    const userDataString = sessionStorage.getItem('user_data');

    //console.log('userDataString');
    //console.log(userDataString);

    if (!userDataString) {
      return of(undefined);
    }

    try {
      // Parse the JSON string back into an object
      const userData = JSON.parse(userDataString) as UserModel;
      this.currentUserValue = userData;
      return of(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return of(undefined);
    }
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  sendOtp(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .sendOtp(email) // Use sendOtp() here instead of the old forgotPassword()
      .pipe(
        map((response) => {
          console.log('OTP Sent:', response); // Log response
          return true; // Assume the response indicates successful OTP sending
        }),
        catchError((err) => {
          console.error('Forgot Password Error:', err); // Log any error encountered
          return of(false); // Return false if there was an error
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }



  verifyOtp(email: string, otp: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.verifyOtp(email, otp).pipe(
      map((response: any) => {
        return response; // Expecting a success message
      }),
      catchError((err) => {
        console.error('Error verifying OTP:', err);
        return of(false);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.resetPassword(email, newPassword).pipe(
      map((response: any) => {
        return response; // Expecting a success message
      }),
      catchError((err) => {
        console.error('Error resetting password:', err);
        return of(false);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }



  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
