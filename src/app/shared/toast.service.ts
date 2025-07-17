import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}
  // ====== Basic Toasts ======
  success(msg: string, duration = 3000): void {
    this.message.success(msg, { nzDuration: duration });
  }

  error(msg: string, duration = 3000): void {
    this.message.error(msg, { nzDuration: duration });
  }

  warning(msg: string, duration = 5000): void {
    this.message.warning(msg, { nzDuration: duration });
  }

  info(msg: string, duration = 3000): void {
    this.message.info(msg, { nzDuration: duration });
  }

  loading(msg: string, duration = 0): void {
    this.message.loading(msg, { nzDuration: duration });
  }

  // ====== Rich Notifications ======
  notifySuccess(title: string, description: string = '', duration = 4500): void {
  this.notification.success(
    title || 'Success',
    description || title,
    { nzDuration: duration, nzStyle: this.getStyle('success') }
  );
}

notifyError(title: string, description: string = '', duration = 4500): void {
  this.notification.error(
    title || 'Error',
    description || title,
    { nzDuration: duration, nzStyle: this.getStyle('error') }
  );
}

notifyInfo(title: string, description: string = '', duration = 4500): void {
  this.notification.info(
    title || 'Info',
    description || title,
    { nzDuration: duration, nzStyle: this.getStyle('info') }
  );
}

notifyWarning(title: string, description: string = '', duration = 4500): void {
  this.notification.warning(
    title || 'Warning',
    description || title,
    { nzDuration: duration, nzStyle: this.getStyle('warning') }
  );
}

private getStyle(type: 'success' | 'error' | 'info' | 'warning'): Partial<CSSStyleDeclaration> {
  const baseStyle = {
    color: '#fff',
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(18, 18, 28, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '15px',
    lineHeight: '1.6',
  };

  const typeColors: Record<'success' | 'error' | 'info' | 'warning', { borderLeft: string }> = {
    success: { borderLeft: '5px solid #00ff95' },
    error: { borderLeft: '5px solid #ff4d4f' },
    info: { borderLeft: '5px solid #4096ff' },
    warning: { borderLeft: '5px solid #ffc53d' },
  };

  return { ...baseStyle, ...typeColors[type] };
}


  clearAll(): void {
    this.message.remove();
    this.notification.remove(); 
  }
}
