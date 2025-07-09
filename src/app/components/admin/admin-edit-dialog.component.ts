// === admin-edit-dialog.component.ts ===
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserData } from './user.model';

@Component({
  selector: 'app-admin-edit-dialog',
  standalone: true,
  template: `
    <div class="dialog-glass">
      <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add New User' }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" required />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required type="email" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Contact</mat-label>
          <input matInput formControlName="contact" required />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="role" multiple required>
            <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Message</mat-label>
          <textarea matInput formControlName="message" rows="3"></textarea>
        </mat-form-field>

        <div class="dialog-actions">
          <button mat-stroked-button color="warn" type="button" (click)="dialogRef.close()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .dialog-glass {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        padding: 2rem;
        border-radius: 16px;
        color: white;
      }
      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }
    `
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class AdminEditDialogComponent {
  roles = ['Admin', 'User', 'Editor'];
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AdminEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserData | null },
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      contact: [data.user?.contact || '', Validators.required],
      role: [data.user?.role || ['User'], Validators.required],
      message: [data.user?.message || '']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
