import { Component } from '@angular/core';
import { FooterComponent } from "@app/components/_layout/footer/footer.component";
import { HeroBannerComponent } from "@app/components/hero-banner/hero-banner.component";

@Component({
  selector: 'app-about',
  imports: [
    FooterComponent,
    HeroBannerComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
