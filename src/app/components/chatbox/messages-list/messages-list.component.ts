import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ClientRoomMessage } from "@app/services/chat.service";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMiniFabAnchor } from "@angular/material/button";
import { AuthService } from "@app/services/auth.service";
import { UserAvatarComponent } from "@app/components/user/avatar/user-avatar.component";

@Component({
  selector: 'app-messages-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMiniFabAnchor,
    UserAvatarComponent
  ],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss'
})
export class MessagesListComponent {
  // check plus haut que pas null
  @Input() messages!: ClientRoomMessage[];


  @Output() onLike = new EventEmitter<ClientRoomMessage>();

  constructor(
    protected userService: AuthService
  ) {
  }

  like(message: ClientRoomMessage) {
    if (this.userService.isLogged) {
      this.onLike.emit(message);
    }
  }
}
