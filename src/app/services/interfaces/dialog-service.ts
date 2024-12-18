import { MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogConfig
} from "@app/components/_dialog/confirm-dialog/confirm-dialog.component";
import { PublicRoom, RoomData } from "@common/room";
import { VotePub } from "@common/vote";
import { InjectionToken } from "@angular/core";
import { RoomDialogComponent } from "@app/components/room/dialog/room-dialog.component";
import { RoomEditComponent } from "@app/components/room/edit/room-edit.component";
import { VoteEditComponent } from "@app/components/vote/edit/vote-edit.component";
import { VoteDetailComponent } from "@app/components/vote/detail/vote-detail.component";

export interface IDialogService {
  alert(message: string): void;

  confirm(config?: ConfirmDialogConfig | string, dialogConfig?: MatDialogConfig<ConfirmDialogConfig>): MatDialogRef<ConfirmDialogComponent>;

  openRoomDetail(room: PublicRoom): MatDialogRef<RoomDialogComponent>;

  openRoomEdit(room?: RoomData): MatDialogRef<RoomEditComponent>;

  openUsernamePrompt(username?: string): void;

  openVoteEdit(): MatDialogRef<VoteEditComponent>;

  openVoteDetail(vote: VotePub): MatDialogRef<VoteDetailComponent>;
}

export const DIALOG_SERVICE = new InjectionToken<IDialogService>('DIALOG_SERVICE');
