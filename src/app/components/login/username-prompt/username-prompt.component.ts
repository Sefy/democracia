import {Component, Output} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {AuthService} from "@app/services/auth.service";
import {CommonModule} from "@angular/common";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {LoaderComponent} from "@app/components/_global/loader/loader.component";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";

@Component({
    selector: 'app-username-prompt',
    imports: [
        CommonModule,
        MatFormField,
        MatInput,
        MatLabel,
        DialogHeaderComponent,
        MatDialogModule,
        MatButton,
        FormsModule,
        LoaderComponent
    ],
    templateUrl: './username-prompt.component.html',
    styleUrl: './username-prompt.component.scss'
})
export class UsernamePromptComponent {
  username = '';

  loading = false;

  constructor(
    private userService: AuthService,
    private matDialogRef: MatDialogRef<UsernamePromptComponent>,
  ) {
  }

  submit() {
    this.userService.setUsername(this.username).subscribe(res => {
      console.log('Res', res);

      if (res.ok) {
        this.matDialogRef.close();
      }
    })
  }
}
