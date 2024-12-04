import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from "@angular/material/dialog";
import { PublicRoom, RoomData } from "@common/room";
import { RoomDialogComponent } from "@app/components/room/dialog/room-dialog.component";
import { ErrorDialogComponent } from "@app/components/_dialog/error-dialog/error-dialog.component";
import { RoomEditComponent } from "@app/components/room/edit/room-edit.component";

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

  openRoomDetail(room: PublicRoom) {
    return this.matDialog.open(RoomDialogComponent, {
      data: {room},
      minWidth: '40vw'
    });
  }

  openRoomEdit(room?: RoomData) {
    return this.matDialog.open(RoomEditComponent, {
      data: {room},
      minWidth: '600px'
    });
  }
}
