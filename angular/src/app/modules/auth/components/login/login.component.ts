import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm: FormGroup;
  hasError: boolean = false;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  showPassword: boolean = false; // Toggle visibility for password

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Custom email validator to ensure the email contains a valid domain with TLD
  CustomEmailValidator(control: AbstractControl): ValidationErrors | null {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const emailValue = control.value;
    if (emailValue && !emailPattern.test(emailValue)) {
      return { invalidEmail: true };
    }
    return null;
  }

  // Get the form controls for easier access in the template
  get f() {
    return this.loginForm.controls;
  }

  // Initialize the login form with validators
  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(320),
          this.CustomEmailValidator, // Custom email validator
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3), // Minimum password length
          Validators.maxLength(100), // Maximum password length
        ]),
      ],
      rememberMe: [false], // Checkbox for remember me
    });
  }

  // Form submission logic
  submit() {
    this.hasError = false;

    // If the form is invalid, prevent submission
    if (this.loginForm.invalid) {
      return;
    }

    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (response: any) => {
          if (response && response.id) {
            const userId = response.id;
            sessionStorage.setItem('userId', userId.toString());
            this.router.navigate([this.returnUrl]);
          } else {
            this.hasError = true;
          }
        },
        (error) => {
          console.error('Login failed:', error);
          this.hasError = true;
        }
      );

    this.unsubscribe.push(loginSubscr);
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
