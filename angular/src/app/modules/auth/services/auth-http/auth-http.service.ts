import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';

const API_USERS_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

  // Public methods

  // Login Method
  login(email: string, password: string): Observable<any> {
    console.log('Attempting login with email:', email, password); // Log for debugging
    return this.http.post('http://localhost:3000/auth/login', { email, password });
  }

  // Create User =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(API_USERS_URL, user);
  }

  // Forgot Password Method - This is just for checking if email exists
  forgotPassword(email: string): Observable<boolean> {
    console.log('Making HTTP request to check forgot password with email:', email); // Log for debugging
    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
      email,
    });
  }

  // Send OTP Method
  sendOtp(email: string): Observable<any> {
    console.log('Making HTTP request to send OTP with email:', email); // Log email being sent
    return this.http.post('http://localhost:3000/auth/send-otp', { email }); // Use the correct URL
  }

  // Verify OTP Method
  verifyOtp(email: string, otp: string): Observable<any> {
    console.log('Verifying OTP for email:', email, 'with OTP:', otp); // Log for debugging
    return this.http.post('http://localhost:3000/auth/verify-otp', { email, otp });
  }

  // Reset Password Method
  resetPassword(email: string, password: string): Observable<any> {
    console.log('Sending reset password request for email:', email, 'with new password:', password); // Log for debugging
    return this.http.post('http://localhost:3000/auth/reset-password', { email, newPassword: password }); // Use newPassword key
  }

  // Get User By Token
  getUserByToken(token: string): Observable<UserModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<UserModel>(`${API_USERS_URL}/me`, {
      headers: httpHeaders,
    });
  }
}
