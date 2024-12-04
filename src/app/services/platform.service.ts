import {HostListener, Injectable} from '@angular/core';
import {BehaviorSubject, debounceTime, filter, fromEvent, startWith, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  resize$ = fromEvent(window, 'resize').pipe(debounceTime(150));

  width = 0;
  height = 0;

  constructor() {
    this.resize$.pipe(
      startWith(null),
      tap(() => this.updateDimensions())
    ).subscribe();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}
