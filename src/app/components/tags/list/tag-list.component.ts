import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { TagData } from "@common/room";
import { TagItemComponent } from "@app/components/tags/tag-item/tag-item.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-tag-list',
  imports: [
    CommonModule,
    TagItemComponent,
    FormsModule
  ],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss'
})
export class TagListComponent {
  @Input() tags?: TagData[];
  @Input() label?: string;
  @Input() delete?: boolean;

  @Output() onDelete = new EventEmitter();
}
