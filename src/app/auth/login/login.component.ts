import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/toast.service';
import { forkJoin } from 'rxjs';
declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void; // Global callback for GIS
  }
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    NzIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm!: FormGroup;
  submitted = false;
  isOtpMode = false;
  isResetMode = false;
  otpSent = false;
  timer = 0;
  interval: any;
  showPassword = false;
  otpToken = '';
  resetToken = '';
  constructor(
    private router: Router,
    private toast: ToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private ngZone : NgZone
  ) {
     window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'), // Target div ID
      {
        type: 'standard',
        size: 'large',
        text: 'signin_with', // 'signin_with' or 'continue_with'
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      }
    )
  }

  ngOnInit(): void {
  //   google.accounts.id.initialize({
  //     client_id:
  //       '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
  //     callback: this.handleGoogleCallback.bind(this),
  //   auto_select: false,
  //   context: 'signup' // Important: tells Google it's for signup
  // });

  // google.accounts.id.prompt((notification:any) => {
  //   if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
  //     console.log('One Tap not shown:', notification.getNotDisplayedReason());
  //   }
  // }); 
  window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'), // Target div ID
      {
        type: 'standard', // 'standard' or 'icon'
        size: 'large',
        text: 'signin_with', // 'signin_with' or 'continue_with'
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      }
    );
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', Validators.required],
      otp: [''],
      remember: [false],
    });

    this.resetOtpValidators();
  }

  // triggerGoogleLogin() {
  //   google.accounts.id.initialize({
  //     client_id:
  //       '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
  //     callback: (response: any) => this.handleGoogleCallback.bind(this),
  //   });

  //   google.accounts.id.prompt(); 
  // }

  // handleGoogleCallback(response: any) {
  //   const token = response.credential;

  //   this.authService.loginWithGoogle(token).subscribe({
  //     next: (res) => {
  //       //localStorage.setItem('token', res.token);
  //       this.toast.success('Logged in with Google');
  //     },
  //     error: () => this.toast.error('Google login failed'),
  //   });
  // }
  ngAfterViewInit(): void {
    // Initialize Google Identity Services after view is rendered
    if (window.google) {
      this.initializeGoogleSignIn();
    } else {
      console.warn('Google Identity Services script not loaded.');
      // You might want to add a fallback or retry mechanism here
    }
  }

  private initializeGoogleSignIn(): void {
    // Attach the global callback for Google to call when a credential is returned
    // We bind it to `this` to ensure `this` refers to the component instance inside the callback.
    window.handleCredentialResponse = (response: any) => {
      this.ngZone.run(() => { // Wrap in ngZone.run to ensure Angular change detection
        this.handleGoogleSignInCallback(response);
      });
    };

    // Initialize GIS for rendering the button
    window.google.accounts.id.initialize({
      client_id: '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
      callback: window.handleCredentialResponse, // Use the global callback
      auto_select: false,
      context: 'signin' // IMPORTANT: tells Google it's for sign-in
    });

    // Render the Google Sign-In button into the designated div
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'), // Target div ID
      {
        type: 'standard', // 'standard' or 'icon'
        size: 'large',
        text: 'signin_with', // 'signin_with' or 'continue_with'
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      }
    );

    // Optional: Prompt One Tap for sign-in
    // google.accounts.id.prompt((notification: any) => {
    //   if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
    //     console.log('One Tap not shown on login:', notification.getNotDisplayedReason());
    //   }
    // });
  }

  handleGoogleSignInCallback(response: any) {
    const idToken = response.credential;
    if (idToken) {
      this.authService.googleSignIn(idToken).subscribe({
        next: (res) => {
          this.toast.success('Logged in with Google successfully!');
          // Check if profile is complete (e.g., phone number)
          if (!res.data.user.isProfileComplete) {
            this.router.navigate(['/complete-profile']);
          } else {
            this.router.navigate(['/dashboard']); // Redirect to dashboard or home
          }
        },
        error: (err) => {
          console.error('Google Sign-In failed:', err);
          this.toast.error(err.error?.message || 'Google Sign-In failed. Please try again.');
          if (err.status === 404) { // User not found, prompt to register
            this.router.navigate(['/signup']);
          }
        },
      });
    } else {
      this.toast.error('Google credential not found.');
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleMode() {
    if (this.isResetMode || this.isOtpMode) {
      this.isResetMode = false;
      this.isOtpMode = false;
      this.otpSent = false;
      this.submitted = false;
      this.resetOtpValidators();
      this.loginForm.reset();
    } else {
      this.isOtpMode = true;
      this.isResetMode = false;
      this.otpSent = false;
      this.submitted = false;
      this.loginForm.reset();
      this.resetOtpValidators();
    }
  }

  triggerResetMode(): void {
    this.isResetMode = true;
    this.isOtpMode = false;
    this.otpSent = false;
    this.submitted = false;
    this.resetOtpValidators();
  }

  resetOtpValidators(): void {
    if (this.isOtpMode || this.isResetMode) {
      this.f['password'].clearValidators();
      this.f['password'].setValue('');
      if (this.otpSent) {
        this.f['otp'].setValidators(Validators.required);
      } else {
        this.f['otp'].clearValidators();
        this.f['otp'].setValue('');
      }
    } else {
      this.f['password'].setValidators(Validators.required);
      this.f['otp'].clearValidators();
      this.f['otp'].setValue('');
    }

    this.f['password'].updateValueAndValidity();
    this.f['otp'].updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    const contact = this.f['email'].value;
    const password = this.f['password'].value;
    const rememberMe = this.f['remember'].value;
    const otp = this.f['otp'].value;

    //FORGOT PASSWORD FLOW
    if (this.isResetMode) {
      if (!this.otpSent) {
        this.toast.loading('Sending OTP and generating reset token...');

        forkJoin([
          this.authService.sendOtp(contact),
          this.authService.forgotPassword(contact),
        ]).subscribe({
          next: ([otpRes, forgotRes]) => {
            this.otpSent = true;
            this.otpToken = otpRes?.otp || '123456';
            this.resetToken = forgotRes?.resetToken || 'fallback_reset_token';

            this.startTimer();
            this.resetOtpValidators();

            this.toast.clearAll();
            this.toast.success(`OTP sent to ${contact}: ${this.otpToken}`);
          },
          error: (err) => {
            this.toast.clearAll();
            this.toast.error(
              `Error: ${
                err?.error?.message || 'Failed to send OTP or reset token'
              }`
            );
          },
        });

        return;
      }

      //Verify OTP before navigating to reset-password page
      this.toast.loading('Verifying OTP...');
      this.authService.verifyOtp(contact, otp).subscribe({
        next: () => {
          this.toast.clearAll();
          this.toast.success('OTP verified. Redirecting to reset page...');
          this.router.navigate(['/reset-password'], {
            queryParams: { token: this.resetToken, conatct: contact },
          });
        },
        error: (err) => {
          this.toast.clearAll();
          this.toast.error(
            `OTP verification failed: ${err?.error?.message || 'Invalid OTP'}`
          );
        },
      });

      return;
    }

    // DIRECT OTP LOGIN FLOW
    if (this.isOtpMode) {
      if (!this.otpSent) {
        this.toast.loading('Sending OTP...');

        this.authService.sendOtp(contact).subscribe({
          next: (res) => {
            this.otpSent = true;
            this.otpToken = res.otp || '123456';

            this.startTimer();
            this.resetOtpValidators();

            this.toast.clearAll();
            this.toast.success(`OTP sent to ${contact}: ${this.otpToken}`);
          },
          error: (err) => {
            this.toast.clearAll();
            this.toast.error(
              `Error: ${err?.error?.message || 'Failed to send OTP'}`
            );
          },
        });

        return;
      }

      // Verify OTP for login
      this.toast.loading('Verifying OTP...');
      this.authService.verifyOtp(contact, otp).subscribe({
        next: (res) => {
          this.toast.clearAll();
          this.toast.success('OTP verified. Logging in...');
          this.authService.handleLoginResponse(res, rememberMe);
        },
        error: (err) => {
          this.toast.clearAll();
          this.toast.error(
            `OTP verification failed: ${err?.error?.message || 'Invalid OTP'}`
          );
        },
      });

      return;
    }

    // PASSWORD LOGIN FLOW
    this.toast.loading('Logging in...');
    this.authService.loginUser(contact, password, rememberMe).subscribe({
      next: (res) => {
        this.toast.clearAll();
        this.toast.success('Login successful!');
      },
      error: (err) => {
        this.toast.clearAll();
        this.toast.error(
          `Login failed: ${err?.error?.message || 'Invalid credentials'}`
        );
      },
    });
  }

  resendOtp(): void {
    this.toast.loading('Resending OTP...');
    const contact = this.f['email'].value;
    this.startTimer();

    this.getOtp(contact);
    //alert(`OTP resent to ${contact}: ${this.otpToken}`);
  }

  startTimer(): void {
    this.timer = 10;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) clearInterval(this.interval);
    }, 1000);
  }

  getOtp(contact: string): void {
    this.authService.sendOtp(contact).subscribe({
      next: (res) => {
        this.toast.clearAll();
        this.otpSent = true;
        this.otpToken = res.otp || '123456';
        this.startTimer();
        this.resetOtpValidators();
        this.toast.success(`OTP sent to ${contact}: ${this.otpToken}`);
        // this.toast.clearAll();
      },
      error: (err) => {
        this.toast.clearAll();
        this.toast.error(`Error: ${err.error.message || 'Failed to send OTP'}`);
        //
      },
    });
  }

  //  Custom validator for email or phone
  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return { required: true };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^[6-9]\d{9}$/;

    const isEmail = emailRegex.test(value);
    const isPhone = phoneRegex.test(value);

    return isEmail || isPhone ? null : { invalidContact: true };
  }
}
