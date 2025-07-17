// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'; // Import Router events
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { NgxSpinnerService } from 'ngx-spinner'; // Import NgxSpinnerService
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
    NgxSpinnerComponent, // Make sure NgxSpinnerComponent is imported if used directly in template
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
    // Logic for showing/hiding spinner during route changes
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

    // Logic for showing/hiding footer and determining admin page
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminPage = this.router.url.startsWith('/dashboard');
        const hiddenRoutes = ['/login', '/signup', '/reset-password'];
        this.showFooter = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
  }

  ngOnInit(): void {
    // Initialize theme based on localStorage preference
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }

    // Initiate auto-authentication on app startup.
    // This method handles checking existing tokens and navigating to the correct route.
    this.authService.autoAuthUser();

    // Subscribe to authentication status changes from AuthService to update UI
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (status: boolean) => {
        this.isAuthenticated = status;
      }
    );

    // Subscribe to cross-tab logout events to display a MatSnackBar notification
    this.crossTabLogoutSubscription = this.authService.crossTabLogout$.subscribe(() => {
      this.snackBar.open('You have been logged out from another tab.', 'Dismiss', {
        duration: 5000, // Snackbar will disappear after 5 seconds
        panelClass: ['snackbar-error'] // Custom CSS class for styling the snackbar
      });
    });
  }

  // Method to handle user logout
  onLogout(): void {
    this.authService.logout();
  }

  // Lifecycle hook to unsubscribe from observables and prevent memory leaks
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.crossTabLogoutSubscription?.unsubscribe();
    this.routerEventsSubscription?.unsubscribe(); // Unsubscribe from router events
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
