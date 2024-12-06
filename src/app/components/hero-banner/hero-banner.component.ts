import { Component, Input } from '@angular/core';
import { QuoteComponent } from "@app/components/quote/quote.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-hero-banner',
    imports: [
        QuoteComponent,
        RouterLink
    ],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss'
})
export class HeroBannerComponent {
  @Input() imageLink = '/';
}
