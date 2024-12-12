import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogState } from "@angular/material/dialog";
import { PublicRoom, RoomData } from "@common/room";
import { RoomDialogComponent } from "@app/components/room/dialog/room-dialog.component";
import { ErrorDialogComponent } from "@app/components/_dialog/error-dialog/error-dialog.component";
import { RoomEditComponent } from "@app/components/room/edit/room-edit.component";
import { UsernamePromptComponent } from "@app/components/login/username-prompt/username-prompt.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogConfig
} from "@app/components/_dialog/confirm-dialog/confirm-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  errorDialogRef?: MatDialogRef<ErrorDialogComponent>;

  constructor(
    private matDialog: MatDialog
  ) {
  }

  alert(message: string) {
    if (!this.errorDialogRef || this.errorDialogRef.getState() === MatDialogState.CLOSED) {
      this.errorDialogRef = this.matDialog.open(ErrorDialogComponent);
    }

    this.errorDialogRef.componentInstance.addMessage(message);
  }

  confirm(config?: ConfirmDialogConfig | string, dialogConfig?: MatDialogConfig<ConfirmDialogConfig>) {
    config = typeof config === 'string' ? {message: config} : config;

    dialogConfig = dialogConfig ?? {};
    dialogConfig.data = config;

    return this.matDialog.open(ConfirmDialogComponent, dialogConfig);
  }

  openRoomDetail(room: PublicRoom) {
    return this.matDialog.open(RoomDialogComponent, {
      data: {room},
      minWidth: '40vw',
      panelClass: 'room-dialog'
    });
  }

  openRoomEdit(room?: RoomData) {
    return this.matDialog.open(RoomEditComponent, {
      data: {room},
      minWidth: '600px'
    });
  }

  openUsernamePrompt(username?: string) {
    this.matDialog.open(UsernamePromptComponent, {
      data: {username},
      disableClose: true,
      minWidth: 350
    });
  }
}
