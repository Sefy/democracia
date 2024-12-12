import { Component, EventEmitter, Output } from '@angular/core';
import { BaseInputComponent } from "@app/components/_form/base-input/base-input.component";
import { HasRoleDirective } from "@app/directives/has-role.directive";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { MatButton } from "@angular/material/button";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-vote-list-header',
  imports: [
    BaseInputComponent,
    HasRoleDirective,
    IconComponent,
    MatButton,
    FormsModule
  ],
  templateUrl: './vote-list-header.component.html',
  styleUrl: './vote-list-header.component.scss'
})
export class VoteListHeaderComponent {
  @Output() searchChange = new EventEmitter();
  @Output() create = new EventEmitter();
}
