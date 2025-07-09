/* import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  @Input() isLoading: boolean = false;
} */
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { SpinnerSeLoadingServicervice } from '../../shared/spin.service';
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  isLoading = false;
  // constructor(private spinnerService: SpinnerService) {}
  // ngOnInit() {
  //   this.spinnerService.isLoading.subscribe((loading: boolean) => {
  //     this.isLoading = loading;
  //   });
  // }
}
