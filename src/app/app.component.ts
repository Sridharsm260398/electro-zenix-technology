import { Component } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    NgxSpinnerComponent,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'electro-zenix';
  showFooter = true;
  isAdminPage: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminPage = this.router.url.startsWith('/dashboard');
        const hiddenRoutes = ['/login', '/signup', '/reset-password'];
        this.showFooter = !hiddenRoutes.includes(event.urlAfterRedirects);
      });

    //    this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     this.spinner.show();
    //   } else if (
    //     event instanceof NavigationEnd ||
    //     event instanceof NavigationCancel ||
    //     event instanceof NavigationError
    //   ) {
    //    this.spinner.hide()
    //   }
    // });
  }
  ngOnInit() {
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 1300);
    //   window.addEventListener('storage', (event) => {
    //   if (event.key === 'auth' && event.newValue === 'false') {
    //     this.authService.logout();
    //   }
    // })
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.add('light-theme');
  }
    const redirectUrl =
      localStorage.getItem('role') === 'admin' ? '/dashboard' : '/home';
    this.router.navigate([redirectUrl]);
    this.authService.autoAuthUser();
  }
}
