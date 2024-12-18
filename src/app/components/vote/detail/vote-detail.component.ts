import { Component } from '@angular/core';
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { MatDialogContent } from "@angular/material/dialog";

@Component({
  selector: 'app-vote-detail',
  imports: [
    DialogHeaderComponent,
    MatDialogContent
  ],
  templateUrl: './vote-detail.component.html',
  styleUrl: './vote-detail.component.scss'
})
export class VoteDetailComponent {

}
