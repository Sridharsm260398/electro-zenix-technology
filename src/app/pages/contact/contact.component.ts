import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitSuccess = false;
  submitFail = false;
  submitted = false;

  constructor(private fb: FormBuilder, private msg: NzMessageService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  submitForm(event: Event): void {
    event.preventDefault(); // prevent default form refresh
    this.submitted = true;
this.contactForm.markAllAsTouched(); 
    if (this.contactForm.valid) {
      this.submitSuccess = true;
      this.submitFail = false;
      this.msg.success('Thanks...! Message Received!');
      this.contactForm.reset();
      this.submitted = false;

      setTimeout(() => (this.submitSuccess = false), 500);
    } else {
      this.submitFail = true;
      this.msg.error('Please fill all required fields correctly.');
      setTimeout(() => (this.submitFail = false), 500);
    }
  }
}
