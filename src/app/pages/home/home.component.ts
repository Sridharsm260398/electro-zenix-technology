import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import AOS from 'aos';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NzCarouselModule, NzIconModule, MatIconModule, MatTabsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  data: any;
  marqueeText: string[] = [];
  activeSlide: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    AOS.init({ duration: 1000 });

    this.data = {
      heroIntro: {
        welcome: 'Welcome to Electro Zenix Technology',
        tagline: 'Where Tech Sparks Vision',
        description: 'Your trusted partner in advanced electrical, electronic, and multi-domain technology solutions. We provide high-quality manpower support, technical services, and industrial product supplies across sectors including R&D, defense, and infrastructure.',
        highlights: [
          '100+ Projects Delivered',
          'PAN India Service',
          'Trusted by Government & Private Sectors',
          '24/7 Support Availability'
        ],
        background: 'assets/img/bg-glass-dark.jpg'
      },
      marquee: '⚡ Smart Systems • 🤖 AI Meets IoT • 🧠 Embedded Brilliance • 🚀 Electro Zenix Tech • 📡 Connectivity Solutions • 💡 Intelligent Design',
      heroSlides: [
        { image: 'assets/img/img2.jpeg', title: 'Next-Gen Electronics', subtitle: 'Engineering intelligence into every product.', cta: 'Explore Products' },
        { image: 'assets/img/img1.jpeg', title: 'Smart Automation', subtitle: 'Redefining embedded control and connectivity.', cta: 'See Use Cases' },
        { image: 'assets/img/img9.jpeg', title: 'Power of AI + IoT', subtitle: 'Bridging the future with intelligent solutions.', cta: 'Learn More' },
        { image: 'assets/img/img12.jpeg', title: 'Custom Hardware Design', subtitle: 'Tailored boards, firmware & system integration.', cta: 'Start Building' },
        { image: 'assets/img/img11.jpeg', title: 'Industrial Grade Builds', subtitle: 'Endurance-tested designs for critical industries.', cta: 'Get a Quote' }
      ],
      features: [
        { icon: 'memory', title: 'Embedded Firmware', desc: 'Custom microcontroller programming with real-time OS support.' },
        { icon: 'sensors', title: 'IoT Sensors', desc: 'Smart environmental and industrial sensors with wireless capabilities.' },
        { icon: 'bolt', title: 'Power Optimization', desc: 'Ultra-low power design for battery-operated devices.' },
        { icon: 'router', title: 'Connectivity', desc: 'Seamless integration with WiFi, BLE, LoRa & cellular.' },
        { icon: 'construction', title: 'Hardware Prototyping', desc: 'Rapid prototyping using 3D PCBs and custom enclosures.' },
        { icon: 'build', title: 'Industrial Design', desc: 'Smart and ergonomic enclosures for modern devices.' }
      ],
      categories: [
        { title: 'Consumer Electronics', description: 'Wearables, smart appliances, health monitors, smart remotes.' },
        { title: 'Industrial IoT', description: 'Sensor nodes, gateways, PLC integration, remote diagnostics.' },
        { title: 'Smart Home', description: 'Home automation, lighting, security, energy monitoring.' },
        { title: 'Medical Devices', description: 'Vitals monitors, diagnostic tools, embedded patient care tech.' }
      ],
      testimonials: [
        { quote: 'Electro Zenix turned our sketch into a market-ready IoT controller in 60 days!', author: 'Manish Rao, CTO at InduSense' },
        { quote: 'The firmware support and PCB precision was top-notch.', author: 'Divya Shekar, Embedded Lead - FarmBot' },
        { quote: 'We integrated Alexa with our security sensors thanks to EZ\'s protocol stack.', author: 'Nikhil M., SmartSafe Pvt Ltd' },
        { quote: 'Our startup\'s first medical prototype came alive thanks to Electro Zenix.', author: 'Dr. Anita P, BioQuant Labs' }
      ]
    };

    this.marqueeText = this.data.marquee.split('•');
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  nextSlide(): void {
    if (this.data?.heroSlides?.length) {
      this.activeSlide = (this.activeSlide + 1) % this.data.heroSlides.length;
    }
  }

  prevSlide(): void {
    if (this.data?.heroSlides?.length) {
      this.activeSlide = (this.activeSlide - 1 + this.data.heroSlides.length) % this.data.heroSlides.length;
    }
  }
}
