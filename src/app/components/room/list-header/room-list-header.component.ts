import { Component, EventEmitter, Output } from '@angular/core';
import { BaseInputComponent } from "@app/components/_form/base-input/base-input.component";
import { MatButtonModule } from "@angular/material/button";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { FormsModule } from "@angular/forms";
import { RoomService } from "@app/services/room.service";
import { HasRoleDirective } from "@app/directives/has-role.directive";

@Component({
  selector: 'app-room-list-header',
  imports: [
    BaseInputComponent,
    MatButtonModule,
    IconComponent,
    FormsModule,
    HasRoleDirective
  ],
  templateUrl: './room-list-header.component.html',
  styleUrl: './room-list-header.component.scss'
})
export class RoomListHeaderComponent {

  @Output() searchChange = new EventEmitter();
  @Output() createRoom = new EventEmitter();

  // searchSubject = new Subject<string>();
  //
  // filteredRooms$: Observable<PublicRoom[]> = this.searchSubject.pipe(
  //   debounceTime(300),
  //   map(s => s?.trim()),
  //   switchMap(search => {
  //     return search.length ? this.roomService.search(search) : of([] as any);
  //   })
  // );

  constructor(
    private roomService: RoomService
  ) {
  }

  // searchValueChange($event: any) {
  //   this.
  // }
}
