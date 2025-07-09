// Angular Standalone Electro-Zenix Dashboard - Enhanced Fullscreen Layout with Fixed Widget Sizes

// ====== dashboard.component.ts ======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import type { EChartsOption } from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    NgxEchartsModule
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts,
      },
    },
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent {
  widgets = [
    { title: 'Total Users', icon: 'groups', type: 'metric', value: '2,540' },
    { title: 'Active Sessions', icon: 'access_time', type: 'metric', value: '183' },
    { title: 'New Signups', icon: 'person_add', type: 'metric', value: '57' },
    { title: 'Conversion Rate', icon: 'trending_up', type: 'metric', value: '3.24%' },
    {
      title: 'User Growth', icon: 'show_chart', type: 'chart',
      chartOptions: {
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [{ data: [120, 200, 150, 80, 70], type: 'line' }]
      }
    },
    {
      title: 'Device Usage', icon: 'pie_chart', type: 'chart',
      chartOptions: {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '60%',
          label: { color: '#fff' },
          data: [
            { value: 1048, name: 'Mobile' },
            { value: 735, name: 'Desktop' },
            { value: 580, name: 'Tablet' }
          ]
        }]
      }
    },
    {
      title: 'Server Load', icon: 'speed', type: 'chart',
      chartOptions: {
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          radius: '100%',
          pointer: { show: true },
          progress: { show: true, width: 18 },
          axisLine: { lineStyle: { width: 18, color: [[1, '#00ffc3']] } },
          detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20, color: '#fff' },
          data: [{ value: 68, name: 'Load' }]
        }]
      }
    },
    {
      title: 'Performance Trends', icon: 'stacked_line_chart', type: 'chart',
      chartOptions: {
        xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'], axisLine: { lineStyle: { color: '#fff' } } },
        yAxis: { axisLine: { lineStyle: { color: '#fff' } } },
        series: [{
          data: [820, 932, 901, 934],
          type: 'line',
          areaStyle: {},
          lineStyle: { color: '#00ffc3' }
        }]
      }
    },
    {
      title: 'System Logs', icon: 'list_alt', type: 'logs',
      logs: ['Server restarted', 'DB backup completed', 'New deployment']
    },
    {
      title: 'Recent Activity', icon: 'notifications', type: 'logs',
      logs: ['User Sridhar logged in', 'Admin updated pricing', 'New user signup']
    }
  ];
}
