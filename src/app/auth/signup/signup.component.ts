import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/toast.service';
import { TermsAndConditionsDialogComponent } from '../../components/terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';

declare const google: any;
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    NzIconModule
  ],
  providers: [AuthService,ToastService],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;

  constructor(private dialog: MatDialog,private ngZone: NgZone ,private router: Router, private fb: FormBuilder, private authService: AuthService ,private toast:ToastService) 
  {

        window.google.accounts.id.renderButton(
      document.getElementById('google-signup-button'), 
      {
        type: 'standard',
        size: 'large',
        text: 'signup_with', 
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      })
        this.signupForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
  //     google.accounts.id.initialize({
  //   client_id: '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
  //      callback: this.handleGoogleCallback.bind(this)
  // });

  // google.accounts.id.renderButton(
  //   document.getElementById("googleBtn"),
  //   { theme: "outline", size: "large" }  // customization
  // );
    window.google.accounts.id.renderButton(
      document.getElementById('google-signup-button'), 
      {
        type: 'standard',
        size: 'large',
        text: 'signup_with', 
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      }
    );
    // this.signupForm = this.fb.group(
    //   {
    //     fullName: ['', Validators.required],
    //     email: ['', [Validators.required, Validators.email]],
    //     phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    //     password: [
    //       '',
    //       [
    //         Validators.required,
    //         Validators.minLength(8),
    //         Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
    //       ],
    //     ],
    //     confirmPassword: ['', Validators.required],
    //     terms: [false, Validators.requiredTrue],
    //   },
    //   { validators: this.passwordMatchValidator }
    // );
  }

// triggerGoogleLogin() {
//   google.accounts.id.initialize({
//     client_id: '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
//        callback: this.handleGoogleCallback.bind(this)
//   });

//   google.accounts.id.renderButton(
//     document.getElementById("googleBtn"),
//     { theme: "outline", size: "large" }  // customization
//   ); // or showPopup or renderButton
// }

// handleGoogleCallback(response: any) {
//   const idToken = response.credential;

//   this.authService.loginWithGoogle(idToken).subscribe({
//     next: (res) => {
//       this.toast.success('Logged in with Google');
//       this.router.navigate(['/home']);
//     },
//     error: (err) => {
//       this.toast.error(err.error.message || 'Google login failed');
//     }
//   });
// }
  ngAfterViewInit(): void {
    if (window.google) {
      this.initializeGoogleSignUp();
    } else {
      console.warn('Google Identity Services script not loaded.');
    }
  }

  private initializeGoogleSignUp(): void {
    window.handleCredentialResponse = (response: any) => {
      this.ngZone.run(() => { 
        this.handleGoogleSignUpCallback(response);
      });
    };

    window.google.accounts.id.initialize({
      client_id: '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
      callback: window.handleCredentialResponse, 
      auto_select: false,
      context: 'signup'
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signup-button'), 
      {
        type: 'standard',
        size: 'large',
        text: 'signup_with', 
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left'
      }
    );

    // Optional: Prompt One Tap for sign-up
    // google.accounts.id.prompt((notification: any) => {
    //   if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
    //     console.log('One Tap not shown on registration:', notification.getNotDisplayedReason());
    //   }
    // });
  }

  handleGoogleSignUpCallback(response: any) {
    const idToken = response.credential;
    if (idToken) {
      this.authService.googleSignUp(idToken).subscribe({
        next: (res) => {
          this.toast.success('Signed up with Google successfully!');
          // After Google signup, profile is likely incomplete (missing phone)
          if (!res.data.user.isProfileComplete) {
            this.router.navigate(['/login']);
       //     this.router.navigate(['/complete-profile']);
          } else {
            // This case might occur if account was linked/merged
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error('Google Sign-Up failed:', err);
          this.toast.error(err.error?.message || 'Google Sign-Up failed. Please try again.');
          if (err.status === 409) { // Conflict: user exists
            this.router.navigate(['/login']); // Prompt to login
          }
        },
      });
    } else {
      this.toast.error('Google credential not found.');
    }
  }

  get f() {
    return this.signupForm.controls;
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  register(): void {
  this.submitted = true;

  if (this.signupForm.invalid) {
    this.toast.error('Please fix the errors in the form.');
    return;
  }

  const formData = this.signupForm.value;

 this.toast.loading('Creating your account...');

  this.authService.register(formData).subscribe({
    next: (res) => {
    this.toast.clearAll(); // clear loading
      this.toast.success('Account created successfully!');
      console.log('User registered:', res);
      this.router.navigate(['/login']);
    },
    error: (err) => {
     this.toast.clearAll(); // clear loading
      const errorMsg = err?.error?.message || 'Something went wrong';
     this.toast.error(`Registration failed: ${errorMsg}`);
      console.error('Registration failed:', err);
    }
  });
}
// --- Method to open the dialog ---
  openTermsAndConditionsDialog(): void {
    const dialogRef = this.dialog.open(TermsAndConditionsDialogComponent, {
      width: '800px', 
      maxWidth: '90vw', 
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container', 
      backdropClass: 'custom-dialog-backdrop', 
      disableClose: true, 
    });

    dialogRef.afterClosed().pipe(
      filter(result => result === true) 
    ).subscribe(result => {
      if (result) {
        this.signupForm.controls['terms'].setValue(true);
        this.toast.info('Terms and Conditions accepted!');
      }
    });
  }
}

