import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

enum Step {
  Email,
  Otp,
  ResetPassword,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  resetPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  successMessage: string = ''; // Success message to show after different steps
  errorStates = ErrorStates;
  step: Step = Step.Email;
  steps = Step;
  isLoading$: Observable<boolean>;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForms();
  }

  // Initialize Forms for Different Steps
  initForms() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(320)]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // Handle Form Submission Based on the Current Step
  submit() {
    if (this.step === Step.Email) {
      this.sendOtp();
    } else if (this.step === Step.Otp) {
      this.verifyOtp();
    } else if (this.step === Step.ResetPassword) {
      this.resetPassword();
    }
  }

  sendOtp() {
    if (this.forgotPasswordForm.invalid) {
      this.errorState = ErrorStates.HasError;
      return;
    }

    this.isLoading$ = this.authService.isLoading$;
    this.authService.sendOtp(this.forgotPasswordForm.value.email).subscribe(
      (result: any) => {
        if (result) {
          this.errorState = ErrorStates.NoError;
          this.successMessage = 'OTP has been successfully sent to your email. Please check your inbox.';
          this.step = Step.Otp; // Move to OTP step after successful OTP send
        } else {
          this.errorState = ErrorStates.HasError;
          this.successMessage = '';
        }
      },
      (error: any) => {
        console.error('Error sending OTP:', error); // Log error
        this.errorState = ErrorStates.HasError;
        this.successMessage = '';
      }
    );
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.errorState = ErrorStates.HasError;
      return;
    }

    this.isLoading$ = this.authService.isLoading$;
    this.authService.verifyOtp(this.forgotPasswordForm.value.email, this.otpForm.value.otp).subscribe(
      (result: any) => {
        if (result) {
          this.errorState = ErrorStates.NoError;
          this.successMessage = 'OTP verified successfully. Please enter your new password.';
          this.step = Step.ResetPassword; // Move to Reset Password step after OTP verification
        } else {
          this.errorState = ErrorStates.HasError;
          this.successMessage = '';
        }
      },
      (error: any) => {
        console.error('Error verifying OTP:', error); // Log error
        this.errorState = ErrorStates.HasError;
        this.successMessage = '';
      }
    );
  }

  resetPassword() {
    if (
      this.resetPasswordForm.invalid ||
      this.resetPasswordForm.value.password !== this.resetPasswordForm.value.confirmPassword
    ) {
      this.errorState = ErrorStates.HasError;
      this.successMessage = 'Passwords do not match. Please try again.';
      return;
    }

    this.isLoading$ = this.authService.isLoading$;
    this.authService.resetPassword(this.forgotPasswordForm.value.email, this.resetPasswordForm.value.password).subscribe(
      (result: any) => {
        if (result) {
          this.errorState = ErrorStates.NoError;
          this.successMessage = 'Password reset successfully. Redirecting to login...';
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000); // 2-second delay before redirecting
        } else {
          this.errorState = ErrorStates.HasError;
          this.successMessage = '';
        }
      },
      (error: any) => {
        console.error('Error resetting password:', error); // Log error
        this.errorState = ErrorStates.HasError;
        this.successMessage = '';
      }
    );
  }
}
