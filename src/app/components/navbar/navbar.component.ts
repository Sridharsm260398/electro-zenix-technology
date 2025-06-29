import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
    NzIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchTerm = '';
  isDark = false;
  mobileMenu = false;

  auth = {
    isAuthenticated: () => localStorage.getItem('auth') === 'true'
  };

  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-theme', this.isDark);
  }

  toggleMobileMenu() {
    this.mobileMenu = !this.mobileMenu;
  }
    isMenuOpen = false;

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('auth');
    window.location.href = '/login';
  }
}
