import { Component } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@app/components/_global/icon/icon.component";

@Component({
  selector: 'app-footer',
  imports: [
    MatToolbar,
    RouterLink,
    IconComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  lastBuildDate = new Date();
}
