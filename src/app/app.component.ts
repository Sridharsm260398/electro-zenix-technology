// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'; // Import Router events
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner'; // Import NgxSpinnerService
import { filter } from 'rxjs/operators'; // Import filter operator
import { CommonModule } from '@angular/common'; // Required for CommonModule
import { RouterOutlet } from '@angular/router'; // Required for RouterOutlet
import { NavbarComponent } from './components/navbar/navbar.component'; // Assuming this path
import { FooterComponent } from './components/footer/footer.component'; // Assuming this path
import { NgxSpinnerComponent } from 'ngx-spinner'; // Assuming this path
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // Indicates this is a standalone component
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    NgxSpinnerModule,
   // NgxSpinnerComponent, 
  ],
  providers: [], // Providers specific to this component if any
  templateUrl: './app.component.html', // Reference to your HTML template
  styleUrl: './app.component.scss', // Reference to your SCSS stylesheet
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'electro-zenix';
  showFooter = true;
  isAdminPage: boolean = false;
  isAuthenticated: boolean = false; // Property to track authentication status

  private authSubscription: Subscription | undefined;
  private crossTabLogoutSubscription: Subscription | undefined;
  private routerEventsSubscription: Subscription | undefined; // Subscription for router events

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService // Inject NgxSpinnerService
  ) {
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.spinner.show(); // Show spinner on navigation start
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.spinner.hide(); // Hide spinner on navigation end, cancel, or error
      }
    });
 // const userRole = this.authService.getCurrentRole();
  //this.isAdminPage = userRole === 'admin' ? true : false ;
  
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {  
        const hiddenRoutes = ['/login', '/signup', '/reset-password'];
        this.showFooter = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
  }
  
  get isAdmin(): boolean {
    const role = localStorage.getItem('role');
    return role === 'admin' || (Array.isArray(role) && role.includes('admin'))

  }
  ngOnInit(): void {
    // Initialize theme based on localStorage preference
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }

    this.authService.autoAuthUser();

    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (status: boolean) => {
        this.isAuthenticated = status;
      }
    );


    this.crossTabLogoutSubscription = this.authService.crossTabLogout$.subscribe(() => {
      this.snackBar.open('You have been logged out from another tab.', 'Dismiss', {
        duration: 5000, 
        panelClass: ['snackbar-error']
      });
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.crossTabLogoutSubscription?.unsubscribe();
    this.routerEventsSubscription?.unsubscribe();
  }

  // Methods to enable dark and light themes
  enableDark(): void {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
  }

  enableLight(): void {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  }
}
