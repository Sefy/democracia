import { Component, EventEmitter, Output } from '@angular/core';
import { LoginButtonComponent } from "@app/components/login/login-button/login-button.component";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbar } from "@angular/material/toolbar";
import { ThemeSwitcherComponent } from "@app/components/_global/theme-switcher/theme-switcher.component";

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    LoginButtonComponent,
    MatToolbar,
    ThemeSwitcherComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() toggleSideNav = new EventEmitter();
}
