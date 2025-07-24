import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
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
import { GoogleAuthComponent } from '../google-auth/google-auth.component';

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
    NzIconModule,
    GoogleAuthComponent
  ],
  providers: [ToastService],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent  {
  signupForm!: FormGroup;
  submitted = false;

  constructor(private dialog: MatDialog,private ngZone: NgZone ,private router: Router, private fb: FormBuilder, private authService: AuthService ,public toast:ToastService,
    private cdRef:ChangeDetectorRef
  ) 
  {

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
  
 handleGoogleAuth(idToken: string) {
  this.authService.googleAuth(idToken).subscribe({
    next: (res) => {
      if (res?.statusCode === 201) {
        this.toast.success('Registered with Google successfully!');
      } else {
        this.toast.success('Logged in with Google successfully!');
      }
      this.authService.handleLoginResponse(res, true);
      // if (!res.data.user.isProfileComplete) {
      //   this.router.navigate(['/complete-profile']);
      // } else {
      //   this.router.navigate(['/dashboard']);
      // }
    },
    error: (err) => {
      this.toast.error(err.error?.message || 'Google authentication failed.');
    },
  });
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

