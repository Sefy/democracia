import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
  template: `
    <app-dialog-header title="Erreur"/>

    <mat-dialog-content>
      <div style="font-weight: 500">Des erreurs se sont produites :</div>

      <ul>
        <li *ngFor="let message of messages">{{ message }}</li>
      </ul>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button mat-dialog-close>OK</button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      app-dialog-header {
        background: var(--mat-sys-error);
        color: var(--mat-sys-on-error);

        ::ng-deep mat-toolbar {
          background: none;
          color: inherit;
          margin-bottom: 0;

          button {
            color: inherit;
          }
        }
      }
    }
  `,
  imports: [
    CommonModule,
    DialogHeaderComponent,
    MatDialogModule,
    MatButtonModule
  ]
})
export class ErrorDialogComponent {
  messages: string[] = [];

  addMessage(message: string) {
    this.messages.push(message);
  }
}
