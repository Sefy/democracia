import {Component, Input} from '@angular/core';
import {MatDialogClose, MatDialogTitle} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {CommonModule, NgTemplateOutlet} from "@angular/common";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import { IconComponent } from "@app/components/_global/icon/icon.component";

@Component({
    selector: 'app-dialog-header',
  imports: [
    CommonModule,
    MatDialogClose,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    MatToolbar,
    NgTemplateOutlet,
    CdkDrag,
    CdkDragHandle,
    IconComponent
  ],
    templateUrl: './dialog-header.component.html',
    styleUrl: './dialog-header.component.scss'
})
export class DialogHeaderComponent {
  @Input() title?: string;
  @Input() icon?: string;
  @Input() noClose!: boolean;
  @Input() draggable = true;
}
