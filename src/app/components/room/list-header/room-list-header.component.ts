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
}
