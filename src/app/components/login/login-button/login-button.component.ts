import { Component, ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { AuthService } from "@app/services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "@app/components/login/login.component";
import { PublicUser } from "@common/user";
import { UserAvatarComponent } from "@app/components/user/avatar/user-avatar.component";

@Component({
  selector: 'app-login-button',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    UserAvatarComponent
  ],
  templateUrl: './login-button.component.html',
  styleUrl: './login-button.component.scss'
})
export class LoginButtonComponent {

  user?: PublicUser | null;

  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;

  constructor(
    private userService: AuthService,
    private matDialog: MatDialog
  ) {
    this.userService.currentUser$.subscribe(u => this.user = u);
  }

  preventMenuClose(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  onOpen() {
    const menuPanel = document.body.querySelector('.login-menu-panel');

    if (menuPanel && menuPanel.children[0]) {
      menuPanel.children[0].addEventListener('click', e => this.preventMenuClose(e));
    }
  }

  login() {
    this.matDialog.open(LoginComponent);

    if (this.trigger) {
      this.trigger.closeMenu();
    }
  }

  logout() {
    this.userService.logout().subscribe(res => console.log('Response : ', res));

    if (this.trigger) {
      this.trigger.closeMenu();
    }
  }
}
