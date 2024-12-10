import { Component } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { IconComponent } from "@app/components/_global/icon/icon.component";

@Component({
  selector: 'app-footer',
  imports: [
    MatToolbar,
    IconComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  lastBuildDate = new Date();
}
