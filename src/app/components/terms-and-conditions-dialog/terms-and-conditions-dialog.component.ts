import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for ngFor, ngIf
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // For dialog
import { MatButtonModule } from '@angular/material/button'; // For buttons
import { MatIconModule } from '@angular/material/icon'; // For close icon

@Component({
  selector: 'app-terms-and-conditions-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="mat-dialog-title">
          <mat-icon class="header-icon">gavel</mat-icon>
          Terms and Conditions
        </h2>
        <button mat-icon-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <p class="intro-text">
          Welcome to our platform! Please take a moment to review our
          comprehensive Terms and Conditions. By accessing or using our
          services, you agree to be bound by these terms. This document outlines
          your rights and responsibilities, as well as ours.
        </p>

        <section class="section">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By creating an account or using our services, you affirm that you
            are of legal age and have read, understood, and agree to be bound by
            these Terms. If you do not agree, you must not use our services.
          </p>
        </section>

        <section class="section">
          <h3>2. User Accounts and Data</h3>
          <p>
            You are responsible for maintaining the confidentiality of your
            account information. You agree to provide accurate and complete
            information and to keep it updated. We process your data in
            accordance with our Privacy Policy.
          </p>
        </section>

        <section class="section">
          <h3>3. Intellectual Property</h3>
          <p>
            All content, trademarks, and data on this platform, including but
            not limited to text, graphics, logos, and software, are the property
            of our company or its licensors and are protected by intellectual
            property laws.
          </p>
        </section>

        <section class="section">
          <h3>4. Prohibited Conduct</h3>
          <p>
            You agree not to engage in any activity that is harmful, illegal, or
            violates the rights of others. This includes, but is not limited to,
            unauthorized access, data mining, or distribution of malware.
          </p>
        </section>

        <section class="section">
          <h3>5. Disclaimers and Limitation of Liability</h3>
          <p>
            Our services are provided "as is" without any warranties. We shall
            not be liable for any indirect, incidental, special, consequential,
            or punitive damages, including loss of profits, data, or goodwill.
          </p>
        </section>

        <section class="section">
          <h3>6. Changes to Terms</h3>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify you of any changes by posting the new Terms on this page.
            Your continued use of the services after such modifications
            constitutes your acknowledgment and agreement.
          </p>
        </section>

        <section class="section">
          <h3>7. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of [Your Country/State], without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section class="section">
          <h3>8. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at
            <a href="mailto:electro-zenix@tech.com"
              >electro-zenix&#64;tech.com</a
            >.
          </p>
        </section>
      </div>

      <div class="dialog-actions">
        <button mat-raised-button color="primary" (click)="onAgree()">
          <mat-icon>check_circle</mat-icon>
          I Agree
        </button>
        <button mat-raised-button (click)="onClose()">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }

      .dialog-container {
        background: linear-gradient(135deg,rgb(7, 7, 7),rgb(21, 22, 22),rgb(13, 13, 14));
        backdrop-filter: blur(14px) saturate(180%);
        -webkit-backdrop-filter: blur(14px) saturate(180%);
        color: #e8e8e8;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }

      .dialog-header {
     background: #000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 26px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.04);
      }

      .mat-dialog-title {
        font-size: 1.7em;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        background-image: linear-gradient(90deg, #00eaff, #ff00d4);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .header-icon {
        font-size: 1.5em;
        color: #00eaff;
      }

      .close-button {
        color: #bbb;
        padding: 4px;

        &:hover {
          color: #ff4b5c;
        }
      }

      .dialog-content {
        padding: 18px 28px;
        overflow-y: auto;
        flex-grow: 1;
        line-height: 1.55;
        font-size: 0.95em;
        color: #dcdcdc;
        background: linear-gradient(135deg,rgb(7, 7, 7),rgb(21, 22, 22),rgb(13, 13, 14));

      }

      .intro-text {
        margin-bottom: 20px;
        font-style: italic;
        font-weight: 400;
        font-size: 1.05em;
        background: linear-gradient(90deg, #00f5a0, #00d9f5, #8a2be2);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .section {
        margin-bottom: 5px;
        padding-bottom: 10px;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.08);

        &:last-child {
          border-bottom: none;
        }

        h3 {
          font-size: 1.25em;
          margin-bottom: 8px;
          background-image: linear-gradient(90deg, #00ff7f, #00e5ff, #00e77b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          //   text-shadow: 0 0 4px rgba(0, 255, 127, 0.4);
          font-weight: 600;
        }

        p {
          color: rgb(233, 229, 229);
        }

        a {
          color: #00cfff;
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 18px 28px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(135deg,rgb(7, 7, 7),rgb(21, 22, 22),rgb(13, 13, 14));

      }

      @media (max-width: 600px) {
        .dialog-header,
        .dialog-content,
        .dialog-actions {
          padding: 15px 20px;
        }
        .mat-dialog-title {
          font-size: 1.45em;
        }
        .section h3 {
          font-size: 1.05em;
        }
      }
      ::-webkit-scrollbar {
  width: 10px; 
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #2c2c2c;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: #555555; 
  border-radius: 5px; 
}

::-webkit-scrollbar-thumb:hover {
  background: #777777; 
}

::-webkit-scrollbar-corner {
  background: #1a1a1a; 
}

.mat-dialog-content::-webkit-scrollbar {
  width: 8px;
}

.mat-dialog-content::-webkit-scrollbar-track {
  background: #1c1c1c;
}

.mat-dialog-content::-webkit-scrollbar-thumb {
  background: #444444;
}

.mat-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #666666;
}

    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TermsAndConditionsDialogComponent>
  ) {}

  onAgree(): void {
    this.dialogRef.close(true);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
