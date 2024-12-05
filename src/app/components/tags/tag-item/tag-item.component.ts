import { Component, EventEmitter, HostBinding, Input, OnChanges, Output } from '@angular/core';
import { TagData } from "@common/room";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { CommonModule } from "@angular/common";
import { MatTooltip } from "@angular/material/tooltip";
import color from 'color';

@Component({
  selector: 'app-tag-item',
  imports: [
    CommonModule,
    IconComponent,
    MatTooltip
  ],
  templateUrl: './tag-item.component.html',
  styleUrl: './tag-item.component.scss'
})
export class TagItemComponent implements OnChanges {
  @Input() tag!: TagData;
  @Input() delete?: boolean;

  @Output() onDelete = new EventEmitter();

  @HostBinding('style.background-color') backgroundColor?: string;
  @HostBinding('style.color') color?: string;

  ngOnChanges() {
    if (this.tag?.color) {
      this.backgroundColor = this.tag.color;
      this.color = color(this.backgroundColor).isLight() ? 'black' : 'white';
    }
  }
}
