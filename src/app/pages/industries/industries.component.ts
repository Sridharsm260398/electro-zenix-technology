import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-industries',
  imports: [MatIconModule,CommonModule,RouterModule],
  templateUrl: './industries.component.html',
  styleUrl: './industries.component.scss'
})
export class IndustriesComponent {
industryData = [
    {
      title: 'Healthcare',
      image: 'assets/img/img1.jpeg',
      description: 'Smart diagnostics, wearables, and AI health solutions.',
      points: ['Remote Monitoring', 'IoT Devices', 'Smart Hospitals']
    },
    {
      title: 'Automotive',
      image: 'assets/img/img15.jpg',
      description: 'Next-gen vehicle systems, smart dashboards, EV support.',
      points: ['ADAS Systems', 'EV Controls', 'Infotainment Modules']
    },
    {
      title: 'Retail',
      image: 'assets/img/img16.jpeg',
      description: 'AI-powered kiosks, POS systems, and customer insights.',
      points: ['POS Terminals', 'Smart Kiosks', 'Retail Analytics']
    },
    {
      title: 'Agriculture',
      image: 'assets/img/img18.jpeg',
      description: 'Precision farming, soil monitoring, and smart irrigation.',
      points: ['Drone Sensing', 'Moisture Analytics', 'Yield AI Insights']
    },
    {
      title: 'Energy',
      image: 'assets/img/img19.jpeg',
      description: 'Renewables, MPPTs, smart metering and green tech.',
      points: ['Solar Automation', 'Smart Grid', 'Environmental Sensors']
    },
    {
      title: 'Industrial Automation',
      image: 'assets/img/img21.jpeg',
      description: 'PLC integration, SCADA and predictive analytics.',
      points: ['Sensor Fusion', 'Robotic Control', 'ML Fault Detection']
    }
  ];
}
