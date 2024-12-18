import { Component, Inject, OnInit, Optional } from '@angular/core';
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { MAT_DIALOG_DATA, MatDialogContent } from "@angular/material/dialog";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { RoomListHeaderComponent } from "@app/components/room/list-header/room-list-header.component";
import { RoomService } from "@app/services/room.service";
import { PublicRoom } from "@common/room";
import { VotePub } from "@common/vote";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { RoomListComponent } from "@app/components/room/list/room-list.component";

@Component({
  selector: 'app-vote-detail',
  imports: [
    CommonModule,
    DialogHeaderComponent,
    MatDialogContent,
    MatTabGroup,
    MatTab,
    RoomListHeaderComponent,
    LoaderComponent,
    RoomListComponent
  ],
  templateUrl: './vote-detail.component.html',
  styleUrl: './vote-detail.component.scss'
})
export class VoteDetailComponent implements OnInit {
  // vote: VotePub;
  rooms?: PublicRoom[] = [];

  constructor(
    // @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private roomService: RoomService
  ) {
    // this.vote = data.vote;

    // console.log('VOTE ?', this.vote, data);
  }

  ngOnInit() {
    // this.roomService.getRooms({vote: this.vote.id}).subscribe(data => this.rooms = data);
  }
}
