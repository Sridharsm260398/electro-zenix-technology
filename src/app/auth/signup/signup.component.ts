import { Component, OnInit } from '@angular/core';
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

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService ,private toast:ToastService) 
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

  ngOnInit(): void {
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

}

