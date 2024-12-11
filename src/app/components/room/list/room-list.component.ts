import { Component, EventEmitter, HostBinding, Input, OnChanges, Output } from '@angular/core';
import { PublicRoom } from "@common/room";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatTooltip } from "@angular/material/tooltip";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { TagListComponent } from "@app/components/tags/list/tag-list.component";
import { CardComponent } from "@app/components/_global/card/card.component";
import { CardHeaderComponent } from "@app/components/_global/card/header/card-header.component";
import { CardContentComponent } from "@app/components/_global/card/card-content/card-content.component";
import { DialogService } from "@app/services/dialog.service";

export interface RoomListOptions {
  grid?: boolean;
}

@Component({
  selector: 'app-room-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltip,
    IconComponent,
    TagListComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent
  ],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnChanges {
  @Input() rooms!: PublicRoom[];
  @Input() options?: RoomListOptions;

  @Output() needUpdate = new EventEmitter();

  @HostBinding('class.grid') isGrid?: boolean;

  constructor(
    private dialogService: DialogService
  ) {
  }

  openDetail(room: PublicRoom) {
    this.dialogService.openRoomDetail(room).afterClosed().subscribe(() => this.needUpdate.emit());
  }

  ngOnChanges() {
    this.isGrid = this.options?.grid;
  }
}
