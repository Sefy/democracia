import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";

interface OverlayOptions {
  color?: string;
  style?: string;
}

@Component({
  selector: 'app-prez-block',
  imports: [
    CommonModule
  ],
  templateUrl: './prez-block.component.html',
  styleUrl: './prez-block.component.scss'
})
export class PrezBlockComponent {
  @Input() blockTitle?: string;
  @Input() overlay?: OverlayOptions;
}
