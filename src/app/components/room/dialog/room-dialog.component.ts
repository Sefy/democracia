import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { PublicRoom } from "@common/room";
import { MatButtonModule } from "@angular/material/button";
import { ChatboxComponent } from "@app/components/chatbox/chatbox.component";
import { CommonModule } from "@angular/common";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { Router } from "@angular/router";

@Component({
  selector: 'app-room-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    DialogHeaderComponent,
    MatDialogModule,
    ChatboxComponent,
    IconComponent
  ],
  templateUrl: './room-dialog.component.html',
  styleUrl: './room-dialog.component.scss'
})
export class RoomDialogComponent {
  room!: PublicRoom;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<any>,
    @Optional() @Inject(MAT_DIALOG_DATA) dialogData?: any
  ) {
    this.room = dialogData.room;
  }

  expandRoom() {
    const url = '/rooms/' + this.room.id;

    this.dialogRef.close();

    this.router.navigateByUrl(url);
  }
}
