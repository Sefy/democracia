import { Component, HostBinding, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

export type IconType = 'mat' | 'fa' | 'fas' | 'fab';

@Component({
  selector: 'app-icon',
  imports: [
    MatIcon,
    FaIconComponent
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() icon?: string|any;
  @Input() type: IconType = 'mat'; // IconType ?
  @Input() @HostBinding('style.--icon-size') size?: string;
}
