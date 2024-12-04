import { Component, OnInit } from '@angular/core';
import { RoomService } from "@app/services/room.service";
import { PublicRoom } from "@common/room";
import { RoomListComponent } from "@app/components/room/list/room-list.component";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    RoomListComponent,
    LoaderComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  options: any;
  rooms?: PublicRoom[];

  canAddRoom = false;

  constructor(
    private roomService: RoomService,
    private matDialog: MatDialog,
    private authService: AuthService
  ) {
    // this.authService.currentUser$.subscribe(() => this.canAddRoom = this.authService.can(Role.ADD_ROOM));
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.roomService.getRooms().subscribe(rooms => this.rooms = rooms);
  }
}
