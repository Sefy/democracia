import { Component } from '@angular/core';
import { FooterComponent } from "@app/components/_layout/footer/footer.component";

@Component({
  selector: 'app-about',
  imports: [
    FooterComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
