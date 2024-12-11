import { Component, HostBinding, Input } from '@angular/core';

type FlashType = 'warn' | 'error' | 'info';

@Component({
  selector: 'app-flash-message',
  imports: [],
  templateUrl: './flash-message.component.html',
  styleUrl: './flash-message.component.scss'
})
export class FlashMessageComponent {
  @Input() @HostBinding('attr.class') type: FlashType = 'info';
}
