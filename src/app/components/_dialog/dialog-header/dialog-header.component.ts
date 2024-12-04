import {Component, Input} from '@angular/core';
import {MatDialogClose, MatDialogTitle} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {CommonModule, NgTemplateOutlet} from "@angular/common";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";

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
        CdkDragHandle
    ],
    templateUrl: './dialog-header.component.html',
    styleUrl: './dialog-header.component.scss'
})
export class DialogHeaderComponent {
  @Input() title?: string;
  @Input() noClose!: boolean;
  @Input() draggable = true;
}
