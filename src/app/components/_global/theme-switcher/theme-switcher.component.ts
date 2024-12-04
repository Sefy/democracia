import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { FormsModule } from "@angular/forms";
import { ThemeService } from "@app/services/theme.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-theme-switcher',
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    AsyncPipe
  ],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  constructor(
    protected themeService: ThemeService
  ) { }
}
