import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { AuthService } from "@app/services/auth.service";
import { SnackbarService } from "@app/services/snackbar.service";
import { LoginData } from "@common/user";
import { filter, first, interval, map, startWith } from "rxjs";
import { env } from "../../../environments/env";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatSlideToggleModule,
    DialogHeaderComponent,
    LoaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {

  form = this.fb.group({
    name: '',
    password: '',
    register: false,
    email: '',
  });

  showPassword = false;

  errors?: string[];

  loading = false;

  @ViewChild('googleButtonContainer') googleButtonContainer!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private userService: AuthService,
    private matDialogRef: MatDialogRef<any>,
    private snackbarService: SnackbarService
  ) {
  }

  ngAfterViewInit() {
    this.waitForGoogleApi().subscribe(() => this.showGoogleAuthButton());
  }

  showGoogleAuthButton() {
    google.accounts.id.initialize({
      client_id: env.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleAuth(response)
    });

    google.accounts.id.renderButton(
      this.googleButtonContainer.nativeElement,
      {
        type: 'standard',
        size: "large",
        shape: "pill"
      }  // customization attributes
    );
  }

  waitForGoogleApi() {
    console.log('Google ?', google);

    return interval(500).pipe(
      startWith(null),
      map(() => google),
      filter(g => !!g),
      first()
    );
  }

  submit() {
    console.log('Form value : ', this.form.value);

    this.userService.login(this.form.value as LoginData).subscribe(res => {
      if (res.ok) {
        this.matDialogRef.close();
        this.snackbarService.info(`Bienvenue ${res.user?.username} !`, {duration: 2500});
      }

      // always refresh
      this.errors = res.errors;
    });
  }

  handleGoogleAuth(googleResp: google.accounts.id.CredentialResponse) {
    const jwt = googleResp.credential;

    const userData = this.parseJwt(jwt);

    // show loader
    this.loading = true;

    // send token to back (should :
    // - [verify its integrity ?]
    // - check user exist, or create if not
    // - [store token ? maybe let us generate home tokens ?]
    this.userService.loginWithGoogleAuth(jwt).subscribe(res => {
      this.loading = false;

      console.log('Response : ', res);

      if (res.token) {
        // le JWT généré par le back, qu'on doit trimballer partout !
        this.userService.currentToken = res.token;
        this.userService.loadUser().subscribe();
      }
    });

    // ask for a username if not already exists ?
  }

  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  // Si préfère un jour afficher mon propre bouton plutôt que celui intégré by Google ...

  //   // this.googleAuthClient  = google.accounts.oauth2.initTokenClient({
  //   //   client_id: env.GOOGLE_CLIENT_ID,
  //   //   callback: (resp: any) => this.handleGoogleAuth(resp),
  //   //   scope: 'email'
  //   // });

  // startGoogleAuth() {
  //   this.googleAuthClient?.requestAccessToken();
  // }
}
