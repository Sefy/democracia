import { Component } from '@angular/core';
import { RoomService } from "@app/services/room.service";
import { ActivatedRoute } from "@angular/router";
import { PublicRoom } from "@common/room";
import { ChatboxComponent } from "@app/components/chatbox/chatbox.component";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-room-detail',
  imports: [
    CommonModule,
    ChatboxComponent,
    LoaderComponent
  ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss'
})
export class RoomDetailComponent {

  room?: PublicRoom;

  constructor(
    private roomService: RoomService,
    private currentRoute: ActivatedRoute
  ) {
    const id = +(currentRoute.snapshot.paramMap.get('id') ?? 0);

    if (!id) {
      // ou bien redirect ...
      throw new Error('no id ?');
    }

    this.roomService.getDetail(id).subscribe(room => this.room = room);
  }
}
