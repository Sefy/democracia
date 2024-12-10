import { Component, HostBinding } from '@angular/core';
import { FooterComponent } from "@app/components/_layout/footer/footer.component";
import { HeroBannerComponent } from "@app/components/hero-banner/hero-banner.component";
import { PrezBlockComponent } from "@app/components/_global/prez-block/prez-block.component";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-about',
  imports: [
    FooterComponent,
    HeroBannerComponent,
    PrezBlockComponent,
    LoaderComponent,
    IconComponent,
    MatButton
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  @HostBinding('class.page-content') isPageContent = true;

  externalLinks = {
    discord: 'https://discord.gg/FrUZW4kQu6',
    github: 'https://github.com/Sefy/democracia',
    patreon: ''
  };

  openLink(type: 'github' | 'discord' | 'patreon') {
    const url = this.externalLinks[type];

    if (url) {
      window.open(url, '_blank');
    }
  }
}
