import { Component, OnInit } from '@angular/core';
import { RoomService } from "@app/services/room.service";
import { PublicRoom } from "@common/room";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RoomListHeaderComponent } from "@app/components/room/list-header/room-list-header.component";
import { DialogService } from "@app/services/dialog.service";
import { RoomListComponent, RoomListOptions } from "@app/components/room/list/room-list.component";

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    LoaderComponent,
    MatButtonModule,
    MatIconModule,
    RoomListHeaderComponent,
    RoomListComponent
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  listOptions: RoomListOptions = {};
  rooms?: PublicRoom[];

  constructor(
    private roomService: RoomService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.roomService.getRooms().subscribe(rooms => this.rooms = rooms);
  }

  createRoom() {
    this.dialogService.openRoomEdit();
  }
}
