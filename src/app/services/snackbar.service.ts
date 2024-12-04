import {Component, Inject, Injectable} from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
  MatSnackBarRef
} from "@angular/material/snack-bar";
import {MatButtonModule} from "@angular/material/button";

@Component({
    template: `
    <span matSnackBarLabel>
      {{ data.message }}
    </span>
    <span matSnackBarActions>
        <button mat-button matSnackBarAction (click)="snackBarRef.dismissWithAction()">OK</button>
    </span>`,
    styles: `
    :host {
      display: flex;
    }`,
    imports: [
        MatSnackBarModule,
        MatButtonModule
    ]
})
class SnackbarComponent {
  constructor(
    protected snackBarRef: MatSnackBarRef<any>,
    @Inject(MAT_SNACK_BAR_DATA) protected data: any
  ) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(
    private snackbar: MatSnackBar
  ) {
  }

  info(message: string, options?: MatSnackBarConfig) {
    options = Object.assign(options || {}, {data: options?.data || {}});

    options.data.message = message;

    this.snackbar.openFromComponent(SnackbarComponent, options);
  }
}
