import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { AuthService } from '../../auth/auth.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ThemeService } from '../../shared/theme.service';
import {  MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzSelectModule,
    NzDropDownModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isCollapsed = false;
  userName = 'Admin'; // Replace with dynamic name if available
  currentTime = signal(new Date());
  isDark: any
  constructor(private authService: AuthService, private themeService: ThemeService) {}

  ngOnInit() {
        this.isDark = this.themeService.isDark();

    setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDark();
  }

  logout() {
   this.authService.logout();
  }
}
