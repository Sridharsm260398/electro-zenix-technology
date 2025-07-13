import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirm = false;
  token: string = '';
  contact:any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.contact =params['conatct'];
    });
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordsMatch }
    );
  }

  get f() {
    return this.resetForm.controls;
  }

  passwordsMatch(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  toggle(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  submit() {
    this.submitted = true;
    if (this.resetForm.invalid) return;

    const { newPassword, confirmPassword } = this.resetForm.value;
    this.authService
      .resetPasswordWithToken(this.token,this.contact, newPassword, confirmPassword)
      .subscribe({
        next: (res) => {
          this.toast.success(`Password Reset Successfull!`);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.toast.error(`Error: ${err.error.message || 'OOps Something Went Wrong'}`);

          console.error('Update password failed:', err);
        },
      });
  }
}
