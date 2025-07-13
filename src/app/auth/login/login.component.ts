import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy {
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', Validators.required],
      otp: [''],
      remember: [false],
    });

    this.resetOtpValidators();
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

  toggleMode(): void {
    this.isOtpMode = !this.isOtpMode;
    this.isResetMode = false;
    this.otpSent = false;
    this.submitted = false;
    this.resetOtpValidators();
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
          queryParams: { token: this.resetToken , conatct:contact },
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
