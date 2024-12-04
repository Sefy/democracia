import { Component, Inject, Optional } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { RoomService } from "@app/services/room.service";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { PublicRoom } from "@common/room";
import { BaseInputComponent } from "@app/components/_form/base-input/base-input.component";
import { TagSelectorComponent } from "@app/components/tags/tag-selector/tag-selector.component";

@Component({
  selector: 'app-room-edit',
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DialogHeaderComponent,
    LoaderComponent,
    BaseInputComponent,
    ReactiveFormsModule,
    TagSelectorComponent
  ],
  templateUrl: './room-edit.component.html',
  styleUrl: './room-edit.component.scss'
})
export class RoomEditComponent {
  room?: PublicRoom;

  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    tags: [[]]
  });

  loading = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    @Optional() private dialogRef: MatDialogRef<RoomEditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: { room?: PublicRoom }
  ) {
    this.room = dialogData?.room ?? ({} as PublicRoom);

    if (this.room) {
      this.form.patchValue(this.room as any);
    }

    this.form.valueChanges.subscribe(vc => console.log('Value changes', vc));
  }

  submit(e: Event) {
    e.preventDefault();

    this.loading = true;

    // @TODO: catch error, etc
    this.roomService.createRoom(this.form.value as any).subscribe(() => {
      this.loading = false;
      this.dialogRef.close(true);
    });
  }
}
