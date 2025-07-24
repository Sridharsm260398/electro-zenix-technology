import { Component, Input, Output, EventEmitter, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

@Component({
  selector: 'app-google-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.scss'],
})
export class GoogleAuthComponent implements OnInit, AfterViewInit {
  @Input() buttonText: 'signin_with' | 'continue_with' = 'continue_with';
  @Input() context: 'signin' | 'signup' = 'signin';
  @Output() googleAuthSuccess = new EventEmitter<any>();
  @Output() googleAuthError = new EventEmitter<any>();

  constructor(private ngZone: NgZone) {

    window.google.accounts.id.renderButton(
      document.getElementById('google-auth-button'),
      {
        type: 'standard',
        size: 'large',
        text: this.buttonText,
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left',
      }
    );

  }

  ngOnInit(): void {}

 ngAfterViewInit(): void {
  setTimeout(() => {
    if (window.google) {
      this.initializeGoogleAuth();
    } else {
      this.retryGoogleInit();
    }
  });
}

private retryGoogleInit(attempts: number = 5): void {
  if (!attempts) {
    console.error('Google Identity Services failed to initialize.');
    return;
  }

  setTimeout(() => {
    if (window.google) {
      this.initializeGoogleAuth();
    } else {
      this.retryGoogleInit(attempts - 1);
    }
  }, 300);
}


  private initializeGoogleAuth(): void {
    window.handleCredentialResponse = (response: any) => {
      this.ngZone.run(() => {
        if (response.credential) {
          this.googleAuthSuccess.emit(response.credential);
        } else {
          this.googleAuthError.emit('No credential received.');
        }
      });
    };

    window.google.accounts.id.initialize({
      client_id:
        '353053747362-c0n27mj9jvj2h6bhu01b4r9fgn68vo46.apps.googleusercontent.com',
      callback: window.handleCredentialResponse,
      auto_select: false,
      context: this.context,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-auth-button'),
      {
        type: 'standard',
        size: 'large',
        text: this.buttonText,
        shape: 'rectangular',
        theme: 'outline',
        logo_alignment: 'left',
      }
    );
  }
}
