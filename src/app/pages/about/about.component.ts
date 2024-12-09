import { Component, HostBinding } from '@angular/core';
import { FooterComponent } from "@app/components/_layout/footer/footer.component";
import { HeroBannerComponent } from "@app/components/hero-banner/hero-banner.component";
import { PrezBlockComponent } from "@app/components/_global/prez-block/prez-block.component";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";

@Component({
  selector: 'app-about',
  imports: [
    FooterComponent,
    HeroBannerComponent,
    PrezBlockComponent,
    LoaderComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  @HostBinding('class.page-content') isPageContent = true;
}
