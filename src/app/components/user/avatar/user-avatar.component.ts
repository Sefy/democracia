import { Component, HostBinding, Input } from '@angular/core';
import { UserData } from "@common/user";
import { RolePipe } from "@app/pipes/role.pipe";
import { NgIf } from "@angular/common";
import { CdkConnectedOverlay, CdkOverlayOrigin } from "@angular/cdk/overlay";

@Component({
  selector: 'app-user-avatar',
  imports: [
    RolePipe,
    NgIf,
    CdkOverlayOrigin,
    CdkConnectedOverlay
  ],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {
  @Input() user!: UserData;
  @Input() @HostBinding('class.no-hover') disableHover = false;

  isHover = false;

  toggleHover(toggle: boolean) {
    if (this.disableHover) {
      return;
    }

    this.isHover = toggle;
  }
}
