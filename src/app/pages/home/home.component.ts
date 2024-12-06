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
import { QuoteComponent } from "@app/components/quote/quote.component";
import { debounceTime, interval, map, Subject, Subscription, switchMap, tap } from "rxjs";
import { RoomListHeaderComponent } from "@app/components/room/list-header/room-list-header.component";
import { DialogService } from "@app/services/dialog.service";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { FooterComponent } from "@app/components/_layout/footer/footer.component";
import { RouterLink } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

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
    QuoteComponent,
    RoomListHeaderComponent,
    MatSlideToggle,
    FooterComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  rooms?: PublicRoom[];

  liveReload?: Subscription;

  searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
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
    return this.roomService.getRooms({order: 'trending', count: HOME_GRID_COUNT}).pipe(
      tap(rooms => this.rooms = rooms)
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
}
