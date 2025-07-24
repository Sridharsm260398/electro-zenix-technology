import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    NzInputModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    CommonModule,
    NzIconModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  searchTerm = '';
  isDark = false;
  mobileMenu = false;


  constructor(private authService: AuthService, private themeService: ThemeService) {}
   ngOnInit(): void {
    this.isDark = this.themeService.isDark();
  }
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticatedStatus();
  }
  get isAdmin(): boolean {
    const role = localStorage.getItem('role');
    return role === 'admin' || (Array.isArray(role) && role.includes('admin'))

  }
 

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDark();
  }

  toggleMobileMenu() {
    this.mobileMenu = !this.mobileMenu;
  }
  isMenuOpen = false;

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    //localStorage.removeItem('auth');
    this.authService.logout()
   
  }
}
