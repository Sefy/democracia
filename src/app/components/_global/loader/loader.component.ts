import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-loader',
    imports: [
        CommonModule,
        MatProgressSpinner
    ],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit, OnDestroy {

  @HostBinding('class.overlay')
  @Input() overlay = false;

  @Input() size = 50;

  @Input() message?: string;

  initialParentPos?: string;

  constructor(
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    if (this.overlay) {
      const el = this.elementRef.nativeElement as HTMLElement;

      this.initialParentPos = getComputedStyle(el).position;
    }
  }

  ngOnDestroy() {
    if (this.overlay && this.initialParentPos) {
      const el = this.elementRef.nativeElement as HTMLElement;

      el.style.position = this.initialParentPos;
    }
  }

  get fontSize() {
    return Math.max(this.size / 6, 17);
  }
}
