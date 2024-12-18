import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { RoomService } from "@app/services/room.service";
import { RoomListComponent } from "@app/components/room/list/room-list.component";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { PublicRoom } from "@common/room";
import { debounceTime, forkJoin, interval, map, Subject, Subscription, switchMap, tap } from "rxjs";
import { RoomListHeaderComponent } from "@app/components/room/list-header/room-list-header.component";
import { DialogService } from "@app/services/dialog.service";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { FooterComponent } from "@app/components/_layout/footer/footer.component";
import { RouterLink } from "@angular/router";
import { AuthService } from "@app/services/auth.service";
import { HeroBannerComponent } from "@app/components/hero-banner/hero-banner.component";
import { IconComponent } from '@app/components/_global/icon/icon.component';
import { VoteListHeaderComponent } from "@app/components/vote/list-header/vote-list-header.component";
import { VoteService } from "@app/services/vote.service";
import { VotePub } from "@common/vote";
import { VotesComponent } from "@app/pages/votes/votes.component";

const HOME_GRID_COUNT = 15;
const LIVE_RELOAD_TIMER_SEC = 10;

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    RoomListComponent,
    LoaderComponent,
    RoomListHeaderComponent,
    MatSlideToggle,
    FooterComponent,
    RouterLink,
    HeroBannerComponent,
    IconComponent,
    VoteListHeaderComponent,
    VotesComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  rooms?: PublicRoom[];
  votes?: VotePub[];

  liveReload?: Subscription;

  searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private voteService: VoteService,
    private dialogService: DialogService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      map(s => s?.trim()),
      switchMap(search => this.roomService.getRooms({search}))
    ).subscribe(rooms => this.rooms = rooms);
  }

  ngOnInit() {
    this.loadData().subscribe();

    // this.toggleAutoRefresh(true);
  }

  loadData() {
    return forkJoin([
      this.loadRooms(),
      this.loadVotes()
    ]);
  }

  loadRooms() {
    return this.roomService.getRooms({order: 'trending', count: HOME_GRID_COUNT}).pipe(
      tap(rooms => this.rooms = rooms)
    );
  }

  loadVotes() {
    return this.voteService.getAll({order: 'voteCount', count: HOME_GRID_COUNT}).pipe(
      tap(data => this.votes = data)
    );
  }

  toggleAutoRefresh(toggle = false) {
    this.liveReload?.unsubscribe();

    if (toggle) {
      this.liveReload = interval(LIVE_RELOAD_TIMER_SEC * 1000).pipe(
        switchMap(() => this.loadData())
      ).subscribe();
    }
  }

  createRoom() {
    if (!this.authService.hasRole('ADMIN')) {
      return;
    }

    this.dialogService.openRoomEdit().afterClosed().pipe(
      switchMap(() => this.loadData())
    ).subscribe();
  }

  createVote() {
    this.dialogService.openVoteEdit().afterClosed().subscribe(res => {
      if (res) {
        this.loadVotes().subscribe();
      }
    });
  }
}
